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

type SourceCount = {
  source: string;
  count: number;
};

type Props = {
  data: SourceCount[];
};

const allSources = [
  { source: "LinkedIn", label: "LinkedIn" },
  { source: "Indeed", label: "Indeed" },
  { source: "CompanyWebsite", label: "Company Website" },
  { source: "Referral", label: "Referral" },
  { source: "Recruiter", label: "Recruiter" },
  { source: "Handshake", label: "Handshake" },
  { source: "Other", label: "Other" },
];

export function ApplicationSourceChart({ data }: Props) {
  const countBySource = new Map(
    data.map((item) => [item.source, item.count])
  );

  const chartData = allSources.map((source) => ({
    source: source.label,
    count: countBySource.get(source.source) ?? 0,
  }));

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">
        Applications by Source
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Where your job applications are coming from.
      </p>

      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="source"
              width={115}
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
