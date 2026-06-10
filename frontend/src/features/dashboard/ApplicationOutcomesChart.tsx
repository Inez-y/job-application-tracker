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

export function ApplicationOutcomesChart({
  wishlistCount,
  appliedCount,
  onlineAssessmentCount,
  interviewingCount,
  offerCount,
  rejectedCount,
  withdrawnCount,
}: Props) {
  const activeCount =
    wishlistCount + appliedCount + onlineAssessmentCount + interviewingCount;

  const data = [
    { outcome: "Still Active", count: activeCount },
    { outcome: "Offer", count: offerCount },
    { outcome: "Rejected", count: rejectedCount },
    { outcome: "Withdrawn", count: withdrawnCount },
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">
        Application Outcomes
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Active applications compared with final outcomes.
      </p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
                type="category"
                dataKey="outcome"
                width={105}
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
