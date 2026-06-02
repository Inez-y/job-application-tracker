import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import type { InterviewType } from "../../types/interview";
import { formatDateTime } from "../../utils/dateFormat";
import { createInterview, deleteInterview, getInterviews, updateInterview } from "../../api/interviewsApi";

type Props = { jobApplicationId: string; };

const interviewTypeLabels: Record<number, string> = {
  0: "Phone Screen",
  1: "Technical",
  2: "Behavioral",
  3: "Final Round",
  4: "Onsite",
  5: "Other",
};

export function InterviewsSection({ jobApplicationId }: Props){
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [type, setType] = useState<InterviewType>(1);
    const [scheduledAt, setScheduledAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [interviewerName, setInterviewerName] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [interviewIdToDelete, setInterviewIdToDelete] = useState<string | null>(null);
    const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["interviews", jobApplicationId],
        queryFn: () => getInterviews(jobApplicationId),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            createInterview(jobApplicationId, {
                title,
                type,
                scheduledAt: new Date(scheduledAt).toISOString(),
                durationMinutes: Number(durationMinutes),
                interviewerName: interviewerName || null,
                meetingLink: meetingLink || null,
                location: location || null,
                notes: notes || null,
            }),
            onSuccess: () => {
                setTitle("");
                setType(1);
                setScheduledAt("");
                setDurationMinutes(60);
                setInterviewerName("");
                setMeetingLink("");
                setLocation("");
                setNotes("");

            queryClient.invalidateQueries({
                queryKey: ["interviews", jobApplicationId],
            });
        },
    });

    const updateMutation = useMutation({
      mutationFn: () => {
        if (!editingInterviewId) {
          throw new Error("No interview selected.");
        }

        return updateInterview(jobApplicationId, editingInterviewId, {
          title,
          type,
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes: Number(durationMinutes),
          interviewerName: interviewerName || null,
          meetingLink: meetingLink || null,
          location: location || null,
          notes: notes || null,
        });
      },
      onSuccess: () => {
        setEditingInterviewId(null);
        setTitle("");
        setType(0);
        setScheduledAt("");
        setDurationMinutes(30);
        setInterviewerName("");
        setMeetingLink("");
        setLocation("");
        setNotes("");

        queryClient.invalidateQueries({
          queryKey: ["interviews", jobApplicationId],
        });
      },
    });

    const deleteMutation = useMutation({
        mutationFn: (interviewId: string) =>
            deleteInterview(jobApplicationId, interviewId),
        onSuccess: () => {
            setInterviewIdToDelete(null);

            queryClient.invalidateQueries({
                queryKey: ["interviews", jobApplicationId],
            });
        },
    });

  return (
  <section>
    <h2 className="text-lg font-semibold text-slate-900">
      {editingInterviewId ? "Edit Interview" : "Interviews"}
    </h2>

    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (!title.trim() || !scheduledAt || !durationMinutes) {
          return;
        }

        if (editingInterviewId) {
          updateMutation.mutate();
        } else {
          createMutation.mutate();
        }
      }}
      className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="interviewTitle"
            className="block text-sm font-medium text-slate-700"
          >
            Title
          </label>

          <input
            id="interviewTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Technical Interview"
          />
        </div>

        <div>
          <label
            htmlFor="interviewType"
            className="block text-sm font-medium text-slate-700"
          >
            Type
          </label>

          <select
            id="interviewType"
            value={type}
            onChange={(event) =>
              setType(Number(event.target.value) as InterviewType)
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value={0}>Phone Screen</option>
            <option value={1}>Technical</option>
            <option value={2}>Behavioral</option>
            <option value={3}>Final Round</option>
            <option value={4}>Onsite</option>
            <option value={5}>Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="scheduledAt"
            className="block text-sm font-medium text-slate-700"
          >
            Scheduled At
          </label>

          <input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="durationMinutes"
            className="block text-sm font-medium text-slate-700"
          >
            Duration Minutes
          </label>

          <input
            id="durationMinutes"
            type="number"
            min={15}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="interviewerName"
            className="block text-sm font-medium text-slate-700"
          >
            Interviewer Name
          </label>

          <input
            id="interviewerName"
            value={interviewerName}
            onChange={(event) => setInterviewerName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Jane Recruiter"
          />
        </div>

        <div>
          <label
            htmlFor="meetingLink"
            className="block text-sm font-medium text-slate-700"
          >
            Meeting Link
          </label>

          <input
            id="meetingLink"
            value={meetingLink}
            onChange={(event) => setMeetingLink(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="https://meet.example.com/interview"
          />
        </div>

        <div>
          <label
            htmlFor="interviewLocation"
            className="block text-sm font-medium text-slate-700"
          >
            Location
          </label>

          <input
            id="interviewLocation"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Remote, office, etc."
          />
        </div>

        <div>
          <label
            htmlFor="interviewNotes"
            className="block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <input
            id="interviewNotes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Prepare C#, SQL, system design..."
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {editingInterviewId && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingInterviewId(null);
              setTitle("");
              setType(0);
              setScheduledAt("");
              setDurationMinutes(30);
              setInterviewerName("");
              setMeetingLink("");
              setLocation("");
              setNotes("");
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
            !scheduledAt ||
            !durationMinutes
          }
        >
          {editingInterviewId
            ? updateMutation.isPending
              ? "Saving..."
              : "Save Changes"
            : createMutation.isPending
              ? "Adding..."
              : "Add Interview"}
        </Button>
      </div>
    </form>

    {isLoading && (
      <p className="mt-4 text-slate-600">Loading interviews...</p>
    )}

    {isError && (
      <p className="mt-4 text-red-600">Failed to load interviews.</p>
    )}

    {!isLoading && !isError && (!data || data.length === 0) && (
      <p className="mt-4 text-slate-600">No interviews scheduled yet.</p>
    )}

    {data && data.length > 0 && (
      <div className="mt-4 space-y-3">
        {data.map((interview) => (
          <div
            key={interview.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {interview.title}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {interviewTypeLabels[interview.type]} ·{" "}
                  {formatDateTime(interview.scheduledAt)} ·{" "}
                  {interview.durationMinutes} minutes
                </p>

                {interview.interviewerName && (
                  <p className="mt-2 text-sm text-slate-700">
                    Interviewer: {interview.interviewerName}
                  </p>
                )}

                {interview.location && (
                  <p className="mt-1 text-sm text-slate-700">
                    Location: {interview.location}
                  </p>
                )}

                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 underline"
                  >
                    Open meeting link
                  </a>
                )}

                {interview.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {interview.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingInterviewId(interview.id);
                    setTitle(interview.title);
                    setType(interview.type);
                    setScheduledAt(interview.scheduledAt.slice(0, 16));
                    setDurationMinutes(interview.durationMinutes);
                    setInterviewerName(interview.interviewerName ?? "");
                    setMeetingLink(interview.meetingLink ?? "");
                    setLocation(interview.location ?? "");
                    setNotes(interview.notes ?? "");
                  }}
                >
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setInterviewIdToDelete(interview.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <ConfirmDialog
      isOpen={Boolean(interviewIdToDelete)}
      title="Delete interview?"
      description="This will permanently delete this interview. This action cannot be undone."
      confirmLabel="Delete interview"
      isLoading={deleteMutation.isPending}
      onCancel={() => setInterviewIdToDelete(null)}
      onConfirm={() => {
        if (!interviewIdToDelete) {
          return;
        }

        deleteMutation.mutate(interviewIdToDelete, {
          onSuccess: () => setInterviewIdToDelete(null),
        });
      }}
    />
  </section>
  );
}
