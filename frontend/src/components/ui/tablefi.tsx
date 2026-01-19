"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type RowFI = {
  id: string;
  model: string;
  operator: string;
  time: string;
  afterRepair: string;
  status: "Pending" | "Revision" | "Approved";
};

const TABS = ["All", "Pending", "Revision", "Approved"] as const;
const PAGE_SIZE = 6;

export default function TableFI({ data }: { data: RowFI[] }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  /* ================= FILTER ================= */
  const filteredData = data.filter((d) => {
    const matchTab = activeTab === "All" || d.status === activeTab;
    const matchSearch =
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  /* ================= PAGINATION ================= */
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedData = filteredData.slice(start, end);
  const router = useRouter();

  /* ================= STATUS COLOR ================= */
  const statusColor = (status: RowFI["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-gray-400";
      case "Revision":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* SEARCH & TABS */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-6">
          {/* SEARCH */}
          <div className="relative w-full max-w-xs shrink-0">
            <input
              type="text"
              placeholder="Search by ID or model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 pl-9 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* TABS */}
          <div className="relative w-full overflow-x-auto">
            <div className="flex min-w-max items-center gap-16 whitespace-nowrap pr-2">
              {TABS.map((tab) => {
                const count =
                  tab === "All"
                    ? data.length
                    : data.filter((d) => d.status === tab).length;

                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setPage(1);
                    }}
                    className={`px-15 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
                      activeTab === tab
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1" />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto px-3 py-3">
        <table className="w-full table-fixed text-sm">
          <thead className="relative">
            <tr>
              <th
                colSpan={7}
                className="absolute inset-0 bg-gray-100 rounded-t-xl"
              />
            </tr>
            <tr className="relative text-gray-600">
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">
                Operator
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Submitted Time
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                After Repair
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
                <td className="px-4 py-3 hidden lg:table-cell">
                  {row.operator}
                </td>
                <td className="px-4 py-3">{row.time}</td>
                <td className="px-4 py-3">{row.afterRepair}</td>
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
                  <button
                    onClick={() =>
                      router.push(`/supervisor/checksheet/fi/${row.id}`)
                    }
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-5 py-1 rounded-lg text-gray-400"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 pb-4 text-xs text-gray-500">
        <span>
          Showing {start + 1}–{Math.min(end, totalItems)} of {totalItems}{" "}
          results
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-2 py-1 rounded border hover:bg-gray-100"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
