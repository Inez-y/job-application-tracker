import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/Card";

type TrendPoint = {
  month: string;
  count: number;
};

type Props = {
  data: TrendPoint[];
};

export function ApplicationTrendChart({ data }: Props) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">
        Applications Over Time
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Monthly applications baed on date applied.
      </p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No application trend data yet.
        </p>
      ) : (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
