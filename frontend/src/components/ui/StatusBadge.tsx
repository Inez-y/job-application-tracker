import type { ApplicationStatus } from "../../types/jobApplication";

const statusLabels: Record<ApplicationStatus, string> = {
    0: "Wishlist",
    1: "Applied",
    2: "Online Assessment",
    3: "Interviewing",
    4: "Offer",
    5: "Rejected",
    6: "Withdrawn",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
    return (
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {statusLabels[status]}
        </span>
    );
}