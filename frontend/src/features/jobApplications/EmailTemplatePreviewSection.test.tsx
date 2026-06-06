import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmailTemplatePreviewSection } from "./EmailTemplatePreviewSection";
import {
  getEmailTemplates,
  previewEmailTemplate,
} from "../../api/emailTemplatesApi";
import type { EmailTemplate } from "../../types/emailTemplate";

vi.mock("../../api/emailTemplatesApi", () => ({
  getEmailTemplates: vi.fn(),
  previewEmailTemplate: vi.fn(),
}));

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EmailTemplatePreviewSection jobApplicationId="app-1" />
    </QueryClientProvider>
  );
}

const templates: EmailTemplate[] = [
  {
    id: "template-1",
    name: "Follow-up Template",
    type: 0,
    subject: "Following up on {{JobTitle}}",
    body: "Hi, I wanted to follow up with {{CompanyName}}.",
    createdAt: "2026-05-20T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
];

const preview = {
  subject: "Following up on Backend Developer",
  body: "Hi, I wanted to follow up with Microsoft.",
};

const writeTextMock = vi.fn();

describe("EmailTemplatePreviewSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getEmailTemplates).mockResolvedValue(templates);
    vi.mocked(previewEmailTemplate).mockResolvedValue(preview);

    writeTextMock.mockReset();
    writeTextMock.mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  it("renders email template selector", async () => {
    renderSection();

    expect(
      screen.getByRole("heading", { name: /email template preview/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByLabelText(/choose template/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/follow-up template/i)).toBeInTheDocument();
  });

  it("previews selected email template", async () => {
    const user = userEvent.setup();

    renderSection();

    await user.selectOptions(
      await screen.findByLabelText(/choose template/i),
      "template-1"
    );

    expect(previewEmailTemplate).toHaveBeenCalledWith("template-1", "app-1");

    expect(
      await screen.findByText(/following up on backend developer/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/hi, i wanted to follow up with microsoft/i)
    ).toBeInTheDocument();
  });

  it("copies preview to clipboard and shows success message", async () => {
    const user = userEvent.setup();

    renderSection();

    await user.selectOptions(
      await screen.findByLabelText(/choose template/i),
      "template-1"
    );

    expect(
      await screen.findByText(/following up on backend developer/i)
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", { name: /copy to clipboard/i })
    );

    expect(
      await screen.findByText(/template copied to clipboard/i)
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no templates", async () => {
    vi.mocked(getEmailTemplates).mockResolvedValue([]);

    renderSection();

    expect(
      await screen.findByText(/no email templates yet/i)
    ).toBeInTheDocument();
  });

  it("shows error state when templates fail to load", async () => {
    vi.mocked(getEmailTemplates).mockRejectedValue(new Error("Failed"));

    renderSection();

    expect(
      await screen.findByText(/failed to load email templates/i)
    ).toBeInTheDocument();
  });

  it("shows error state when preview fails to load", async () => {
    const user = userEvent.setup();

    vi.mocked(previewEmailTemplate).mockRejectedValue(new Error("Failed"));

    renderSection();

    await user.selectOptions(
      await screen.findByLabelText(/choose template/i),
      "template-1"
    );

    expect(
      await screen.findByText(/failed to preview template/i)
    ).toBeInTheDocument();
  });
});