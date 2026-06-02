import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { Reminder } from "../../types/reminder";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RemindersSection } from "./RemindersSection";
import {
  createReminder,
  deleteReminder,
  getReminders,
  markReminderComplete,
  markReminderIncomplete,
  updateReminder,
} from "../../api/remindersApi";

vi.mock("../../api/remindersApi", () => ({
  getReminders: vi.fn(),
  createReminder: vi.fn(),
  updateReminder: vi.fn(),
  deleteReminder: vi.fn(),
  markReminderComplete: vi.fn(),
  markReminderIncomplete: vi.fn(),
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
      <RemindersSection jobApplicationId="app-1" />
    </QueryClientProvider>
  );
}

const reminder: Reminder = {
  id: "reminder-1",
  jobApplicationId: "app-1",
  title: "Follow up with recruiter",
  type: 0,
  remindAt: "2026-05-22T18:30:00Z",
  isCompleted: false,
  createdAt: "2026-05-20T00:00:00Z",
  updatedAt: "2026-05-20T00:00:00Z",
};

const reminders: Reminder[] = [reminder];

describe("RemindersSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getReminders).mockResolvedValue(reminders);

    vi.mocked(createReminder).mockResolvedValue({
      id: "reminder-2",
      jobApplicationId: "app-1",
      title: "Submit take-home assignment",
      type: 3,
      remindAt: "2026-05-23T18:30:00Z",
      isCompleted: false,
      createdAt: "2026-05-20T00:00:00Z",
      updatedAt: "2026-05-20T00:00:00Z",
    } satisfies Reminder);

    vi.mocked(updateReminder).mockResolvedValue({
      ...reminder,
      title: "Updated reminder",
    } satisfies Reminder);

    vi.mocked(deleteReminder).mockResolvedValue(undefined);
    vi.mocked(markReminderComplete).mockResolvedValue(undefined);
    vi.mocked(markReminderIncomplete).mockResolvedValue(undefined);
  });

  it("renders reminders", async () => {
    renderSection();

    expect(
      screen.getByRole("heading", { name: /reminders/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: /follow up with recruiter/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it("creates a reminder", async () => {
    const user = userEvent.setup();

    renderSection();

    await user.type(
      screen.getByLabelText(/^title$/i),
      "Submit take-home assignment"
    );

    await user.selectOptions(screen.getByLabelText(/^type$/i), "3");

    await user.type(
      screen.getByLabelText(/remind at/i),
      "2026-05-23T11:30"
    );

    await user.click(screen.getByRole("button", { name: /add reminder/i }));

    await waitFor(() => {
      expect(createReminder).toHaveBeenCalledWith(
        "app-1",
        expect.objectContaining({
          title: "Submit take-home assignment",
          type: 3,
        })
      );
    });

    const request = vi.mocked(createReminder).mock.calls[0][1];
    expect(request.remindAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("click Edit fills the form with reminder data", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/^title$/i)).toHaveValue(
      "Follow up with recruiter"
    );
    expect(screen.getByLabelText(/^type$/i)).toHaveValue("0");

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel edit/i })
    ).toBeInTheDocument();
  });

  it("updates a reminder", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const titleInput = screen.getByLabelText(/^title$/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated reminder");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateReminder).toHaveBeenCalledWith(
        "app-1",
        "reminder-1",
        expect.objectContaining({
          title: "Updated reminder",
          type: 0,
        })
      );
    });

    const request = vi.mocked(updateReminder).mock.calls[0][2];
    expect(request.remindAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("cancel edit clears edit mode", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/^title$/i)).toHaveValue(
      "Follow up with recruiter"
    );

    await user.click(screen.getByRole("button", { name: /cancel edit/i }));

    expect(screen.getByLabelText(/^title$/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /add reminder/i })
    ).toBeInTheDocument();
  });

  it("marks a reminder complete", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter/i);

    await user.click(screen.getByRole("button", { name: /complete/i }));

    await waitFor(() => {
      expect(markReminderComplete).toHaveBeenCalledWith("app-1", "reminder-1");
    });
  });

  it("marks a completed reminder incomplete", async () => {
    const user = userEvent.setup();

    vi.mocked(getReminders).mockResolvedValue([
      {
        ...reminder,
        isCompleted: true,
      },
    ]);

    renderSection();

    await screen.findByText(/follow up with recruiter/i);

    await user.click(
      screen.getByRole("button", { name: /mark incomplete/i })
    );

    await waitFor(() => {
      expect(markReminderIncomplete).toHaveBeenCalledWith(
        "app-1",
        "reminder-1"
      );
    });
  });

  it("opens confirmation dialog before deleting a reminder", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(
      screen.getByRole("heading", { name: /delete reminder/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this will permanently delete this reminder/i)
    ).toBeInTheDocument();
  });

  it("deletes a reminder after confirmation", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /delete reminder/i }));

    await waitFor(() => {
      expect(deleteReminder).toHaveBeenCalledWith("app-1", "reminder-1");
    });
  });

  it("shows empty state when there are no reminders", async () => {
    vi.mocked(getReminders).mockResolvedValue([]);

    renderSection();

    expect(await screen.findByText(/no reminders yet/i)).toBeInTheDocument();
  });
});
