"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Filter,
  FileSpreadsheet,
  ChevronRight
} from "lucide-react";
import Sidebar from "@/app/components/dashboard/SideBar";
import Header from "@/app/components/dashboard/Header";

const initialData = [
  {
    id: 1,
    name: "Istamov Xurshid",
    avatar: "https://i.pravatar.cc/150?img=11",
    course: "Frontend dasturlash",
    module: "DOM hususiyatlari",
    correct: 25,
    incorrect: 5,
    passed: true,
  },
  {
    id: 2,
    name: "Avazmov Akmal",
    avatar: "https://i.pravatar.cc/150?img=12",
    course: "Frontend dasturlash",
    module: "JavaScript funksiyalari",
    correct: 25,
    incorrect: 5,
    passed: false,
  },
];

export default function ResultsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (selectedRows.length === initialData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(initialData.map((item) => item.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-sans overflow-hidden text-gray-900">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* Page Title & Breadcrumb */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Natijalar</h1>
            <div className="flex items-center text-xs text-gray-400 font-medium gap-1">
              <span>Natijalar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>
            </div>
          </div>

          {/* Top Filter and Pagination Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Search & Date Range */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search input */}
              <div className="relative flex items-center min-w-[280px] max-w-[360px] bg-white rounded-xl border border-gray-200/80 px-3.5 py-2 shadow-xs">
                <Search size={18} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="O'quvchining ismi yoki familiyasi"
                  className="w-full text-xs text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                />
                <SlidersHorizontal size={16} className="text-gray-400 ml-2 cursor-pointer hover:text-gray-600" />
              </div>

              {/* Datepicker Picker */}
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200/80 px-3.5 py-2 shadow-xs cursor-pointer">
                <span className="text-xs text-gray-600 font-medium">04.08.2024-05.08.2024</span>
                <Calendar size={16} className="text-gray-400 ml-2" />
              </div>
            </div>

            {/* Pagination Top */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-white border border-gray-200/80 rounded-xl px-3 py-1.5 font-medium text-gray-700 cursor-pointer">
                <span>Bir sahifada:10</span>
                <ChevronDown size={14} className="text-gray-400 ml-1" />
              </div>
              <div className="flex items-center gap-1 text-gray-600 font-medium ml-2">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200">1</button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200">2</button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs border border-gray-200 text-gray-900 font-bold">3</button>
                <span className="px-1 text-gray-400">...</span>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200">15</button>
                <button className="px-3 py-1.5 bg-white border border-gray-200/80 rounded-xl text-gray-700 font-medium shadow-xs hover:bg-gray-50 ml-1">
                  Keyingi
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-gray-200/80 text-[12px] font-semibold text-gray-700">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === initialData.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        F.I.Sh
                        <Filter size={12} className="text-gray-400 fill-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        Kurs
                        <Filter size={12} className="text-gray-400 fill-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        Bo'lim
                        <Filter size={12} className="text-gray-400 fill-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        To'g'ri javob
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        Noto'g'ri javob
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 cursor-pointer">
                        Imtihondan o'tish natijasi
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
                  {initialData.map((row) => {
                    const isSelected = selectedRows.includes(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-blue-50/30" : ""
                          }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(row.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={row.avatar}
                              alt={row.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-100"
                            />
                            <span className="font-semibold text-gray-900">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{row.course}</td>
                        <td className="py-3 px-4 text-gray-600">{row.module}</td>
                        <td className="py-3 px-4 text-gray-700">{row.correct}</td>
                        <td className="py-3 px-4 text-gray-700">{row.incorrect}</td>
                        <td className="py-3 px-4 text-center">
                          {row.passed ? (
                            <span className="inline-block px-4 py-1 rounded-full bg-[#E6F4EA] text-[#1E8E3E] font-medium text-[11px]">
                              O'tgan
                            </span>
                          ) : (
                            <span className="inline-block px-4 py-1 rounded-full bg-[#FCE8E6] text-[#D93025] font-medium text-[11px]">
                              O'tmagan
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Bar: Excel Download & Footer Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-gray-600 font-medium">
            {/* Left side: Export button */}
            <div className="flex items-center gap-4">
              <span>Sahifada 0-10 gacha. Umumiy 2ta</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-800 font-medium shadow-xs transition-colors">
                <div className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-[9px]">
                  X
                </div>
                <span>({selectedRows.length || 2}) Yuklab olish .XLS</span>
              </button>
            </div>

            {/* Right side: Bottom Pagination */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-gray-200/80 rounded-xl px-3 py-1.5 font-medium text-gray-700 cursor-pointer">
                <span>Bir sahifada:10</span>
                <ChevronDown size={14} className="text-gray-400 ml-1" />
              </div>
              <div className="flex items-center gap-1 text-gray-600 font-medium ml-2">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200">1</button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200">2</button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs border border-gray-200 text-gray-900 font-bold">3</button>
                <span className="px-1 text-gray-400">...</span>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200">15</button>
                <button className="px-3 py-1.5 bg-white border border-gray-200/80 rounded-xl text-gray-700 font-medium shadow-xs hover:bg-gray-50 ml-1">
                  Keyingi
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}