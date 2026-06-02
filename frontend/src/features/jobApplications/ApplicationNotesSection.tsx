import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatDateTime } from "../../utils/dateFormat";
import {
  createApplicationNote,
  deleteApplicationNote,
  getApplicationNotes,
  updateApplicationNote,
} from "../../api/applicationNotesApi";

type Props = { jobApplicationId: string; };

export function ApplicationNotesSection({ jobApplicationId }: Props){
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);

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

    const updateMutation = useMutation({
        mutationFn: () => {
            if (!editingNoteId) {
                throw new Error("No note selected.");
            }

            return updateApplicationNote(jobApplicationId, editingNoteId, {
                content,
            });
        },
        onSuccess: () => {
            setEditingNoteId(null);
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
            setNoteIdToDelete(null);

            queryClient.invalidateQueries({
                queryKey: ["applicationNotes", jobApplicationId],
            });
        },
    });

    return (
        <section>
            <h2 className="text-lg font-semibold text-slate-900"> Application Notes </h2>

            <form onSubmit={(event) => {
                    event.preventDefault();

                    if (!content.trim()) {
                        return;
                    }

                    if (editingNoteId) {
                        updateMutation.mutate();
                    } else {
                        createMutation.mutate();
                    }
                }} 
                className="mt-4">
                <label
                    htmlFor="noteContent"
                    className="block text-sm font-medium text-slate-700"
                    >
                    Note
                </label>

                <textarea
                    id="noteContent"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Add a note about recruiter replies, interviews, follow-ups..."
                />

                <div className="mt-3 flex gap-3">
                    {editingNoteId && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                        setEditingNoteId(null);
                        setContent("");
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
                            !content.trim()
                        }
                        >
                        {editingNoteId
                            ? updateMutation.isPending
                            ? "Saving..."
                            : "Save Changes"
                            : createMutation.isPending
                            ? "Adding..."
                            : "Add Note"}
                    </Button>
                </div>
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
                                {formatDateTime(note.createdAt)}
                            </p>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setEditingNoteId(note.id);
                                    setContent(note.content);
                                }}
                            >
                                Edit
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => setNoteIdToDelete(note.id)}
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
                isOpen={Boolean(noteIdToDelete)}
                title="Delete note?"
                description="This will permanently delete this note. This action cannot be undone."
                confirmLabel="Delete note"
                isLoading={deleteMutation.isPending}
                onCancel={() => setNoteIdToDelete(null)}
                onConfirm={() => {
                    if (!noteIdToDelete) {
                    return;
                    }

                    deleteMutation.mutate(noteIdToDelete);
                }}
            />
        </section>
    );
}
