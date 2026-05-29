import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReminder,
  deleteReminder,
  getReminders,
  markReminderComplete,
  markReminderIncomplete,
} from "../../api/remindersApi";
import type { ReminderType } from "../../types/reminder";

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
        onSuccess: invalidateReminders,
    });

    const sortedReminders = [...(data ?? [])].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }

        return new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime();
    });

    return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900"> Reminders </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (!title.trim() || !remindAt) {
            return;
          }

          createMutation.mutate();
        }}
        className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium"> Title </label>
            <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Follow up with recruiter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium"> Type </label>
            <select
              value={type}
              onChange={(event) =>
                setType(Number(event.target.value) as ReminderType)
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
                <option value={0}> Follow Up </option>
                <option value={1}> Deadline </option>
                <option value={2}> Interview </option>
                <option value={3}> Take-home Assignment </option>
                <option value={4}> Other </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium"> Remind At </label>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(event) => setRemindAt(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || !title.trim() || !remindAt}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {createMutation.isPending ? "Adding..." : "Add Reminder"}
        </button>
      </form>

      {isLoading && <p className="mt-4 text-slate-600"> Loading reminders... </p>}

      {isError && <p className="mt-4 text-red-600"> Failed to load reminders. </p>}

      {!isLoading && !isError && sortedReminders.length === 0 && (
        <p className="mt-4 text-slate-600"> No reminders yet. </p>
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
                    {new Date(reminder.remindAt).toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {reminder.isCompleted ? "Completed" : "Pending"}
                  </p>
                </div>

                <div className="flex gap-3">
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
                    onClick={() => deleteMutation.mutate(reminder.id)}
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
    </section>
  );
}
