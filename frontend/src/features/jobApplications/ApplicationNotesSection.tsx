import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplicationNote,
  deleteApplicationNote,
  getApplicationNotes,
} from "../../api/applicationNotesApi";

type Props = { jobApplicationId: string; };

export function ApplicationNotesSection({ jobApplicationId }: Props){
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["applicationNotes", jobApplicationId],
        queryFn: () => getApplicationNotes(jobApplicationId),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            createApplicationNote(jobApplicationId, {
                content,
            }),
        onSuccess: () => {
            setContent("");
            queryClient.invalidateQueries({
                queryKey: ["applicationNotes", jobApplicationId],
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (noteId: string) =>
            deleteApplicationNote(jobApplicationId, noteId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["applicationNotes", jobApplicationId],
            });
        },
    });

    return (
        <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900"> Application Notes </h2>

            <form onSubmit={(event) => {
                    event.preventDefault();

                    if (!content.trim()) {
                        return;
                    }

                    createMutation.mutate();
                }} 
                className="mt-4">
                <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Add a note about recruiter replies, interviews, follow-ups..."
                />

                <button
                    type="submit"
                    disabled={createMutation.isPending || !content.trim()}
                    className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
                >
                    {createMutation.isPending ? "Adding..." : "Add Note"}
                </button>
            </form>

            {isLoading && <p className="mt-4 text-slate-600"> Loading notes... </p>}

            {isError && (
                <p className="mt-4 text-red-600"> Failed to load notes. </p>
            )}

            {!isLoading && !isError && (!data || data.length === 0) && (
                <p className="mt-4 text-slate-600"> No notes yet. </p>
            )}

            {data && data.length > 0 && (
                <div className="mt-4 space-y-3">
                    {data.map((note) => (
                        <div
                        key={note.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                        <p className="whitespace-pre-wrap text-slate-800">
                            {note.content}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {new Date(note.createdAt).toLocaleString()}
                            </p>

                            <button
                            type="button"
                            onClick={() => deleteMutation.mutate(note.id)}
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
