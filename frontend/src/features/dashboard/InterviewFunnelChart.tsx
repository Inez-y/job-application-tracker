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
};

export function InterviewFunnelChart({
  wishlistCount,
  appliedCount,
  onlineAssessmentCount,
  interviewingCount,
  offerCount,
}: Props) {
  const data = [
    { stage: "Wishlist", count: wishlistCount },
    { stage: "Applied", count: appliedCount },
    { stage: "Assessment", count: onlineAssessmentCount },
    { stage: "Interviewing", count: interviewingCount },
    { stage: "Offer", count: offerCount },
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">
        Interview Conversion Funnel
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Current application pipeline from saved roles to offers.
      </p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="stage"
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
