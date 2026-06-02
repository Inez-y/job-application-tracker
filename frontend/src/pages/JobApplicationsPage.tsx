import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getJobApplications } from "../api/jobApplicationsApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatDate } from "../utils/dateFormat";

const statusLabels: Record<number, string> = {
  0: "Wishlist",
  1: "Applied",
  2: "Online Assessment",
  3: "Interviewing",
  4: "Offer",
  5: "Rejected",
  6: "Withdrawn",
};

export function JobApplicationsPage() {
    const [searchParams] = useSearchParams();

    const statusParam = searchParams.get("status");
    const deadlineParam = searchParams.get("deadline");
    const sortParam = searchParams.get("sort");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>(statusParam ?? "");
    const [deadlineFilter] = useState<string>(deadlineParam ?? "");
    const [sortBy, setSortBy] = useState<string>(sortParam === "deadline" ? "deadline" : "createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: [
            "jobApplications",
            search,
            status,
            deadlineFilter,
            sortBy,
            sortDirection,
            page,
        ],
        queryFn: () =>
            getJobApplications({
                search,
                status: status ? Number(status) : undefined,
                sortBy,
                sortDirection,
                page,
        }),
    });

    const applications = data?.items ?? [];

    const visibleApplications =
        deadlineFilter === "upcoming"
            ? applications.filter((application) => {
                if (!application.deadline) {
                    return false;
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const deadline = new Date(application.deadline);
                deadline.setHours(0, 0, 0, 0);

                return deadline >= today;
            })
            : applications;
            
    return (
    <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold text-slate-900">
                Job Applications
            </h1>

            <p className="mt-2 text-slate-600">
                Track and manage your job search pipeline.
            </p>
            </div>

            <Link to="/applications/new">
            <Button type="button">Add Application</Button>
            </Link>
        </div>

        <Card>
            <div className="grid gap-4 md:grid-cols-4">
            <div>
                <label
                htmlFor="applicationSearch"
                className="block text-sm font-medium text-slate-700"
                >
                Search
                </label>

                <input
                id="applicationSearch"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Company or job title"
                />
            </div>

            <div>
                <label
                htmlFor="applicationStatus"
                className="block text-sm font-medium text-slate-700"
                >
                Status
                </label>

                <select
                id="applicationStatus"
                value={status}
                onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                >
                <option value="">All statuses</option>
                <option value="0">Wishlist</option>
                <option value="1">Applied</option>
                <option value="2">Online Assessment</option>
                <option value="3">Interviewing</option>
                <option value="4">Offer</option>
                <option value="5">Rejected</option>
                <option value="6">Withdrawn</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="applicationSortBy"
                className="block text-sm font-medium text-slate-700"
                >
                Sort By
                </label>

                <select
                id="applicationSortBy"
                value={sortBy}
                onChange={(event) => {
                    setSortBy(event.target.value);
                    setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                >
                <option value="createdAt">Created Date</option>
                <option value="companyName">Company Name</option>
                <option value="jobTitle">Job Title</option>
                <option value="dateApplied">Date Applied</option>
                <option value="deadline">Deadline</option>
                <option value="status">Status</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="applicationSortDirection"
                className="block text-sm font-medium text-slate-700"
                >
                Direction
                </label>

                <select
                id="applicationSortDirection"
                value={sortDirection}
                onChange={(event) => {
                    setSortDirection(event.target.value as "asc" | "desc");
                    setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
                </select>
            </div>
            </div>

            {(deadlineFilter === "upcoming" || statusParam) && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <span>
                {deadlineFilter === "upcoming"
                    ? "Showing applications with upcoming deadlines."
                    : `Showing ${statusLabels[Number(status)] ?? "selected"} applications.`}
                </span>

                <Link to="/applications" className="font-medium underline">
                Clear filter
                </Link>
            </div>
            )}
        </Card>

        {isLoading && (
            <Card>
            <p className="text-slate-600">Loading applications...</p>
            </Card>
        )}

        {isError && (
            <Card>
            <p className="text-red-600">Failed to load applications.</p>
            </Card>
        )}

        {!isLoading && !isError && visibleApplications.length === 0 && (
            <Card>
            <p className="text-slate-600">No applications found.</p>
            </Card>
        )}

        {!isLoading && !isError && visibleApplications.length > 0 && (
            <Card className="overflow-hidden p-0">

                <table className="w-full text-center text-sm">
                <thead className="bg-slate-800 text-slate-50">
                    <tr>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Job Title</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date Applied</th>
                    <th className="px-4 py-3 font-medium">Deadline</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {visibleApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                        {application.companyName}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                        {application.jobTitle}
                        </td>

                        <td className="px-4 py-3">
                        <StatusBadge status={application.status} />
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                        {formatDate(application.dateApplied)}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                        {formatDate(application.deadline)}
                        </td>

                        <td className="px-4 py-3">
                        <Link
                            to={`/applications/${application.id}`}
                            className="font-medium text-slate-900 underline"
                        >
                            View
                        </Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>

            </Card>
        )}

        {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
            <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
                Previous
            </Button>

            <p className="text-sm text-slate-600">
                Page {page} of {data.totalPages}
            </p>

            <Button
                type="button"
                variant="secondary"
                disabled={page >= data.totalPages}
                onClick={() =>
                setPage((current) => Math.min(current + 1, data.totalPages))
                }
            >
                Next
            </Button>
            </div>
        )}
        </div>
    </main>
    );
}
