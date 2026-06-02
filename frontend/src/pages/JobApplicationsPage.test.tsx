import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { JobApplicationsPage } from "./JobApplicationsPage";
import { getJobApplications } from "../api/jobApplicationsApi";
import type { JobApplication } from "../types/jobApplication";

vi.mock("../api/jobApplicationsApi", () => ({
  getJobApplications: vi.fn(),
}));

function renderPage(initialPath = "/applications") {
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
          <Route path="/applications" element={<JobApplicationsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const applications: JobApplication[] = [
  {
    id: "app-1",
    companyName: "Microsoft",
    jobTitle: "Backend Developer",
    location: "Remote",
    jobUrl: "https://example.com/microsoft",
    status: 1,
    dateApplied: "2026-05-20T00:00:00Z",
    deadline: "2099-06-01",
    salaryRange: "$100k-$120k",
    notes: "Follow up soon.",
    createdAt: "2026-05-19T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "app-2",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    location: "Hybrid",
    jobUrl: "https://example.com/google",
    status: 0,
    dateApplied: null,
    deadline: "2000-01-01",
    salaryRange: null,
    notes: null,
    createdAt: "2026-05-18T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
];

const pagedResponse = {
  items: applications,
  page: 1,
  pageSize: 10,
  totalCount: 2,
  totalPages: 1,
};

describe("JobApplicationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getJobApplications).mockResolvedValue(pagedResponse);
  });

  it("renders job applications", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: /job applications/i })
    ).toBeInTheDocument();

    expect(await screen.findByText("Microsoft")).toBeInTheDocument();
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();

    expect(screen.getAllByRole("link", { name: /view/i })).toHaveLength(2);
  });

  it("calls getJobApplications with search filter", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText("Microsoft");

    await user.type(screen.getByLabelText(/search/i), "Microsoft");

    await waitFor(() => {
      expect(getJobApplications).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "Microsoft",
          page: 1,
        })
      );
    });
  });

  it("calls getJobApplications with status filter", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText("Microsoft");

    await user.selectOptions(screen.getByLabelText(/status/i), "0");

    await waitFor(() => {
      expect(getJobApplications).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 0,
          page: 1,
        })
      );
    });
  });

  it("calls getJobApplications with sort options", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText("Microsoft");

    await user.selectOptions(screen.getByLabelText(/sort by/i), "deadline");
    await user.selectOptions(screen.getByLabelText(/direction/i), "asc");

    await waitFor(() => {
      expect(getJobApplications).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: "deadline",
          sortDirection: "asc",
          page: 1,
        })
      );
    });
  });

  it("uses status query parameter from dashboard link", async () => {
    renderPage("/applications?status=0");

    await screen.findByText("Microsoft");

    expect(screen.getByLabelText(/status/i)).toHaveValue("0");

    expect(getJobApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 0,
      })
    );
  });

  it("filters upcoming deadlines from query parameter", async () => {
    renderPage("/applications?deadline=upcoming&sort=deadline");

    expect(
        await screen.findByText(/showing applications with upcoming deadlines/i)
    ).toBeInTheDocument();

    expect(
        await screen.findByRole("cell", { name: /microsoft/i })
    ).toBeInTheDocument();

    expect(screen.queryByRole("cell", { name: /google/i })).not.toBeInTheDocument();

    expect(screen.getByLabelText(/sort by/i)).toHaveValue("deadline");
    });

  it("clear filter link returns to applications page", async () => {
    renderPage("/applications?deadline=upcoming&sort=deadline");

    expect(await screen.findByRole("link", { name: /clear filter/i }))
      .toHaveAttribute("href", "/applications");
  });

  it("renders empty state", async () => {
    vi.mocked(getJobApplications).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    });

    renderPage();

    expect(await screen.findByText(/no applications found/i)).toBeInTheDocument();
  });

  it("renders error state", async () => {
    vi.mocked(getJobApplications).mockRejectedValue(new Error("Failed"));

    renderPage();

    expect(
      await screen.findByText(/failed to load applications/i)
    ).toBeInTheDocument();
  });

  it("renders pagination and loads next page", async () => {
    const user = userEvent.setup();

    vi.mocked(getJobApplications).mockResolvedValue({
      items: applications,
      page: 1,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
    });

    renderPage();

    expect(await screen.findByText(/page 1 of 2/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(getJobApplications).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it("view link points to application detail page", async () => {
    renderPage();

    await screen.findByText("Microsoft");

    const microsoftRow = screen.getByText("Microsoft").closest("tr");

    expect(microsoftRow).not.toBeNull();

    const viewLink = within(microsoftRow as HTMLTableRowElement).getByRole(
      "link",
      { name: /view/i }
    );

    expect(viewLink).toHaveAttribute("href", "/applications/app-1");
  });
});
