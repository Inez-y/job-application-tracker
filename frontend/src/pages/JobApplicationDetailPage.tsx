import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getJobApplicationById,
  getStatusHistory,
} from "../api/jobApplicationsApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ApplicationNotesSection } from "../features/jobApplications/ApplicationNotesSection";
import { InterviewsSection } from "../features/jobApplications/InterviewsSection";
import { RemindersSection } from "../features/jobApplications/RemindersSection";
import { DocumentsSection } from "../features/jobApplications/DocumentsSection";
import { EmailTemplatePreviewSection } from "../features/jobApplications/EmailTemplatePreviewSection";

const statusLabels: Record<number, string> = {
  0: "Wishlist",
  1: "Applied",
  2: "Online Assessment",
  3: "Interviewing",
  4: "Offer",
  5: "Rejected",
  6: "Withdrawn",
};

export function JobApplicationDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["jobApplication", id],
        queryFn: () => getJobApplicationById(id!),
        enabled: Boolean(id),
    });

    const {
        data: statusHistory,
        isLoading: isStatusHistoryLoading,
        } = useQuery({
        queryKey: ["statusHistory", id],
        queryFn: () => getStatusHistory(id!),
        enabled: Boolean(id),
    });

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

            <Link to={`/applications/${data.id}/edit`}>
                <Button type="button">Edit</Button>
            </Link>
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
                {data.dateApplied
                    ? new Date(data.dateApplied).toLocaleDateString()
                    : "-"}
                </dd>
            </div>

            <div>
                <dt className="text-sm font-medium text-slate-500">Deadline</dt>
                <dd className="mt-1 text-slate-900">
                {data.deadline
                    ? new Date(data.deadline).toLocaleDateString()
                    : "-"}
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

        <Card>
            <h2 className="text-lg font-semibold text-slate-900">Status History</h2>

            {isStatusHistoryLoading ? (
            <p className="mt-2 text-slate-600">Loading status history...</p>
            ) : !statusHistory || statusHistory.length === 0 ? (
            <p className="mt-2 text-slate-600">No status changes yet.</p>
            ) : (
            <div className="mt-4 space-y-3">
                {statusHistory.map((item) => (
                <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                    <p className="font-medium text-slate-900">
                    {statusLabels[item.oldStatus]} → {statusLabels[item.newStatus]}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                    {new Date(item.changedAt).toLocaleString()}
                    </p>
                </div>
                ))}
            </div>
            )}
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
    </main>
    );
}
