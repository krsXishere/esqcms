import Navbar from "@/components/layouts/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="px-6 py-6 pt-20">{children}</main>
    </div>
  );
}
