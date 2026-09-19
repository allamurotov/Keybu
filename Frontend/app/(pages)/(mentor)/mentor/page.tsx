"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ShoppingBag, Star, Loader2 } from "lucide-react";
import { baseAPI, API_URL } from "@/app/lib/utils";

interface Course {
  id: number;
  name: string;
  level: string;
  price: string | number;
  banner?: string;
  categories?: {
    id: number;
    name: string;
  };
}

export default function MentorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [fullName, setFullName] = useState<string>("Mentor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            if (user?.fullName) setFullName(user.fullName);
          } catch {
            localStorage.removeItem("user");
          }
        }

        const requestWithTimeout = (request: Promise<any>) =>
          Promise.race([
            request,
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 10000),
            ),
          ]);

        const [coursesRes, profileRes, studentsRes] = await Promise.allSettled([
          requestWithTimeout(baseAPI.get("/courses/my-courses")),
          requestWithTimeout(baseAPI.get("/profile")),
          requestWithTimeout(baseAPI.get("/students/my-students")),
        ]);

        if (coursesRes.status === "fulfilled") {
          const d = coursesRes.value.data?.data || coursesRes.value.data || [];
          setCourses(Array.isArray(d) ? d : []);
        }

        if (profileRes.status === "fulfilled") {
          const p = profileRes.value.data?.data || profileRes.value.data;
          if (p?.fullName) setFullName(p.fullName);
        }

        if (studentsRes.status === "fulfilled") {
          const s = studentsRes.value.data?.data || studentsRes.value.data || [];
          setStudentCount(Array.isArray(s) ? s.length : 0);
        }
      } catch (err) {
        console.error("Dashboard yuklashda xatolik", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Jami Kurslar",
      value: courses.length.toString(),
      icon: <BookOpen size={24} className="text-[#407BFF]" />,
      bg: "bg-[#F0F5FF]",
    },
    {
      id: 2,
      title: "Nashr qilingan",
      value: courses.length.toString(),
      icon: <CheckCircle2 size={24} className="text-[#137333]" />,
      bg: "bg-[#E6F4EA]",
    },
    {
      id: 3,
      title: "O'quvchilar",
      value: studentCount.toString(),
      icon: <ShoppingBag size={24} className="text-[#FF4D4F]" />,
      bg: "bg-[#FFF0F0]",
    },
    {
      id: 4,
      title: "Jami baholar",
      value: "5.0",
      icon: <Star size={24} className="text-[#FAAD14]" />,
      bg: "bg-[#FFFBE6]",
    },
  ];

  // Map levels to badges
  const getLevelBadge = (level?: string) => {
    switch ((level || "").toUpperCase()) {
      case "ADVANCED":
        return <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[12px] font-medium">Yuqori</span>;
      case "BEGINNER":
        return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[12px] font-medium">Boshlang'ich</span>;
      default:
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[12px] font-medium">{level || "Standart"}</span>;
    }
  };

  const getBannerUrl = (banner?: string) => {
    if (!banner) return "/course.svg";
    if (banner.startsWith("http")) return banner;
    return `${API_URL}/${banner}`;
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === "number") return `${price.toLocaleString()} so'm`;
    const num = Number(price);
    if (!isNaN(num)) return `${num.toLocaleString()} so'm`;
    return price || "0 so'm";
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-gray-900 mb-2">Xush kelibsiz, {fullName}!</h1>
        <p className="text-gray-500 text-[14px]">
          Bu yerda o'zingizga tegishli kurslar va o'quvchilarni boshqarishingiz mumkin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-[20px] font-bold text-gray-900 leading-none mb-1.5">{stat.value}</div>
              <div className="text-[13px] text-gray-500 font-medium">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Mening kurslarim</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 whitespace-nowrap">KURS</th>
                <th className="px-6 py-4 whitespace-nowrap">KATEGORIYA</th>
                <th className="px-6 py-4 whitespace-nowrap">NARXI</th>
                <th className="px-6 py-4 whitespace-nowrap">DARAJASI</th>
                <th className="px-6 py-4 whitespace-nowrap">HOLATI</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">BAHO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-[13px]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-blue-600" />
                      Yuklanmoqda...
                    </div>
                  </td>
                </tr>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center p-1">
                          <img 
                            src={getBannerUrl(course.banner)} 
                            alt={course.name} 
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/course.svg";
                            }}
                          />
                        </div>
                        <span className="text-[13px] font-bold text-gray-900">{course.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-gray-600 font-medium">{course.categories?.name || "Boshqa"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-bold text-gray-900">{formatPrice(course.price)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getLevelBadge(course.level)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[12px] font-medium">Nashr qilingan</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={14} className="text-[#FAAD14] fill-[#FAAD14]" />
                        <span className="text-[13px] font-bold text-gray-900">5.0</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-gray-500 font-medium">
                    Hali kurslar qo'shilmagan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

