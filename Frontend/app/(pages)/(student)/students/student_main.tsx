"use client";

import { useState, useEffect } from "react";
import CourseCard from "./components/CourseCard";
import { studentService, type MyCourse } from "@/app/services/student.service";

export default function StudentMain() {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedCourses, setLikedCourses] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");

  // Load language from localStorage
  useEffect(() => {
    const savedLang = (localStorage.getItem("language") || "uz") as "uz" | "ru" | "en";
    setLanguage(savedLang);
  }, []);

  // Fetch courses from backend
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);
        const data = await studentService.getMyCourses();
        setCourses(data);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.response?.data?.message || "Kurslarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const handleLike = (courseId: string) => {
    setLikedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  return (
    <>
      <h1 className="text-lg font-semibold text-[#1a1a1a] mb-4">
        {language === "uz" && "Mening kurslarim"}
        {language === "ru" && "Мои курсы"}
        {language === "en" && "My Courses"}
      </h1>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F7FFF]"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">
            {language === "uz" && "Xatolik:"}
            {language === "ru" && "Ошибка:"}
            {language === "en" && "Error:"}
          </p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && courses.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {language === "uz" && "Sizda hali kurslar mavjud emas"}
            {language === "ru" && "У вас еще нет курсов"}
            {language === "en" && "You don't have any courses yet"}
          </p>
        </div>
      )}

      {/* Courses grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((item) => {
            const courseUser = item.course.user || item.course.teacher;
            const instructorName = courseUser?.fullName || "Noma'lum Mentor";
            const instructorAvatar = courseUser?.file 
              ? `${process.env.NEXT_PUBLIC_API_URL}${courseUser.file}` 
              : "";
            const thumbnailUrl = item.course.thumbnail 
              ? `${process.env.NEXT_PUBLIC_API_URL}${item.course.thumbnail}`
              : "/bolakay.png";

            return (
              <CourseCard
                key={item.course.id}
                id={item.course.id}
                title={item.course.title}
                instructor={instructorName}
                instructorAvatar={instructorAvatar}
                thumbnail={thumbnailUrl}
                progress={item.progress || 0}
                category={item.course.category?.name || "Kurs"}
                isLiked={likedCourses.has(String(item.course.id))}
                onLike={() => handleLike(String(item.course.id))}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
