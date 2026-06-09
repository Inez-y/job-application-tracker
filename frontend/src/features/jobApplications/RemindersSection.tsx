import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReminderType } from "../../types/reminder";
import { formatDateTime } from "../../utils/dateFormat";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  createReminder,
  deleteReminder,
  updateReminder,
  getReminders,
  markReminderComplete,
  markReminderIncomplete,
} from "../../api/remindersApi";

type Props = { jobApplicationId: string };

const reminderTypeLabels: Record<number, string> = {
  0: "Follow Up",
  1: "Deadline",
  2: "Interview",
  3: "Take-home Assignment",
  4: "Other",
};

export function RemindersSection({ jobApplicationId }: Props) {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [type, setType] = useState<ReminderType>(0);
    const [remindAt, setRemindAt] = useState("");
    const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
    const [reminderIdToDelete, setReminderIdToDelete] = useState<string | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["reminders", jobApplicationId],
        queryFn: () => getReminders(jobApplicationId),
    });

    const invalidateReminders = () => {
        queryClient.invalidateQueries({
            queryKey: ["reminders", jobApplicationId],
        });
    };

    const createMutation = useMutation({
      mutationFn: () =>
        createReminder(jobApplicationId, {
          title,
          type,
          remindAt: new Date(remindAt).toISOString(),
        }),
      onSuccess: () => {
        setTitle("");
        setType(0);
        setRemindAt("");
        invalidateReminders();
      },
    });

    const updateMutation = useMutation({
      mutationFn: () => {
        if (!editingReminderId) {
          throw new Error("No reminder selected.");
        }

        return updateReminder(jobApplicationId, editingReminderId, {
          title,
          type,
          remindAt: new Date(remindAt).toISOString(),
        });
      },
      onSuccess: () => {
        setEditingReminderId(null);
        setTitle("");
        setType(0);
        setRemindAt("");
        invalidateReminders();
      },
    });

    const completeMutation = useMutation({
        mutationFn: (reminderId: string) =>
        markReminderComplete(jobApplicationId, reminderId),
        onSuccess: invalidateReminders,
    });

    const incompleteMutation = useMutation({
        mutationFn: (reminderId: string) =>
        markReminderIncomplete(jobApplicationId, reminderId),
        onSuccess: invalidateReminders,
    });

    const deleteMutation = useMutation({
      mutationFn: (reminderId: string) =>
        deleteReminder(jobApplicationId, reminderId),
      onSuccess: () => {
        setReminderIdToDelete(null);
        invalidateReminders();
      },
    });

    const sortedReminders = [...(data ?? [])].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }

        return new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime();
    });

  return (
  <section>
    <h2 className="text-lg font-semibold text-slate-900">Reminders</h2>

    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (!title.trim() || !remindAt) {
          return;
        }

        if (editingReminderId) {
          updateMutation.mutate();
        } else {
          createMutation.mutate();
        }
      }}
      className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="reminderTitle"
            className="block text-sm font-medium text-slate-700"
          >
            Title
          </label>

          <input
            id="reminderTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Follow up with recruiter"
          />
        </div>

        <div>
          <label
            htmlFor="reminderType"
            className="block text-sm font-medium text-slate-700"
          >
            Type
          </label>

          <select
            id="reminderType"
            value={type}
            onChange={(event) =>
              setType(Number(event.target.value) as ReminderType)
            }
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value={0}>Follow Up</option>
            <option value={1}>Deadline</option>
            <option value={2}>Interview</option>
            <option value={3}>Take-home Assignment</option>
            <option value={4}>Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="remindAt"
            className="block text-sm font-medium text-slate-700"
          >
            Remind At
          </label>

          <input
            id="remindAt"
            type="datetime-local"
            value={remindAt}
            onChange={(event) => setRemindAt(event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {editingReminderId && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingReminderId(null);
              setTitle("");
              setType(0);
              setRemindAt("");
            }}
          >
            Cancel Edit
          </Button>
        )}

        <Button
          type="submit"
          disabled={
            createMutation.isPending ||
            updateMutation.isPending ||
            !title.trim() ||
            !remindAt
          }
        >
          {editingReminderId
            ? updateMutation.isPending
              ? "Saving..."
              : "Save Changes"
            : createMutation.isPending
              ? "Adding..."
              : "Add Reminder"}
        </Button>
      </div>
    </form>

    {isLoading && (
      <p className="mt-4 text-slate-600">Loading reminders...</p>
    )}

    {isError && (
      <p className="mt-4 text-red-600">Failed to load reminders.</p>
    )}

    {!isLoading && !isError && sortedReminders.length === 0 && (
      <p className="mt-4 text-slate-600">No reminders yet.</p>
    )}

    {sortedReminders.length > 0 && (
      <div className="mt-4 space-y-3">
        {sortedReminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`rounded-lg border border-slate-200 bg-white p-4 ${
              reminder.isCompleted ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {reminder.title}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {reminderTypeLabels[reminder.type]} ·{" "}
                  {formatDateTime(reminder.remindAt)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {reminder.isCompleted ? "Completed" : "Pending"}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingReminderId(reminder.id);
                    setTitle(reminder.title);
                    setType(reminder.type);
                    setRemindAt(reminder.remindAt.slice(0, 16));
                  }}
                >
                  Edit
                </Button>

                {reminder.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => incompleteMutation.mutate(reminder.id)}
                    disabled={incompleteMutation.isPending}
                    className="text-sm text-slate-700 hover:underline disabled:opacity-60"
                  >
                    Mark incomplete
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => completeMutation.mutate(reminder.id)}
                    disabled={completeMutation.isPending}
                    className="text-sm text-green-700 hover:underline disabled:opacity-60"
                  >
                    Complete
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setReminderIdToDelete(reminder.id)}
                  disabled={deleteMutation.isPending}
                  className="text-sm text-red-600 hover:underline disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <ConfirmDialog
      isOpen={Boolean(reminderIdToDelete)}
      title="Delete reminder?"
      description="This will permanently delete this reminder. This action cannot be undone."
      confirmLabel="Delete reminder"
      isLoading={deleteMutation.isPending}
      onCancel={() => setReminderIdToDelete(null)}
      onConfirm={() => {
        if (!reminderIdToDelete) {
          return;
        }

        deleteMutation.mutate(reminderIdToDelete);
      }}
    />
  </section>
  );
}
