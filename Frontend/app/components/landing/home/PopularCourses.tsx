"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "../../../context/LanguageContext";
import { getCourses } from "@/app/lib/api/courses";
import { getCategories } from "@/app/lib/api/categories";
interface Category {
  id: number;
  name: string;
}

interface CourseAPI {
  id: number;
  banner: string;
  introVideo: string;
  name: string;
  description: string;
  level: string;
  price: string;
  categoryId: number;
  categories: Category;
}


export default function PopularCourses() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [likedCourses, setLikedCourses] = useState<Record<string, boolean>>({});
  
  const [courses, setCourses] = useState<CourseAPI[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          getCourses(),
          getCategories()
        ]);
        
        const allCourses = (coursesRes as unknown as CourseAPI[]) || [];
        const activeCourses = allCourses.filter((c: any) => !c.status || c.status.toLowerCase() !== 'inactive');
        setCourses(activeCourses);
        
        const activeCategoryIds = new Set(activeCourses.map(c => c.categoryId));
        const filteredCategories = (categoriesRes || []).filter(cat => activeCategoryIds.has(cat.id));
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleLike = (id: string) => {
    setLikedCourses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://63.180.181.4:8080";

  const filteredCourses =
    activeCategory === "all"
      ? courses
      : courses.filter((c) => c.categoryId === activeCategory);

  const displayedCourses = filteredCourses.slice(0, 6);

  return (
    <section id="courses" className="pt-8 pb-16 bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-200">
      <div className="container">
        {/* Heading */}
        <h2
          className="text-center"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "48px",
            lineHeight: "60px",
            letterSpacing: 0,
            marginBottom: "32px",
          }}
          // Color handled via Tailwind below
        >
          <span className="text-[#0F172A] dark:text-white">
            {t("courses.title")}
          </span>
        </h2>

        {/* Subtitle */}
        <p
          className="text-center text-[#636C79] dark:text-[#94A3B8]"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "30px",
            letterSpacing: 0,
            marginBottom: "32px",
          }}
        >
          {t("courses.subtitle")}
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 border cursor-pointer ${
              activeCategory === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 border-blue-100 dark:border-[#1E293B] hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            {t("courses.categories.all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 border cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white dark:bg-[#151C28] text-slate-600 dark:text-slate-300 border-blue-100 dark:border-[#1E293B] hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {displayedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-white dark:bg-[#151C28] rounded-2xl overflow-hidden flex flex-col hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-1 duration-200 border border-[#E2E8F0] dark:border-[#1E293B] cursor-pointer w-full h-full"
              >
                {/* Course image */}
                <div className="relative w-full h-56 overflow-hidden flex-shrink-0 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-gradient-to-br from-indigo-600 to-violet-700">
                  <img
                    src={`${API_URL}${course.banner?.startsWith('/') ? '' : '/'}${course.banner}`}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-600`}>
                      {course.categories?.name || course.level}
                    </span>
                  </div>
                </div>

                {/* Card content */}
                <div className="flex flex-col flex-1 p-5 gap-4">
                  <div className="flex flex-col gap-4">
                    {/* Mentor + Like */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden flex-shrink-0">
                          O
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Oybek Safarov
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike(course.id.toString());
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Sevimlilarga qo'shish"
                      >
                        <svg
                          className={`w-5 h-5 ${likedCourses[course.id.toString()] ? "fill-red-500 text-red-500" : "fill-none"}`}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Course title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {course.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-1">
                        (5.0)
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-auto pt-2">
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-0.5">
                      {t("courses.price_label")}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {new Intl.NumberFormat("ru-RU").format(Number(course.price) || 0)} UZS
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="text-center mt-8">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-8 py-3 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all cursor-pointer shadow-xs"
          >
            {t("courses.view_all")}
          </Link>
        </div>
      </div>
    </section>
  );
}
