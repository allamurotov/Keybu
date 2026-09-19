"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, Play, Pause, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PrecisionStars } from "@/app/components/course-details/precision-stars";
import { useLanguage } from "@/app/context/LanguageContext";
import { getCourses } from "@/app/lib/api/courses";
import { getCategories } from "@/app/lib/api/categories";
interface Category {
  id: number;
  name: string;
}

export interface CourseAPI {
  id: number;
  banner: string;
  introVideo: string;
  name: string;
  description: string;
  level: string;
  price: string;
  categoryId: number;
  categories: Category;
  status?: string;
  studentsCount?: number;
}

interface CourseCardProps {
  course: CourseAPI;
  priceLabel: string;
}

function CourseCard({ course, priceLabel }: CourseCardProps) {
  const [liked, setLiked] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://63.180.181.4:8080";

  return (
    <Link
      href={`/courses/${course.id}`}
      className="bg-white dark:bg-[#151C28] rounded-2xl border border-gray-100 dark:border-[#1E293B] overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col"
    >
      <div className={`relative h-56 w-full shrink-0 bg-gradient-to-br from-indigo-600 to-violet-700`}>
        {course.banner && (
          <img
            src={`${API_URL}${course.banner?.startsWith('/') ? '' : '/'}${course.banner}`}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        )}
        <span
          className={`absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full`}
        >
          {course.categories?.name || course.level}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              O
            </div>
            <span className="text-sm text-gray-700 dark:text-slate-300">Oybek Safarov</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked((v) => !v);
            }}
            aria-label="Save"
            className="text-gray-300 dark:text-gray-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Heart
              size={18}
              className={liked ? "fill-rose-400 text-rose-400" : ""}
            />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{course.name}</h3>
          <p className="text-xs text-gray-400 dark:text-[#94A3B8] leading-relaxed line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between">
            <PrecisionStars rating={5.0} stars={5} courseId={course.id.toString()} />
            {course.studentsCount ? (
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                👥 {course.studentsCount} ta o'quvchi
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto pt-2">
          <p className="text-[11px] text-gray-400 dark:text-[#94A3B8] mb-0.5">{priceLabel}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat("ru-RU").format(Number(course.price) || 0)} UZS
          </p>
        </div>
      </div>
    </Link>
  );
}

function CoursesContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeFilter, setActiveFilter] = useState<number | "all">(
    categoryParam ? parseInt(categoryParam, 10) : "all"
  );
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState<CourseAPI[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryParam) {
      setActiveFilter(parseInt(categoryParam, 10));
    } else {
      setActiveFilter("all");
    }
  }, [categoryParam]);

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

  const filteredCourses = courses.filter((course) => {
    if (activeFilter === "all") return true;
    return course.categoryId === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 dark:border-[#1E293B] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {t("coursesPage.heading")}
          </h1>
          <p className="text-xs text-gray-400 dark:text-[#94A3B8] mt-1">
            {t("coursesPage.subheading")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 self-start sm:self-auto shadow-sm"
        >
          <Play size={14} className="fill-current" />
          <span>{t("coursesPage.introVideo")}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            activeFilter === "all"
              ? "bg-gray-900 dark:bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 dark:bg-[#151C28] text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-[#1E293B] border border-transparent dark:border-[#1E293B]"
          }`}
        >
          {t("coursesPage.filters.all")}
        </button>
        {categories.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === filter.id
                ? "bg-gray-900 dark:bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-[#151C28] text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-[#1E293B] border border-transparent dark:border-[#1E293B]"
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      <div className="min-h-112.5 flex items-center justify-center w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 w-full self-start">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                priceLabel={t("coursesPage.priceLabel")}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 dark:border-[#1E293B] rounded-2xl w-full max-w-xl mx-auto">
            <p className="text-sm text-gray-400 dark:text-[#94A3B8]">
              {t("coursesPage.noCourses")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KurslarPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <CoursesContent />
    </Suspense>
  );
}
