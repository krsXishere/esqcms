"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const data = [
  { bin: "24.90", count: 2 },
  { bin: "24.95", count: 5 },
  { bin: "25.00", count: 18 },
  { bin: "25.05", count: 12 },
  { bin: "25.10", count: 4 },
];

export default function HistogramSpec() {
  return (
    <div className="relative h-full">
      {/* CHART */}
      <div className="h-full">
        <ResponsiveContainer width="90%" height="90%">
          <BarChart data={data}>
            <XAxis dataKey="bin" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <ReferenceLine x="24.95" stroke="#cbd5e1" label="LSL" />
            <ReferenceLine x="25.05" stroke="#cbd5e1" label="USL" />
            <Bar dataKey="count" fill="#d1d5db" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* OUT OF SPEC BOX (INSIDE CHART CARD) */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-2 mb-4 rounded-md border border-gray-200 bg-gray-100 px-3 py-1 text-xs text-gray-600">
          Out-of-spec: <span className="font-semibold">18.4%</span>
        </div>
      </div>
    </div>
  );
}
