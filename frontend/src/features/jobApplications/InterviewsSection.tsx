import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInterview,
  deleteInterview,
  getInterviews,
} from "../../api/interviewsApi";
import type { InterviewType } from "../../types/interview";
import { formatDate, formatDateTime } from "../../utils/dateFormat";

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

    const { data, isLoading, isError } = useQuery({
        queryKey: ["interviews", jobApplicationId],
        queryFn: () => getInterviews(jobApplicationId),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            createInterview(jobApplicationId, {
                title,
                type,
                scheduledAt: formatDateTime(scheduledAt),
                durationMinutes,
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

    const deleteMutation = useMutation({
        mutationFn: (interviewId: string) =>
            deleteInterview(jobApplicationId, interviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["interviews", jobApplicationId],
            });
        },
    });

    return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">Interviews</h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (!title.trim() || !scheduledAt) {
            return;
          }

          createMutation.mutate();
        }}
        className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium"> Title </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Technical Interview"
            />
          </div>

          <div>
            <label className="block text-sm font-medium"> Type </label>
            <select
              value={type}
              onChange={(event) => setType(Number(event.target.value) as InterviewType)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
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
            <label className="block text-sm font-medium"> Scheduled At </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium"> Duration Minutes </label>
            <input
              type="number"
              min={15}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium"> Interviewer Name </label>
            <input
              value={interviewerName}
              onChange={(event) => setInterviewerName(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Jane Recruiter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium"> Meeting Link </label>
            <input
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="https://meet.example.com/interview"
            />
          </div>

          <div>
            <label className="block text-sm font-medium"> Location </label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Remote, office, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium"> Notes </label>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Prepare C#, SQL, system design..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || !title.trim() || !scheduledAt}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {createMutation.isPending ? "Adding..." : "Add Interview"}
        </button>
      </form>

      {isLoading && <p className="mt-4 text-slate-600"> Loading interviews... </p>}

      {isError && <p className="mt-4 text-red-600"> Failed to load interviews. </p>}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <p className="mt-4 text-slate-600"> No interviews scheduled yet. </p>
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

                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(interview.id)}
                  disabled={deleteMutation.isPending}
                  className="text-sm text-red-600 hover:underline disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
