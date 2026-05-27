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
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["jobApplications"],
        queryFn: getJobApplications,
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
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                            <th className="px-4 py-3">Company</th>
                            <th className="px-4 py-3">Job Title</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Deadline</th>
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
                </div>
                )}
            </div>
        </main>
    );
}
