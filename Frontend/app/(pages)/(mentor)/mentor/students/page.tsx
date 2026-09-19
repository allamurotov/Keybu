"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import Pagination from "@/app/components/dashboard/Pagination";
import { baseAPI, API_URL } from "@/app/lib/utils";

interface Student {
  id: number;
  name: string;
  phone: string;
  image?: string;
  date: string;
  courseId: number;
}

interface Course {
  id: number;
  name: string;
}

export default function StudentsPage() {
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, studentsRes] = await Promise.allSettled([
          baseAPI.get("/courses/my-courses"),
          baseAPI.get("/students/my-students"),
        ]);

        if (coursesRes.status === "fulfilled") {
          const d = coursesRes.value.data?.data || coursesRes.value.data || [];
          setCourses(Array.isArray(d) ? d : []);
        }

        if (studentsRes.status === "fulfilled") {
          const s = studentsRes.value.data?.students || studentsRes.value.data?.data || studentsRes.value.data || [];
          setStudents(Array.isArray(s) ? s : []);
        }
      } catch (err) {
        console.error("Talabalarni yuklashda xatolik", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived state
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      (student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       student.phone?.includes(searchQuery)) &&
      (selectedCourse === "all" || student.courseId.toString() === selectedCourse)
    );
  }, [students, searchQuery, selectedCourse]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredStudents.length);
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleDownloadXLS = () => {
    const headers = ["ID", "Ism", "Telefon", "Ro'yxatdan o'tgan sana"];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${s.phone || ""}"`,
      `"${new Date(s.date).toLocaleDateString()}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "oquvchilar.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getAvatarUrl = (image?: string) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${API_URL}/${image}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Top Page Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-gray-900 mb-1">O'quvchilarim</h1>
        <div className="flex items-center text-[13px] text-gray-500 font-medium">
          Mening kurslarim <span className="mx-2 w-1 h-1 bg-gray-400 rounded-full"></span> O'quvchilar
        </div>
      </div>

      {/* Filter Row: Dropdown */}
      <div className="mb-4 w-[300px]">
        <div className="relative">
          <select 
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-4 py-2.5 outline-none shadow-sm cursor-pointer"
          >
            <option value="all">Barcha kurslar</option>
            {courses.map(course => (
              <option key={course.id} value={course.id.toString()}>{course.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Search and Pagination Info Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Izlash..."
            value={searchQuery}
            onChange={e => {
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

      {/* Table (Excel Style Borders) */}
      <div className="bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 border-b-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-hidden min-w-[1000px]">
            <thead>
              <tr className="bg-white text-[12px] text-gray-900 font-bold tracking-wider">
                <th className="px-5 py-4 w-16 border border-gray-200 border-t-0 border-l-0 border-r-0">ID</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">O'quvchi</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">Telefon raqam</th>
                <th className="px-5 py-4 border border-gray-200 border-t-0 border-r-0">Ro'yxatdan o'tgan sana</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 border border-gray-200 border-l-0 border-r-0">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                      Yuklanmoqda...
                    </div>
                  </td>
                </tr>
              ) : currentStudents.length > 0 ? (
                currentStudents.map((student) => {
                  const avatar = getAvatarUrl(student.image);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4 font-medium border border-gray-200 border-l-0 border-r-0">{student.id}</td>
                      <td className="px-5 py-4 border border-gray-200 border-r-0">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img 
                              src={avatar} 
                              alt={student.name} 
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[12px]">
                              {(student.name || "S").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-[13px]">{student.name || "Student"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium text-[13px] border border-gray-200 border-r-0">{student.phone}</td>
                      <td className="px-5 py-4 text-gray-600 text-[13px] border border-gray-200 border-r-0">
                        {student.date ? new Date(student.date).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 border border-gray-200 border-l-0 border-r-0">
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
          totalItems={filteredStudents.length}
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

