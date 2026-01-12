import TableFI from "@/components/ui/tablefi";
import type { RowFI } from "@/components/ui/tablefi";

const FI_DATA: RowFI[] = [
  {
    id: "FI-2025-0015",
    model: "Model X",
    operator: "Sareh Azis Panegar",
    time: "14:30 AM",
    afterRepair: "1 Item",
    status: "Pending",
  },
  {
    id: "FI-2025-0014",
    model: "Model Y",
    operator: "Sareh Azis Panegar",
    time: "14:35 PM",
    afterRepair: "2 Items",
    status: "Approved",
  },
  {
    id: "FI-2025-0013",
    model: "Model Z",
    operator: "Sareh Azis Panegar",
    time: "14:45 PM",
    afterRepair: "3 Items",
    status: "Revision",
  },
];

export default function FIPage() {
  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">FI Table</h1>
        <p className="text-sm text-gray-400">
          All checksheet final inspection for validator in one place
        </p>
      </div>

      {/* TABLE */}
      <TableFI data={FI_DATA} />
    </div>
  );
}
