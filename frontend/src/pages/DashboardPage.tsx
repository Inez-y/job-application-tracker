import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { getDashboardStats, getUpcomingReminders } from "../api/dashboardApi";

const statusLabels: Record<string, string> = {
  wishlistCount: "Wishlist",
  appliedCount: "Applied",
  onlineAssessmentCount: "Online Assessment",
  interviewingCount: "Interviewing",
  offerCount: "Offer",
  rejectedCount: "Rejected",
  withdrawnCount: "Withdrawn",
};

export function DashboardPage() {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const {
    data: reminders,
    isLoading: isRemindersLoading,
    isError: isRemindersError,
  } = useQuery({
    queryKey: ["upcomingReminders", 7],
    queryFn: () => getUpcomingReminders(7),
  });

  if (isStatsLoading || isRemindersLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p> Loading dashboard... </p>
      </main>
    );
  }

  if (isStatsError || isRemindersError || !stats) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p className="text-red-600"> Failed to load dashboard. </p>
      </main>
    );
  }

  const statusCounts = [
    ["wishlistCount", stats.wishlistCount, 0],
    ["appliedCount", stats.appliedCount, 1],
    ["onlineAssessmentCount", stats.onlineAssessmentCount, 2],
    ["interviewingCount", stats.interviewingCount, 3],
    ["offerCount", stats.offerCount, 4],
    ["rejectedCount", stats.rejectedCount, 5],
    ["withdrawnCount", stats.withdrawnCount, 6],
  ] as const;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Overview of your job search activity.
            </p>
          </div>

          <Link to="/applications/new">
            <Button type="button">Add Application</Button>
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Link to="/applications" className="block">
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-slate-500">Total Applications</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.totalApplications}
              </p>
              <p className="mt-2 text-sm text-slate-500">View all applications</p>
            </Card>
          </Link>

          <Link to="/applications?deadline=upcoming&sort=deadline" className="block">
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-slate-500">Upcoming Deadlines</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.upcomingDeadlineCount}
              </p>
              <p className="mt-2 text-sm text-slate-500">View upcoming deadlines</p>
            </Card>
          </Link>

          <Link to="/applications?reminders=upcoming" className="block">
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-slate-500">Upcoming Reminders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {reminders?.length ?? 0}
              </p>
              <p className="mt-2 text-sm text-slate-500">View reminder details</p>
            </Card>
          </Link>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Applications by Status
            </h2>

            <div className="mt-4 space-y-3">
              {statusCounts.map(([key, count, status]) => (
                <Link
                  key={key}
                  to={`/applications?status=${status}`}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 hover:text-slate-900"
                >
                  <span className="text-slate-700">{statusLabels[key]}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Applications
            </h2>

            {stats.recentApplications.length === 0 ? (
              <p className="mt-4 text-slate-600">No recent applications.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {stats.recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    to={`/applications/${application.id}`}
                    className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">
                      {application.jobTitle}
                    </p>
                    <p className="text-sm text-slate-600">
                      {application.companyName}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming Deadlines
            </h2>

            {stats.upcomingDeadlines.length === 0 ? (
              <p className="mt-4 text-slate-600">No upcoming deadlines.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {stats.upcomingDeadlines.map((deadline) => (
                  <Link
                    key={deadline.id}
                    to={`/applications/${deadline.id}`}
                    className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">
                      {deadline.jobTitle}
                    </p>
                    <p className="text-sm text-slate-600">
                      {deadline.companyName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Deadline:{" "}
                      {deadline.deadline
                        ? new Date(deadline.deadline).toLocaleDateString()
                        : "-"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming Reminders
            </h2>

            {!reminders || reminders.length === 0 ? (
              <p className="mt-4 text-slate-600">No upcoming reminders.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reminders.map((reminder) => (
                  <Link
                    key={reminder.id}
                    to={`/applications/${reminder.jobApplicationId}`}
                    className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">
                      {reminder.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {reminder.companyName} · {reminder.jobTitle}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(reminder.remindAt).toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </section>

        <div className="mt-6">
          <Link to="/applications">
            <Button type="button" variant="secondary">
              View all applications
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
