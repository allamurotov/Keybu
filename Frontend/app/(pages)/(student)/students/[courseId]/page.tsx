import LessonMain from "./lesson_main";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <LessonMain courseId={resolvedParams.courseId} />;
}
