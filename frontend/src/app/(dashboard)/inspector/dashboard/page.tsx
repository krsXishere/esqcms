"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/ui/stat-card";
import Table2, { type Row2 } from "@/components/ui/table2";
import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

const data: Row2[] = [
  {
    id: "FI-2025-0015",
    model: "Model X",
    type: "FI",
    status: "Pending",
    updatedAt: "2025-12-03 14:30",
  },
  {
    id: "DIR-2025-0014",
    model: "Model Y",
    type: "DIR",
    status: "Pending",
    updatedAt: "2025-12-03 14:35",
  },
  {
    id: "DIR-2025-0013",
    model: "Model Z",
    type: "DIR",
    status: "Revision",
    updatedAt: "2025-12-03 14:37",
  },
  {
    id: "FI-2025-0012",
    model: "Model B",
    type: "FI",
    status: "Approved",
    updatedAt: "2025-12-03 14:49",
  },
  {
    id: "DIR-2025-0011",
    model: "Model C",
    type: "DIR",
    status: "Revision",
    updatedAt: "2025-12-03 15:45",
  },
  {
    id: "FI-2025-0010",
    model: "Model A",
    type: "FI",
    status: "Approved",
    updatedAt: "2025-12-03 16:24",
  },
];

export default function OperatorDashboard() {
  const router = useRouter();
  const [openAction, setOpenAction] = useState(false);

  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        {/* LEFT */}
        <div>
          <h1 className="text-xl font-semibold">
            Welcome, Sareh Azis Panegar
          </h1>
          <p className="text-sm text-gray-400">
            Overview of your work and recent activity
          </p>
        </div>

        {/* RIGHT – QUICK ACTION */}
        <div className="relative flex flex-col items-end gap-1">
          <span className="text-xs text-gray-400 mr-2">
            Quick actions.
          </span>

          <button
            onClick={() => setOpenAction((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-400"
          >
            <PlusIcon className="w-4 h-4" />
            Create Checksheet
          </button>

          {/* DROPDOWN */}
          {openAction && (
            <div className="absolute top-full mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-md text-xs overflow-hidden z-10">
              <button
                onClick={() => {
                  router.push("/inspector/checksheet/dir");
                  setOpenAction(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Create DIR
              </button>

              <button
                onClick={() => {
                  router.push("/inspector/checksheet/fi");
                  setOpenAction(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Create FI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pending Validation"
          value={1}
          icon={<ClockIcon className="w-5 h-5" />}
        />

        <StatCard
          label="Revision Needed"
          value={3}
          icon={<ArrowPathIcon className="w-5 h-5" />}
        />

        <StatCard
          label="Approved"
          value={1}
          icon={<CheckCircleIcon className="w-5 h-5" />}
        />
      </div>

      {/* TABLE */}
      <div>
        <h2 className="text-sm font-medium mb-3 text-gray-600">
          Recent Activity
        </h2>
        <Table2 data={data} />
      </div>
    </div>
  );
}
