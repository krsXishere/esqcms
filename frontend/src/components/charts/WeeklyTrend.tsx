"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const data = [
  { week: "W1", value: 25.01 },
  { week: "W2", value: 25.02 },
  { week: "W3", value: 25.03 },
  { week: "W4", value: 25.04 },
  { week: "W5", value: 25.05 },
  { week: "W6", value: 25.04 },
  { week: "W7", value: 25.03 },
];

export default function WeeklyTrend() {
  return (
    <ResponsiveContainer width="100%" height={289}>
      <LineChart data={data}>
        <XAxis dataKey="week" fontSize={10} />
        <YAxis fontSize={10} domain={[24.95, 25.1]} />
        <Tooltip />
        <ReferenceLine y={24.95} stroke="#bbb" label="LSL" />
        <ReferenceLine y={25.0} stroke="#999" label="Target" />
        <ReferenceLine y={25.05} stroke="#bbb" label="USL" />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#374151"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
