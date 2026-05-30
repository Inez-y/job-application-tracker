import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmailTemplatesPage } from "./EmailTemplatesPage";
import type { EmailTemplate } from "../types/emailTemplate";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
} from "../api/emailTemplatesApi";

vi.mock("../api/emailTemplatesApi", () => ({
  getEmailTemplates: vi.fn(),
  createEmailTemplate: vi.fn(),
  updateEmailTemplate: vi.fn(),
  deleteEmailTemplate: vi.fn(),
}));

function renderPage() {
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
      <EmailTemplatesPage />
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
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

describe("EmailTemplatesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getEmailTemplates).mockResolvedValue(templates);
    vi.mocked(createEmailTemplate).mockResolvedValue({
        id: "template-2",
        name: "New Template",
        type: 0,
        subject: "New Subject",
        body: "New Body",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    } satisfies EmailTemplate);
    vi.mocked(updateEmailTemplate).mockResolvedValue({
      ...templates[0],
      name: "Updated Template",
    });
    vi.mocked(deleteEmailTemplate).mockResolvedValue(undefined);
  });

  it("renders saved email templates", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: /email templates/i })
    ).toBeInTheDocument();

    expect(await screen.findByText(/follow-up template/i)).toBeInTheDocument();
    expect(screen.getByText(/following up on/i)).toBeInTheDocument();
  });

  it("creates an email template", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(screen.getByLabelText(/template name/i), "Thank You");
    await user.selectOptions(screen.getByLabelText(/type/i), "1");
    await user.type(screen.getByLabelText(/subject/i), "Thank you");
    await user.type(screen.getByLabelText(/body/i), "Thank you for your time.");

    await user.click(screen.getByRole("button", { name: /create template/i }));

    await waitFor(() => {
      expect(createEmailTemplate).toHaveBeenCalledWith({
        name: "Thank You",
        type: 1,
        subject: "Thank you",
        body: "Thank you for your time.",
      });
    });
  });

  it("inserts placeholder into the focused subject field", async () => {
    const user = userEvent.setup();

    renderPage();

    const subjectInput = screen.getByLabelText(/subject/i);

    await user.click(subjectInput);
    await user.click(screen.getByRole("button", { name: /job title/i }));

    expect(subjectInput).toHaveValue("{{JobTitle}}");
  });

  it("inserts placeholder into the focused body field", async () => {
    const user = userEvent.setup();

    renderPage();

    const bodyTextarea = screen.getByLabelText(/body/i);

    await user.click(bodyTextarea);
    await user.click(screen.getByRole("button", { name: /company name/i }));

    expect(bodyTextarea).toHaveValue("{{CompanyName}}");
  });

  it("loads selected template into the form when Edit is clicked", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText(/follow-up template/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/template name/i)).toHaveValue(
      "Follow-up Template"
    );
    expect(screen.getByLabelText(/subject/i)).toHaveValue(
      "Following up on {{JobTitle}}"
    );
    expect(screen.getByLabelText(/body/i)).toHaveValue(
      "Hi, I wanted to follow up with {{CompanyName}}."
    );

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("updates an email template", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText(/follow-up template/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = screen.getByLabelText(/template name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Template");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateEmailTemplate).toHaveBeenCalledWith("template-1", {
        name: "Updated Template",
        type: 0,
        subject: "Following up on {{JobTitle}}",
        body: "Hi, I wanted to follow up with {{CompanyName}}.",
      });
    });
  });

  it("opens confirmation dialog before deleting a template", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText(/follow-up template/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(
      screen.getByRole("heading", { name: /delete email template/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this will permanently delete this email template/i)
    ).toBeInTheDocument();
  });

  it("deletes a template after confirmation", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText(/follow-up template/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(
      screen.getByRole("button", { name: /delete template/i })
    );

    await waitFor(() => {
      expect(deleteEmailTemplate).toHaveBeenCalledWith("template-1");
    });
  });
});
