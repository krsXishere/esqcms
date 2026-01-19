"use client";

import { useState } from "react";

export type Row = {
  id: string;
  model: string;
  operator: string;
  time: string;
  status: "Pending" | "Revision" | "Approved";
};

const PAGE_SIZE = 6;

export default function Table({ data }: { data: Row[] }) {
  const [page, setPage] = useState(1);

  const totalItems = 24; // dummy total
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const paginatedData = data.slice(0, PAGE_SIZE); // dummy slice

  const statusColor = (status: Row["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "Revision":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* TABLE */}
      <div className="overflow-x-auto px-3 py-3">
        <table className="w-full text-sm">
          <thead className="relative">
            <tr>
              {/* BACKGROUND FULL */}
              <th
                colSpan={6}
                className="absolute inset-0 bg-gray-100 rounded-t-xl"
              />
            </tr>

            <tr className="relative text-gray-600">
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Operator</th>
              <th className="px-4 py-3 text-left font-semibold">
                Submitted Time
              </th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {paginatedData.map((row) => (
              <tr key={row.id} className="border-t border-gray-200">
                <td className="px-4 py-3">{row.id}</td>
                <td className="px-4 py-3">{row.model}</td>
                <td className="px-4 py-3">{row.operator}</td>
                <td className="px-4 py-3">{row.time}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${statusColor(
                        row.status
                      )}`}
                    />
                    <span className="text-xs text-gray-600">{row.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs text-gray-400 bg-gray-200 hover:bg-gray-300 px-5 py-1 rounded-lg">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500">
        <span>
          Showing {start + 1}–{Math.min(end, totalItems)} of {totalItems}{" "}
          results
        </span>

        {/* PAGINATION */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-2 py-1 rounded border hover:bg-gray-100"
          >
            ‹
          </button>

          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded border ${
                page === p ? "bg-gray-300 text-white" : "hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-2 py-1 rounded border hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
