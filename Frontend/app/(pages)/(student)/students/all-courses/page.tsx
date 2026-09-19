"use client";

import { useState, useEffect } from "react";
import { getCourses, Course } from "@/app/lib/api/courses";
import Link from "next/link";
import Image from "next/image";
import { Heart, Search, Filter } from "lucide-react";
import { PrecisionStars } from "@/app/components/course-details/precision-stars";

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://63.180.181.4:8080";

  useEffect(() => {
    getCourses()
      .then((data) => {
        setCourses(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto">
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Barcha kurslar</h1>

        {/* Filters & Search */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Kurslarni izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
            <Filter size={16} />
            <span>Filterlar</span>
          </button>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Kurslar topilmadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {filteredCourses.map((course, index) => (
              <Link
                key={course.id}
                href={`/students/all-courses/${course.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col group"
              >
                <div className="relative h-48 w-full shrink-0 bg-gray-100 overflow-hidden">
                  {course.banner && (
                    <Image
                      src={`${API_URL}${course.banner?.startsWith("/") ? "" : "/"}${course.banner}`}
                      alt={course.name}
                      fill
                      unoptimized
                      priority={index === 0}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {course.categories?.name || course.level || "Barchaga"}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                        {course.user?.fullName?.charAt(0).toUpperCase() || "T"}
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {course.user?.fullName || "O’qituvchi"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="text-gray-300 hover:text-rose-400 transition-colors"
                    >
                      <Heart size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <PrecisionStars rating={5.0} stars={5} courseId={course.id.toString()} />
                      {course.studentsCount ? (
                        <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                          👥 {course.studentsCount} o’quvchi
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 mb-0.5 uppercase tracking-wide">Narx</p>
                      <p className="text-sm font-black text-gray-900">
                        {new Intl.NumberFormat("ru-RU").format(Number(course.price) || 0)} UZS
                      </p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Batafsil
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
