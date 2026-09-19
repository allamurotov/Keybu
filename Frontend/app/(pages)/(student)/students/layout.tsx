import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0b0f19] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#eef1f4] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
