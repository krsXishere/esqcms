"use client";

export default function MiniTrend() {
  // contoh data 7 hari
  const data = [12, 14, 13, 15, 16, 15, 17];

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / (max - min)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full h-6">
      {/* baseline */}
      <polyline
        points="0,90 100,90"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="2"
      />

      {/* trend line */}
      <polyline
        points={points}
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
