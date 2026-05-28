import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getJobApplications } from "../api/jobApplicationsApi";

const statusLabels: Record<number, string> = {
    0: "Wishlist",
    1: "Applied",
    2: "Online Asessment",
    3: "Interviewing",
    4: "Offer",
    5: "Rejected",
    6: "Withdrawn",
};

export function JobApplicationsPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<number | "">("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, isError, error } = useQuery({
    queryKey: [
        "jobApplications",
        search,
        status,
        sortBy,
        sortDirection,
        page,
        pageSize,
    ],
    queryFn: () =>
        getJobApplications({
            search,
            status,
            sortBy,
            sortDirection,
            page,
            pageSize,
        }),
    });

    if (isLoading) {
        return <main className="p-8">
            <p> Loading applications... </p>
        </main>
    }

    if (isError) {
        return (
            <main className="p-8">
                <h1 className="text-2xl font-bold">Job Applications</h1>
                
                <p className="mt-4 text-red-600">
                    Failed to load applications.
                </p>
                
                <pre className="mt-4 rounded bg-slate-100 p-4 text-sm">
                    {String(error)}
                </pre>
        </main>
        );
    }

    const applications = data?.items ?? [];

    return (
        <main className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Job Applications
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Total applications: {data?.totalCount ?? 0}
                    </p>
                </div>

                <Link to="/dashboard" className="text-slate-700 underline">
                    Dashboard
                </Link>
                
                <Link
                    to="/applications/new"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-white"
                >
                    Add Application
                </Link>

                {applications.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 shadow">
                    <p className="text-slate-600">
                        No job applications yet. Create one from Swagger or add a frontend form next.
                    </p>
                </div>
                ) : (
                <div className="overflow-hidden rounded-2xl bg-white shadow">
                    <div className="mb-6 rounded-2xl bg-white p-4 shadow">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Search
                            </label>
                            <input
                                value={search}
                                onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                                }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                placeholder="Company, title, location..."
                            />
                            </div>

                            <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(event) => {
                                const value = event.target.value;
                                setStatus(value === "" ? "" : Number(value));
                                setPage(1);
                                }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value=""> All statuses </option>
                                <option value={0}> Wishlist </option>
                                <option value={1}> Applied </option>
                                <option value={2}>Online Assessment </option>
                                <option value={3}> Interviewing </option>
                                <option value={4}> Offer </option>
                                <option value={5}> Rejected </option>
                                <option value={6}> Withdrawn </option>
                            </select>
                            </div>

                            <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(event) => {
                                setSortBy(event.target.value);
                                setPage(1);
                                }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="createdAt"> Created At </option>
                                <option value="company"> Company </option>
                                <option value="jobTitle"> Job Title </option>
                                <option value="deadline"> Deadline </option>
                                <option value="dateApplied"> Date Applied </option>
                            </select>
                            </div>

                            <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Direction
                            </label>
                            <select
                                value={sortDirection}
                                onChange={(event) => {
                                setSortDirection(event.target.value as "asc" | "desc");
                                setPage(1);
                                }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="desc"> Descending </option>
                                <option value="asc"> Ascending </option>
                            </select>
                            </div>
                        </div>
                        </div>
                    
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                            <th className="px-4 py-3"> Company </th>
                            <th className="px-4 py-3"> Job Title </th>
                            <th className="px-4 py-3"> Location </th>
                            <th className="px-4 py-3"> Status </th>
                            <th className="px-4 py-3"> Deadline </th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {applications.map((application) => (
                            <tr key={application.id} className="border-b border-slate-200">
                                <td className="px-4 py-3 font-medium"> 
                                    <Link
                                        to={`/applications/${application.id}`}
                                        className="hover:underline"
                                    >
                                        {application.companyName}
                                    </Link>
                                </td>      
                                <td className="px-4 py-3">   
                                    <Link
                                        to={`/applications/${application.id}`}
                                        className="hover:underline"
                                    > {application.jobTitle}
                                    </Link> 
                                </td>                             
                                <td className="px-4 py-3"> {application.location ?? "-"} </td>                               
                                <td className="px-4 py-3"> {statusLabels[application.status]} </td>
                                <td className="px-4 py-3">
                                    {application.deadline
                                        ? new Date(application.deadline).toLocaleDateString()
                                        : "-"}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>

                    {data && data.totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow">
                            <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            className="rounded-lg border px-4 py-2 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <p className="text-sm text-slate-600">
                            Page {data.page} of {data.totalPages}
                            </p>

                            <button
                            type="button"
                            disabled={page >= data.totalPages}
                            onClick={() =>
                                setPage((current) =>
                                data ? Math.min(data.totalPages, current + 1) : current + 1
                                )
                            }
                            className="rounded-lg border px-4 py-2 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        )}
                </div>
                )}
            </div>
        </main>
    );
}
