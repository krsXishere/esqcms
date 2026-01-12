type Props = {
  label: string;
  value: number;
  icon?: React.ReactNode;
};

export default function StatCard({ label, value, icon }: Props) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold mt-1 text-gray-900">
          {value}
        </p>
      </div>

      {icon && (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
          {icon}
        </div>
      )}
    </div>
  );
}
