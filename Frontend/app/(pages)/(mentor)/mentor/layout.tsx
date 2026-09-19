import MentorSidebar from "../components/MentorSidebar";
import MentorHeader from "../components/MentorHeader";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden text-gray-900">
      <MentorSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <MentorHeader />
        {children}
      </main>
    </div>
  );
}
