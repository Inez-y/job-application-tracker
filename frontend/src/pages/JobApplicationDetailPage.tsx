import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { deleteJobApplication, getJobApplicationById, getStatusHistory,
} from "../api/jobApplicationsApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ApplicationNotesSection } from "../features/jobApplications/ApplicationNotesSection";
import { InterviewsSection } from "../features/jobApplications/InterviewsSection";
import { RemindersSection } from "../features/jobApplications/RemindersSection";
import { DocumentsSection } from "../features/jobApplications/DocumentsSection";
import { StatusHistorySection } from "../features/jobApplications/StatusHistorySection";
import { EmailTemplatePreviewSection } from "../features/jobApplications/EmailTemplatePreviewSection";
import { formatDate } from "../utils/dateFormat";

export function JobApplicationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["jobApplication", id],
        queryFn: () => getJobApplicationById(id!),
        enabled: Boolean(id),
    });

    async function handleDelete() {
        if (!id) {
          return;
        }
    
        setServerError(null);
        setIsDeleting(true);
    
        try {
          await deleteJobApplication(id);
          navigate("/applications");
        } catch {
          setServerError("Failed to delete job application.");
        } finally {
          setIsDeleting(false);
          setIsDeleteDialogOpen(false);
        }
    }

    if (isLoading) {
        return <main className="p-8"> Loading application... </main>
    }

    if (isError || !data) {
        return (
            <main className="p-8">
                <p className="text-red-600">Failed to load application.</p>
                <Link to="/applications" className="mt-4 inline-block underline">
                    Back to applications
                </Link>
            </main>
        );
    }

    return (
    <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl space-y-6">
        <Card>
            <div className="flex items-center justify-between gap-4">
                <Link to="/applications" className="text-sm text-slate-600 underline">
                    Back to applications
                </Link>

                <div className="flex gap-3">
                    <Link to={`/applications/${data.id}/edit`}>
                        <Button type="button" variant="secondary">
                        Edit
                        </Button>
                    </Link>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    {data.jobTitle}
                </h1>

                <p className="mt-2 text-xl text-slate-700">
                    {data.companyName}
                </p>
                </div>

                <StatusBadge status={data.status} />
            </div>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
                <dt className="text-sm font-medium text-slate-500">Location</dt>
                <dd className="mt-1 text-slate-900">{data.location ?? "-"}</dd>
            </div>

            <div>
                <dt className="text-sm font-medium text-slate-500">Date Applied</dt>
                <dd className="mt-1 text-slate-900">
                    {formatDate(data.dateApplied)}
                </dd>
            </div>

            <div>
                <dt className="text-sm font-medium text-slate-500">Deadline</dt>
                <dd className="mt-1 text-slate-900">
                    {formatDate(data.deadline)}
                </dd>
            </div>

            <div>
                <dt className="text-sm font-medium text-slate-500">Salary Range</dt>
                <dd className="mt-1 text-slate-900">{data.salaryRange ?? "-"}</dd>
            </div>

            <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Job URL</dt>
                <dd className="mt-1">
                {data.jobUrl ? (
                    <a
                    href={data.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                    >
                    Open posting
                    </a>
                ) : (
                    "-"
                )}
                </dd>
            </div>
            </dl>

            <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Notes</h2>

            <p className="mt-2 whitespace-pre-wrap text-slate-700">
                {data.notes || "No notes yet."}
            </p>
            </div>
        </Card>

        {serverError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
            </p>
        )}

        <Card>
            <StatusHistorySection jobApplicationId={data.id} />
        </Card>

        <Card>
            <ApplicationNotesSection jobApplicationId={data.id} />
        </Card>

        <Card>
            <InterviewsSection jobApplicationId={data.id} />
        </Card>

        <Card>
            <RemindersSection jobApplicationId={data.id} />
        </Card>

        <Card>
            <DocumentsSection jobApplicationId={data.id} />
        </Card>

        <Card>
            <EmailTemplatePreviewSection jobApplicationId={data.id} />
        </Card>
        </div>
    
        <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            title="Delete job application?"
            description="This will permanently delete this job application and its related notes, interviews, reminders, and documents. This action cannot be undone."
            confirmLabel="Delete application"
            isLoading={isDeleting}
            onCancel={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDelete}
        />
    </main>
    );
}
