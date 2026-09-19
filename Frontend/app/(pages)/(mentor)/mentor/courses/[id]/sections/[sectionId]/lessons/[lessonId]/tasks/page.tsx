"use client";

import MentorHomeworkTasks from "@/app/components/lesson/MentorHomeworkTasks";
import { useParams } from "next/navigation";

export default function MentorLessonTasksPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const sectionId = params?.sectionId as string;
  const lessonId = params?.lessonId as string;

  return (
    <MentorHomeworkTasks
      lessonId={lessonId}
      lessonChrome={{ courseId, sectionId }}
    />
  );
}
