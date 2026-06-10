import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/Card";

type Props = {
  wishlistCount: number;
  appliedCount: number;
  onlineAssessmentCount: number;
  interviewingCount: number;
  offerCount: number;
  rejectedCount: number;
  withdrawnCount: number;
};

export function ApplicationStatusChart({
  wishlistCount,
  appliedCount,
  onlineAssessmentCount,
  interviewingCount,
  offerCount,
  rejectedCount,
  withdrawnCount,
}: Props) {
  const data = [
    { status: "Wishlist", count: wishlistCount },
    { status: "Applied", count: appliedCount },
    { status: "Assessment", count: onlineAssessmentCount },
    { status: "Interviewing", count: interviewingCount },
    { status: "Offer", count: offerCount },
    { status: "Rejected", count: rejectedCount },
    { status: "Withdrawn", count: withdrawnCount },
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">
        Applications by Status
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Current distribution of your job applications.
      </p>

      <div className="mt-4 pr-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="status"
              width={95}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
