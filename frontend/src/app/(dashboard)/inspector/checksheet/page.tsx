import TableChecksheet, {
  type RowChecksheet,
} from "@/components/ui/tablechecksheet";

const DATA: RowChecksheet[] = [
  {
    id: "FI-2025-0015",
    type: "FI",
    model: "Model X",
    status: "Pending",
    updatedAt: "2025-12-03 14:30",
  },
  {
    id: "DIR-2025-0014",
    type: "DIR",
    model: "Model Y",
    status: "Pending",
    updatedAt: "2025-12-03 14:35",
  },
];

export default function ChecksheetPage() {
  return (
    <div className="space-y-6 text-black">
      <div>
        <h1 className="text-xl font-semibold">Checksheet Table</h1>
        <p className="text-sm text-gray-400">
          All checksheet in one place
        </p>
      </div>

      <TableChecksheet data={DATA} />
    </div>
  );
}
