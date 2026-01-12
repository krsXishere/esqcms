"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { week: "W1", good: 40, repair: 8, ng: 4 },
  { week: "W2", good: 38, repair: 10, ng: 5 },
  { week: "W3", good: 42, repair: 6, ng: 3 },
  { week: "W4", good: 39, repair: 9, ng: 4 },
  { week: "W5", good: 41, repair: 7, ng: 3 },
  { week: "W6", good: 40, repair: 8, ng: 4 },
  { week: "W7", good: 43, repair: 5, ng: 2 },
  { week: "W8", good: 44, repair: 4, ng: 2 },
];

export default function FITrend() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />

        {/* LEGEND */}
        <Legend
          verticalAlign="bottom"
          height={24}
          iconType="square"
          wrapperStyle={{ fontSize: 10 }}
        />

        <Bar dataKey="repair" stackId="a" fill="#9ca3af" name="After Repair" />
        <Bar dataKey="good" stackId="a" fill="#d1d5db" name="Good" />
        <Bar dataKey="ng" stackId="a" fill="#6b7280" name="NG" />
      </BarChart>
    </ResponsiveContainer>
  );
}
