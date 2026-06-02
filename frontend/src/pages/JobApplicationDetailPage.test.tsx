import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { JobApplicationDetailPage } from "./JobApplicationDetailPage";
import {
  deleteJobApplication,
  getJobApplicationById,
} from "../api/jobApplicationsApi";
import type { JobApplication } from "../types/jobApplication";

vi.mock("../api/jobApplicationsApi", () => ({
  getJobApplicationById: vi.fn(),
  deleteJobApplication: vi.fn(),
}));

vi.mock("../features/jobApplications/ApplicationNotesSection", () => ({
  ApplicationNotesSection: () => <section>Application Notes Section</section>,
}));

vi.mock("../features/jobApplications/InterviewsSection", () => ({
  InterviewsSection: () => <section>Interviews Section</section>,
}));

vi.mock("../features/jobApplications/RemindersSection", () => ({
  RemindersSection: () => <section>Reminders Section</section>,
}));

vi.mock("../features/jobApplications/DocumentsSection", () => ({
  DocumentsSection: () => <section>Documents Section</section>,
}));

vi.mock("../features/jobApplications/EmailTemplatePreviewSection", () => ({
  EmailTemplatePreviewSection: () => (
    <section>Email Template Preview Section</section>
  ),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage(initialPath = "/applications/app-1") {
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
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/applications/:id"
            element={<JobApplicationDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const application: JobApplication= {
  id: "app-1",
  companyName: "Microsoft",
  jobTitle: "Backend Developer",
  location: "Remote",
  jobUrl: "https://example.com/job",
  status: 3,
  dateApplied: "2026-05-20T00:00:00Z",
  deadline: "2026-06-01T00:00:00Z",
  salaryRange: "$100k-$120k",
  notes: "Follow up next week.",
  createdAt: "2026-05-19T00:00:00Z",
  updatedAt: "2026-05-20T00:00:00Z",
};

describe("JobApplicationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getJobApplicationById).mockResolvedValue(application);
    vi.mocked(deleteJobApplication).mockResolvedValue(undefined);
  });

  it("renders loading state", () => {
    vi.mocked(getJobApplicationById).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/loading application/i)).toBeInTheDocument();
  });

  it("renders job application details", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: /backend developer/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Microsoft")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("$100k-$120k")).toBeInTheDocument();
    expect(screen.getByText("Follow up next week.")).toBeInTheDocument();
    expect(screen.getByText("Interviewing")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /open posting/i })
    ).toHaveAttribute("href", "https://example.com/job");
  });

  vi.mock("../features/jobApplications/StatusHistorySection", () => ({
    StatusHistorySection: () => <section>Status History Section</section>,
  }));

  it("renders child sections", async () => {
    renderPage();

    expect(await screen.findByText(/application notes section/i)).toBeInTheDocument();
    expect(screen.getByText(/interviews section/i)).toBeInTheDocument();
    expect(screen.getByText(/reminders section/i)).toBeInTheDocument();
    expect(screen.getByText(/documents section/i)).toBeInTheDocument();
    expect(screen.getByText(/email template preview section/i)).toBeInTheDocument();
  });

  it("opens delete confirmation dialog", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByRole("heading", { name: /backend developer/i });

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(
      screen.getByRole("heading", { name: /delete job application/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this will permanently delete this job application/i)
    ).toBeInTheDocument();
  });

  it("deletes job application after confirmation", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByRole("heading", { name: /backend developer/i });

    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(
      screen.getByRole("button", { name: /delete application/i })
    );

    await waitFor(() => {
      expect(deleteJobApplication).toHaveBeenCalledWith("app-1");
      expect(mockNavigate).toHaveBeenCalledWith("/applications");
    });
  });

  it("renders error state", async () => {
    vi.mocked(getJobApplicationById).mockRejectedValue(new Error("Failed"));

    renderPage();

    expect(
      await screen.findByText(/failed to load application/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /back to applications/i })
    ).toHaveAttribute("href", "/applications");
  });
});
