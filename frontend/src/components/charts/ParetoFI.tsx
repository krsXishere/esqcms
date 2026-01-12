"use client";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { name: "Hydrotest", count: 45 },
  { name: "Painting", count: 32 },
  { name: "Bolts", count: 18 },
  { name: "Packing", count: 12 },
  { name: "Nameplate", count: 8 },
  { name: "Coupling", count: 4 },
  { name: "Sticker FI", count: 2 },
];

// cumulative %
const total = data.reduce((a, b) => a + b.count, 0);
let cumulative = 0;
const paretoData = data.map((d) => {
  cumulative += d.count;
  return {
    ...d,
    cumulative: Math.round((cumulative / total) * 100),
  };
});

export default function ParetoFI() {
  return (
    <div className="space-y-2">
      {/* Subtitle */}
      <p className="text-xs text-gray-400">
        Visual inspection item defect distribution
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={paretoData}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />

          {/* Left axis */}
          <YAxis
            label={{
              value: "Count",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "#6b7280" },
            }}
          />

          {/* Right axis */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: "Percentage",
              angle: 90,
              position: "insideRight",
              style: { fontSize: 10, fill: "#6b7280" },
            }}
          />

          <Tooltip />

          {/* Legend bottom */}
          <Legend
            verticalAlign="bottom"
            height={24}
            iconType="circle"
            wrapperStyle={{ fontSize: 10 }}
          />

          <Bar
            dataKey="count"
            name="Defect Count"
            fill="#e5e7eb"
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            name="Cumulative %"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
