import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusHistorySection } from "./StatusHistorySection";
import {
  deleteStatusHistory,
  getStatusHistory,
  updateStatusHistory,
} from "../../api/jobApplicationsApi";
import type { ApplicationStatusHistory } from "../../types/jobApplication";

vi.mock("../../api/jobApplicationsApi", () => ({
  getStatusHistory: vi.fn(),
  updateStatusHistory: vi.fn(),
  deleteStatusHistory: vi.fn(),
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
      <StatusHistorySection jobApplicationId="app-1" />
    </QueryClientProvider>
  );
}

const statusHistory: ApplicationStatusHistory[] = [
  {
    id: "history-1",
    jobApplicationId: "app-1",
    oldStatus: 1,
    newStatus: 3,
    changedAt: "2026-05-21T00:00:00Z",
  },
];

describe("StatusHistorySection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getStatusHistory).mockResolvedValue(statusHistory);
    vi.mocked(updateStatusHistory).mockResolvedValue(undefined);
    vi.mocked(deleteStatusHistory).mockResolvedValue(undefined);
  });

  it("renders status history", async () => {
    renderSection();

    expect(
      screen.getByRole("heading", { name: /status history/i })
    ).toBeInTheDocument();

    expect(await screen.findByText(/applied → interviewing/i)).toBeInTheDocument();
  });

  it("click Edit fills edit form", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/applied → interviewing/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/old status/i)).toHaveValue("1");
    expect(screen.getByLabelText(/new status/i)).toHaveValue("3");
    expect(screen.getByLabelText(/changed at/i)).toHaveValue("2026-05-21");

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("save calls updateStatusHistory", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/applied → interviewing/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    await user.selectOptions(screen.getByLabelText(/new status/i), "4");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateStatusHistory).toHaveBeenCalledWith(
        "app-1",
        "history-1",
        expect.objectContaining({
          oldStatus: 1,
          newStatus: 4,
        })
      );
    });
  });

  it("click Delete opens ConfirmDialog", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/applied → interviewing/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(
      screen.getByRole("heading", { name: /delete status history/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this will permanently delete this status history record/i)
    ).toBeInTheDocument();
  });

  it("confirm delete calls deleteStatusHistory", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/applied → interviewing/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /delete status/i }));

    await waitFor(() => {
      expect(deleteStatusHistory).toHaveBeenCalledWith("app-1", "history-1");
    });
  });
});
