import Link from "next/link";

interface LessonTabsProps {
  courseId: string;
  sectionId: string;
  lessonId: string;
  active: "materials" | "tasks" | "exams";
}

const TAB_ITEMS = [
  { key: "materials", label: "Materiallar", segment: "materials" },
  { key: "tasks", label: "Vazifalar", segment: "tasks" },
  { key: "exams", label: "Imtihonlar", segment: "exams" },
] as const;

export default function LessonTabs({ courseId, sectionId, lessonId, active }: LessonTabsProps) {
  const base = `/dashboard/courses/allCourses/${courseId}/sections/${sectionId}/lessons/${lessonId}`;

  return (
    <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
      {TAB_ITEMS.map((tab) => (
        <Link
          key={tab.key}
          href={`${base}/${tab.segment}`}
          className={`px-5 py-2 rounded-lg text-[14px] font-medium transition-colors ${
            active === tab.key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}