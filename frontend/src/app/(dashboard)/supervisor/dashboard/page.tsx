import StatCard from "@/components/ui/stat-card";
import Table, { type Row } from "@/components/ui/table";
import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/20/solid";

const data: Row[] = [
  {
    id: "FI-2025-0015",
    model: "Model X",
    operator: "Sareh Azis Panegar",
    time: "14:30 AM",
    status: "Pending",
  },
  {
    id: "DIR-2025-0014",
    model: "Model Y",
    operator: "Sareh Azis Panegar",
    time: "14:35 PM",
    status: "Pending",
  },
  {
    id: "FI-2025-0013",
    model: "Model Z",
    operator: "Sareh Azis Panegar",
    time: "14:37 AM",
    status: "Revision",
  },
];

export default function SupervisorDashboard() {
  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Welcome, Sareh Azis Panegar</h1>
        <p className="text-sm text-gray-400">Checksheet Validation Overview</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pending Validation"
          value={1}
          icon={<ClockIcon className="w-5 h-5" />}
        />

        <StatCard
          label="Revision Returned"
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
        <h2 className="text-sm font-medium mb-3 text-gray-600">Recent Activity</h2>
        <Table data={data} />
      </div>
    </div>
  );
}
