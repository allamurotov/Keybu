import Link from "next/link";
 
interface LessonHeaderProps {
  courseId: string;
  sectionId: string;
  courseTitle: string;
}
 
export default function LessonHeader({ courseId, sectionId, courseTitle }: LessonHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-[22px] font-bold text-gray-900 mb-1.5">Darslar</h1>
      <div className="flex items-center text-[13px] font-medium gap-2 flex-wrap">
        <Link href="/dashboard/courses/allCourses" className="text-gray-500 hover:text-gray-700 transition-colors">Kurslar</Link>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <Link href={`/dashboard/courses/allCourses/${courseId}`} className="text-gray-500 hover:text-gray-700 transition-colors">{courseTitle}</Link>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <Link href={`/dashboard/courses/allCourses/${courseId}/sections`} className="text-gray-500 hover:text-gray-700 transition-colors">Bo&apos;limlar</Link>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <Link href={`/dashboard/courses/allCourses/${courseId}/sections/${sectionId}/lessons`} className="text-gray-500 hover:text-gray-700 transition-colors">Darslar</Link>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="text-gray-900">{courseTitle}</span>
      </div>
    </div>
  );
}
 