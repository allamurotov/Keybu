"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, X, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import Pagination from "@/app/components/dashboard/Pagination";
import { baseAPI, API_URL } from "@/app/lib/utils";

interface Course {
  id: number;
  name: string;
  description: string;
  level: string;
  price: string | number;
  banner?: string;
  categoryId?: number;
  categories?: {
    id: number;
    name: string;
  };
}

export default function MentorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await baseAPI.get("/courses/my-courses");
      const data = response.data?.data || response.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Kurslarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Derived state
  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCourses.length);
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleDownloadXLS = () => {
    const headers = ["ID", "Kurs nomi", "Darajasi", "Narxi", "Kategoriya"];
    const rows = filteredCourses.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.level || "BEGINNER",
      typeof c.price === "number" ? c.price : `"${c.price}"`,
      `"${c.categories?.name || "Boshqa"}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kurslar.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBannerUrl = (banner?: string) => {
    if (!banner) return "/course.svg";
    if (banner.startsWith("http")) return banner;
    return `${API_URL}/${banner}`;
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === "number") {
      return `${price.toLocaleString()} so'm`;
    }
    const num = Number(price);
    if (!isNaN(num)) {
      return `${num.toLocaleString()} so'm`;
    }
    return price || "0 so'm";
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 relative">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">Mening kurslarim</h1>
          <div className="flex items-center text-[13px] text-gray-500 font-medium">
            Materiallar <span className="mx-2 w-1 h-1 bg-gray-400 rounded-full"></span> Mening kurslarim
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Izlash..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors bg-white shadow-sm"
          />
          {searchQuery && (
            <X 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" 
              size={16} 
              onClick={() => setSearchQuery("")} 
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 border-b-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-hidden min-w-[1000px]">
            <thead>
              <tr className="bg-white text-[12px] text-gray-900 font-bold tracking-wider">
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-l-0 border-r-0">Banner</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">Kurs nomi</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">Darajasi</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">Narxi</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">Kategoriya</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">Holati</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 border border-gray-200 border-l-0 border-r-0">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                      Yuklanmoqda...
                    </div>
                  </td>
                </tr>
              ) : currentCourses.length > 0 ? (
                currentCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4 border border-gray-200 border-l-0 border-r-0">
                      <img 
                        src={getBannerUrl(course.banner)} 
                        alt={course.name} 
                        className="h-[40px] w-auto max-w-[60px] object-cover rounded border border-gray-100 bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/course.svg";
                        }}
                      />
                    </td>
                    <td className="px-5 py-4 font-medium text-blue-600 border border-gray-200 border-r-0 cursor-pointer hover:underline">
                      <Link href={`/mentor/courses/${course.id}/sections`} className="hover:underline">
                        {course.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900 text-[13px] border border-gray-200 border-r-0">
                      {course.level || "BEGINNER"}
                    </td>
                    <td className="px-5 py-4 font-bold text-[13px] text-gray-900 border border-gray-200 border-r-0">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-5 py-4 text-blue-600 text-[13px] font-medium border border-gray-200 border-r-0">
                      {course.categories?.name || "Boshqa"}
                    </td>
                    <td className="px-5 py-4 border border-gray-200 border-r-0">
                      <span className="bg-[#E6F4EA] text-[#137333] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#CEEAD6]">
                        Faol
                      </span>
                    </td>
                    <td className="px-5 py-4 border border-gray-200 border-r-0">
                      <div className="flex items-center justify-center">
                        <Link 
                          href={`/mentor/courses/${course.id}/sections`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Bo'limlarni ko'rish"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500 border border-gray-200 border-l-0 border-r-0">
                    Ma'lumot topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Bottom Pagination Component */}
      <div className="border border-gray-200 rounded-b-xl overflow-hidden bg-[#F8F9FA]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCourses.length}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          onDownloadXLS={handleDownloadXLS}
        />
      </div>
    </div>
  );
}
