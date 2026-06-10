import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "../../components/ui/Card";

type Props = {
  completedCount: number;
  pendingCount: number;
};

const chartColors = ["#334155", "#cbd5e1"];

export function ReminderCompletionChart({
  completedCount,
  pendingCount,
}: Props) {
  const total = completedCount + pendingCount;

  const data = [
    { name: "Completed", value: completedCount },
    { name: "Pending", value: pendingCount },
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">
        Reminder Completion
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Completed vs pending reminders.
      </p>

      {total === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No reminders yet.
        </p>
      ) : (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                labelLine={false}
                label={({ name, percent, x, y }) => (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-slate-700 text-xs"
                  >
                    <tspan x={x} dy="-0.4em">
                      {name}
                    </tspan>
                    <tspan x={x} dy="1.2em">
                      {`${((percent ?? 0) * 100).toFixed(0)}%`}
                    </tspan>
                  </text>
                )}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {total > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-slate-500">Completed</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {completedCount}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-slate-500">Pending</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {pendingCount}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
