"use client";
 
import { useCourseStore } from "@/app/store/useCourseStore";

export function useLessonMeta(courseId: string, sectionId: string) {
  const { courses } = useCourseStore();
  const currentCourse = courses.find((c) => c.id.toString() === courseId);
  const courseTitle = currentCourse?.title || "Frontend dasturlash";
 
  const isBackend = courseTitle.toLowerCase().includes("backend");
 
  let lessonName = "Asosiy dars";
  if (isBackend) {
    lessonName = sectionId === "1" ? "Node JS ga kirish" : "Ma'lumotlar bazasi bilan ishlash";
  } else {
    lessonName = sectionId === "1" ? "Veb dasturlashga kirish" : "CSS selektorlari va xossalari";
  }
 
  return { courseTitle, lessonName };
}
 