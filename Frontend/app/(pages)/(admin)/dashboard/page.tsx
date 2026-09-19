"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getDashboardStats, DashboardStats } from "@/app/lib/api/users";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Yuklanmadi");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 text-sm">{error}</div>;
  }

  const data = stats?.dashboard || {
    ADMIN: 0,
    MENTOR: 0,
    ASSISTANT: 0,
    STUDENT: 0,
    totalCourses: 0,
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Asosiy</h1>
          <div className="flex items-center text-sm text-gray-500 font-medium">
            Boshqaruv paneli <ChevronRight size={14} className="mx-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link href="/dashboard/users/administrators">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-3xl font-bold text-gray-900 mb-1">
                {data.ADMIN || 0}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                Jami Administratorlar
              </span>
            </div>
          </Link>

          <Link href="/dashboard/users/mentors">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-3xl font-bold text-gray-900 mb-1">
                {data.MENTOR || 0}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                Jami Mentorlar
              </span>
            </div>
          </Link>

          <Link href="/dashboard/users/assistents">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-3xl font-bold text-gray-900 mb-1">
                {data.ASSISTANT || 0}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                Jami Assistentlar
              </span>
            </div>
          </Link>

          <Link href="/dashboard/users/students">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-3xl font-bold text-gray-900 mb-1">
                {data.STUDENT || 0}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                Jami O’quvchilar
              </span>
            </div>
          </Link>

          <Link href="/dashboard/courses/allCourses">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-3xl font-bold text-gray-900 mb-1">
                {data.totalCourses || 0}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                Jami Kurslar
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
