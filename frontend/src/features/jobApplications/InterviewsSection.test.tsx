import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Interview } from "../../types/interview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InterviewsSection } from "./InterviewsSection";
import {
  createInterview,
  deleteInterview,
  getInterviews,
  updateInterview,
} from "../../api/interviewsApi";

vi.mock("../../api/interviewsApi", () => ({
  getInterviews: vi.fn(),
  createInterview: vi.fn(),
  updateInterview: vi.fn(),
  deleteInterview: vi.fn(),
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
      <InterviewsSection jobApplicationId="app-1" />
    </QueryClientProvider>
  );
}

const interviews: Interview[] = [
  {
    id: "interview-1",
    jobApplicationId: "app-1",
    title: "Technical Interview",
    type: 1,
    scheduledAt: "2026-05-21T18:30:00Z",
    durationMinutes: 60,
    interviewerName: "Jane Recruiter",
    meetingLink: "https://meet.example.com/interview",
    location: "Remote",
    notes: "Prepare C#, SQL, and system design.",
    createdAt: "2026-05-20T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
];

describe("InterviewsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getInterviews).mockResolvedValue(interviews);

    vi.mocked(createInterview).mockResolvedValue({
      id: "interview-2",
      jobApplicationId: "app-1",
      title: "Behavioral Interview",
      type: 2,
      scheduledAt: "2026-05-22T18:30:00Z",
      durationMinutes: 45,
      interviewerName: null,
      meetingLink: null,
      location: null,
      notes: null,
      createdAt: "2026-05-20T00:00:00Z",
      updatedAt: "2026-05-20T00:00:00Z",
    } satisfies Interview);

    vi.mocked(updateInterview).mockResolvedValue({
      ...interviews[0],
      title: "Updated Interview",
    } satisfies Interview);

    vi.mocked(deleteInterview).mockResolvedValue(undefined);
  });

  it("renders interviews", async () => {
    renderSection();

    expect(
      screen.getByRole("heading", { name: /interviews/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/technical interview/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/jane recruiter/i)).toBeInTheDocument();
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
    expect(screen.getByText(/prepare c#, sql, and system design/i)).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /open meeting link/i })
    ).toHaveAttribute("href", "https://meet.example.com/interview");
  });

  it("creates an interview", async () => {
    const user = userEvent.setup();

    renderSection();

    await user.type(screen.getByLabelText(/^title$/i), "Behavioral Interview");
    await user.selectOptions(screen.getByLabelText(/^type$/i), "2");
    await user.type(screen.getByLabelText(/scheduled at/i), "2026-05-22T11:30");

    const durationInput = screen.getByLabelText(/duration minutes/i);
    await user.clear(durationInput);
    await user.type(durationInput, "45");

    await user.type(screen.getByLabelText(/interviewer name/i), "John Manager");
    await user.type(
      screen.getByLabelText(/meeting link/i),
      "https://meet.example.com/behavioral"
    );
    await user.type(screen.getByLabelText(/^location$/i), "Zoom");
    await user.type(screen.getByLabelText(/^notes$/i), "Prepare STAR stories.");

    await user.click(screen.getByRole("button", { name: /add interview/i }));

    await waitFor(() => {
      expect(createInterview).toHaveBeenCalledWith(
        "app-1",
        expect.objectContaining({
          title: "Behavioral Interview",
          type: 2,
          durationMinutes: 45,
          interviewerName: "John Manager",
          meetingLink: "https://meet.example.com/behavioral",
          location: "Zoom",
          notes: "Prepare STAR stories.",
        })
      );
    });

    const request = vi.mocked(createInterview).mock.calls[0][1];
    expect(request.scheduledAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("click Edit fills the form with interview data", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/technical interview/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/^title$/i)).toHaveValue("Technical Interview");
    expect(screen.getByLabelText(/^type$/i)).toHaveValue("1");
    expect(screen.getByLabelText(/duration minutes/i)).toHaveValue(60);
    expect(screen.getByLabelText(/interviewer name/i)).toHaveValue(
      "Jane Recruiter"
    );
    expect(screen.getByLabelText(/meeting link/i)).toHaveValue(
      "https://meet.example.com/interview"
    );
    expect(screen.getByLabelText(/^location$/i)).toHaveValue("Remote");
    expect(screen.getByLabelText(/^notes$/i)).toHaveValue(
      "Prepare C#, SQL, and system design."
    );

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel edit/i })
    ).toBeInTheDocument();
  });

  it("updates an interview", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/technical interview/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const titleInput = screen.getByLabelText(/^title$/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Interview");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateInterview).toHaveBeenCalledWith(
        "app-1",
        "interview-1",
        expect.objectContaining({
          title: "Updated Interview",
          type: 1,
          durationMinutes: 60,
          interviewerName: "Jane Recruiter",
          meetingLink: "https://meet.example.com/interview",
          location: "Remote",
          notes: "Prepare C#, SQL, and system design.",
        })
      );
    });
  });

  it("cancel edit clears edit mode", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/technical interview/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/^title$/i)).toHaveValue("Technical Interview");

    await user.click(screen.getByRole("button", { name: /cancel edit/i }));

    expect(screen.getByLabelText(/^title$/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /add interview/i })
    ).toBeInTheDocument();
  });

  it("opens confirmation dialog before deleting an interview", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/technical interview/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(
      screen.getByRole("heading", { name: /delete interview/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this will permanently delete this interview/i)
    ).toBeInTheDocument();
  });

  it("deletes an interview after confirmation", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/technical interview/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /delete interview/i }));

    await waitFor(() => {
      expect(deleteInterview).toHaveBeenCalledWith("app-1", "interview-1");
    });
  });

  it("shows empty state when there are no interviews", async () => {
    vi.mocked(getInterviews).mockResolvedValue([]);

    renderSection();

    expect(
      await screen.findByText(/no interviews scheduled yet/i)
    ).toBeInTheDocument();
  });
});
