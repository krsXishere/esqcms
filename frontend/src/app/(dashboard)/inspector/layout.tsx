import Navbar from "@/components/layouts/navbar2";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="px-0 py-2 pt-0">{children}</main>
    </div>
  );
}
