import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobApplicationById } from "../api/jobApplicationsApi";

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
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
                <Link to="/applications" className="text-sm text-slate-600 underline">
                    Back to applications
                </Link>

                  <Link
                    to={`/applications/${data.id}/edit`}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                    Edit
                </Link>

                <div className="mt-6">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {data.jobTitle}
                    </h1>

                    <p className="mt-2 text-xl text-slate-700"> {data.companyName} </p>
                </div>

                <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-slate-500"> Status </dt>
                        <dd className="mt-1 text-slate-900"> {statusLabels[data.status]} </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-slate-500"> Location </dt>
                        <dd className="mt-1 text-slate-900"> {data.location ?? "-"} </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-slate-500"> Date Applied </dt>
                        <dd className="mt-1 text-slate-900">
                            {data.dateApplied
                                ? new Date(data.dateApplied).toLocaleDateString()
                                : "-"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-slate-500"> Deadline </dt>
                        <dd className="mt-1 text-slate-900">
                            {data.deadline
                                ? new Date(data.deadline).toLocaleDateString()
                                : "-"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-slate-500"> Salary Range </dt>
                        <dd className="mt-1 text-slate-900"> {data.salaryRange ?? "-"} </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-slate-500"> Job URL </dt>
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
                    <h2 className="text-lg font-semibold text-slate-900"> Notes </h2>
                    
                        <p className="mt-2 whitespace-pre-wrap text-slate-700">
                            {data.notes || "No notes yet."}
                        </p>
                </div>
            </div>
        </main>
    );
}
