import TableDIR from "@/components/ui/tabledir";
import type { Row } from "@/components/ui/tabledir";

const DIR_DATA: Row[] = [
  {
    id: "DIR-2025-0015",
    model: "Model X",
    partName: "Brake Assembly",
    operator: "Sareh Azis Panegar",
    time: "14:30 AM",
    status: "Pending",
  },
  {
    id: "DIR-2025-0014",
    model: "Model Y",
    partName: "Gear Housing",
    operator: "Sareh Azis Panegar",
    time: "14:35 PM",
    status: "Pending",
  },
  {
    id: "DIR-2025-0013",
    model: "Model Z",
    partName: "Valve Body",
    operator: "Sareh Azis Panegar",
    time: "14:37 AM",
    status: "Revision",
  },
  {
    id: "DIR-2025-0012",
    model: "Model B",
    partName: "Motor Mount",
    operator: "Sareh Azis Panegar",
    time: "14:49 AM",
    status: "Approved",
  },
  {
    id: "DIR-2025-0011",
    model: "Model C",
    partName: "Connector Block",
    operator: "Sareh Azis Panegar",
    time: "15:45 AM",
    status: "Revision",
  },
  {
    id: "DIR-2025-0010",
    model: "Model A",
    partName: "Shaft Bearing",
    operator: "Sareh Azis Panegar",
    time: "16:24 AM",
    status: "Approved",
  },
];

export default function DirPage() {
  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">DIR Table</h1>
        <p className="text-sm text-gray-400">
          All checksheet dimensional inspection reports for validator in one
          place
        </p>
      </div>

      {/* TABLE */}
      <TableDIR data={DIR_DATA} />
    </div>
  );
}
