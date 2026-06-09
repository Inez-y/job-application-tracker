import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApplicationNotesSection } from "./ApplicationNotesSection";
import {
  createApplicationNote,
  deleteApplicationNote,
  getApplicationNotes,
  updateApplicationNote,
} from "../../api/applicationNotesApi";

vi.mock("../../api/applicationNotesApi", () => ({
  getApplicationNotes: vi.fn(),
  createApplicationNote: vi.fn(),
  updateApplicationNote: vi.fn(),
  deleteApplicationNote: vi.fn(),
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
      <ApplicationNotesSection jobApplicationId="app-1" />
    </QueryClientProvider>
  );
}

const notes = [
  {
    id: "note-1",
    jobApplicationId: "app-1",
    content: "Follow up with recruiter next week.",
    createdAt: "2026-05-21T00:00:00Z",
  },
];

describe("ApplicationNotesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getApplicationNotes).mockResolvedValue(notes);
    vi.mocked(createApplicationNote).mockResolvedValue({
      id: "note-2",
      jobApplicationId: "app-1",
      content: "New note",
      createdAt: "2026-05-22T00:00:00Z",
    });
    vi.mocked(updateApplicationNote).mockResolvedValue(undefined);
    vi.mocked(deleteApplicationNote).mockResolvedValue(undefined);
  });

  it("renders application notes", async () => {
    renderSection();

    expect(
      screen.getByRole("heading", { name: /application notes/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/follow up with recruiter next week/i)
    ).toBeInTheDocument();
  });

  it("creates a note", async () => {
    const user = userEvent.setup();

    renderSection();

    await user.type(screen.getByLabelText(/note/i), "Prepare for interview.");

    await user.click(screen.getByRole("button", { name: /add note/i }));

    await waitFor(() => {
      expect(createApplicationNote).toHaveBeenCalledWith("app-1", {
        content: "Prepare for interview.",
      });
    });
  });

  it("click Edit fills the form with note content", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter next week/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/note/i)).toHaveValue(
      "Follow up with recruiter next week."
    );

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel edit/i })
    ).toBeInTheDocument();
  });

  it("updates a note", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter next week/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const noteTextarea = screen.getByLabelText(/note/i);

    await user.clear(noteTextarea);
    await user.type(noteTextarea, "Updated note content.");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateApplicationNote).toHaveBeenCalledWith("app-1", "note-1", {
        content: "Updated note content.",
      });
    });
  });

  it("cancel edit clears edit mode", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter next week/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByLabelText(/note/i)).toHaveValue(
      "Follow up with recruiter next week."
    );

    await user.click(screen.getByRole("button", { name: /cancel edit/i }));

    expect(screen.getByLabelText(/note/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /add note/i })
    ).toBeInTheDocument();
  });

  it("opens confirmation dialog before deleting a note", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter next week/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(
      screen.getByRole("heading", { name: /delete note/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this will permanently delete this note/i)
    ).toBeInTheDocument();
  });

  it("deletes a note after confirmation", async () => {
    const user = userEvent.setup();

    renderSection();

    await screen.findByText(/follow up with recruiter next week/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /delete note/i }));

    await waitFor(() => {
      expect(deleteApplicationNote).toHaveBeenCalledWith("app-1", "note-1");
    });
  });

  it("shows empty state when there are no notes", async () => {
    vi.mocked(getApplicationNotes).mockResolvedValue([]);

    renderSection();

    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();
  });
});
