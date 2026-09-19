import Sidebar from "@/app/components/dashboard/SideBar";
import Header from "@/app/components/dashboard/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden text-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />
        {children}
      </main>
    </div>
  );
}
