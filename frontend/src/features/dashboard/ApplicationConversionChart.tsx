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
import type { ApplicationConversionRate } from "../../types/dashboard";

type Props = {
  data: ApplicationConversionRate[];
};

export function ApplicationConversionChart({ data }: Props) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">
        Application Conversion Rates
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Percentage of applications that moved from one stage to another.
      </p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No conversion data yet.
        </p>
      ) : (
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={145}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, _name, item) => {
                  const payload = item.payload as ApplicationConversionRate;

                  return [
                    `${value}% (${payload.toCount}/${payload.fromCount})`,
                    "Conversion",
                  ];
                }}
              />
              <Bar dataKey="rate" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
