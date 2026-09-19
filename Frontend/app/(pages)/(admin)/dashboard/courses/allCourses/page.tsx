"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pen,
  Trash2,
  X,
  UploadCloud,
  Check,
  EyeOff,
  Link as LinkIcon,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { getCourses, createCourse, updateCourse, deleteCourse, Course } from "@/app/lib/api/courses";
import CustomSelect from "@/app/components/dashboard/CustomSelect";
import Pagination from "@/app/components/dashboard/Pagination";
import { getCategories, Category } from "@/app/lib/api/categories";
import { API_URL } from "@/app/lib/utils";
import { useProfileStore } from "@/store/useProfileStore";
import { getMentors, Mentor } from "@/app/lib/api/mentors";

export default function AllCoursesPage() {
  const { profile } = useProfileStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [cats, crs, mnts] = await Promise.all([
        getCategories(),
        getCourses(),
        getMentors().catch(() => [])
      ]);
      setCategories(cats);
      setCourses(crs);
      setMentors(mnts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "warning" | "success" | "error" } | null>(null);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Current items
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  // Removed mentor fetching because backend endpoint might not exist yet

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    level: "BEGINNER",
    categoryId: "",
    teacherId: "",
    status: "ACTIVE",
    banner: null as File | null,
    introVideo: null as File | null,
  });
  const [assistant, setAssistant] = useState("");

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      (course.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  // Pagination
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Handlers
  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(currentCourses.map(c => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const isAllSelected = currentCourses.length > 0 && selectedRows.length === currentCourses.length;
  const selectedAreActive = selectedRows.length > 0 && selectedRows.every(id => courses.find(c => c.id === id)?.status === 'ACTIVE');
  
  const handleBulkToggle = async () => {
    if (selectedRows.length === 0) return;
    const newStatus = selectedAreActive ? 'INACTIVE' : 'ACTIVE';
    try {
      await Promise.all(selectedRows.map(id => updateCourse(id, { status: newStatus })));
      await loadData();
      setSuccessMessage("Statuslar muvaffaqiyatli o'zgartirildi");
      setIsSuccessModalOpen(true);
      setSelectedRows([]);
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ title: "", desc: "", price: "", level: "BEGINNER", categoryId: "", teacherId: "", status: "ACTIVE", banner: null, introVideo: null });
    setCurrentCourse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setModalMode("edit");
    setFormData({ 
      title: course.name || "", 
      desc: course.description || "", 
      price: course.price?.toString() || "", 
      level: course.level || "BEGINNER", 
      categoryId: course.categoryId?.toString() || "",
      teacherId: course.teacherId?.toString() || "",
      status: course.status || "ACTIVE",
      banner: null,
      introVideo: null
    });
    setCurrentCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!formData.title || !formData.categoryId || !formData.price) return;
    
    const fd = new FormData();
    fd.append("name", formData.title);
    fd.append("description", formData.desc);
    fd.append("price", formData.price.toString());
    fd.append("level", formData.level);
    fd.append("categoryId", formData.categoryId.toString());
    fd.append("status", formData.status);
    
    if (formData.teacherId) {
      fd.append("teacherId", formData.teacherId.toString());
    }
    
    if (formData.banner) {
      fd.append("banner", formData.banner);
    }
    if (formData.introVideo) {
      fd.append("introVideo", formData.introVideo);
    }

    try {
      if (modalMode === "add") {
        await createCourse(fd);
        setSuccessMessage("Muvaffaqiyatli qo’shildi");
      } else if (modalMode === "edit" && currentCourse) {
        await updateCourse(currentCourse.id, fd);
        setSuccessMessage("Muvaffaqiyatli o’zgartirildi");
      }
      
      await loadData();
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (currentCourse) {
      try {
        await deleteCourse(currentCourse.id);
        await loadData();
        setIsDeleteModalOpen(false);
        setSuccessMessage("Muvaffaqiyatli o'chirildi");
        setIsSuccessModalOpen(true);
        setSelectedRows(selectedRows.filter(id => id !== currentCourse.id));
      } catch (error: any) {
        console.error(error);
        const errorMsg = error.response?.data?.message || "O'chirishda xatolik yuz berdi";
        setToast({ message: errorMsg, type: "warning" });
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleAssignAssistant = () => {
    if (currentCourse && assistant) {
      // assignAssistant(currentCourse.id, assistant);
      alert("Backend hozircha assistent biriktirishni qo'llab quvvatlamaydi!");
      setIsAssignModalOpen(false);
      setCurrentCourse({ ...currentCourse, assistant });
      setAssistant("");
      setSuccessMessage("Assistent biriktirildi");
      setIsSuccessModalOpen(true);
    }
  };

  const handleRemoveAssistant = () => {
    if (currentCourse) {
      // removeAssistant(currentCourse.id);
      alert("Backend hozircha assistent o'chirishni qo'llab quvvatlamaydi!");
      setCurrentCourse({ ...currentCourse, assistant: undefined });
    }
  };

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || "Noma'lum";
  };
  
  const downloadXLS = () => {
    const headers = ["ID", "Kurs nomi", "Darajasi", "Narxi", "Kategoriya", "Holati"];
    const rows = courses.map(c => [c.id, c.name, c.level, c.price, getCategoryName(c.categoryId), c.status || 'ACTIVE'].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kurslar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
        {/* Courses List Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-7 flex flex-col min-h-full">
            {/* Box Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[22px] font-bold text-gray-900 mb-1.5">Kurslar</h1>
                <div className="flex items-center text-[13px] font-medium gap-2">
                  <span className="text-gray-500">Kurslar</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-gray-700">
                    Faollashtirilgan
                  </span>
                  <button 
                    onClick={handleBulkToggle}
                    className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                      selectedAreActive && selectedRows.length > 0 ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                      selectedAreActive && selectedRows.length > 0 ? "translate-x-4" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>
                <button 
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
                >
                  <Plus size={18} />
                  Qo’shish
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              {/* Search */}
              <div className="relative w-[340px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Izlash"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer border-l border-gray-200 my-2.5 pl-3">
                  <Filter size={16} className="text-gray-400 hover:text-gray-600" />
                </div>
              </div>

              {/* Top Pagination Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium relative group">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-transparent outline-none cursor-pointer pr-5"
                  >
                    <option value={10}>Bir sahifada 10</option>
                    <option value={20}>Bir sahifada 20</option>
                    <option value={50}>Bir sahifada 50</option>
                  </select>
                  <ChevronDown size={14} className="text-gray-500 absolute right-0 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 flex items-center justify-center rounded text-[13px] font-medium transition-colors ${currentPage === page ? "bg-white border border-gray-200 shadow-sm text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-400 px-1 font-medium text-xs">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2.5 h-7 flex items-center justify-center rounded bg-white border border-gray-200 shadow-sm text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors ml-1 disabled:opacity-50"
                  >
                    Keyingi     
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 mb-6 border border-gray-100">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-white text-[13px] text-gray-900 font-bold tracking-wide border-b border-gray-100">
                      <th className="px-5 py-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll}
                          checked={isAllSelected}
                          className="rounded border-gray-300 w-4 h-4 accent-blue-600 cursor-pointer" 
                        />
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Banner <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        Kurs nomi
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Darajasi <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Narxi <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Kategoriya <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-center cursor-pointer group">
                          Holati <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap text-center">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] text-gray-800 divide-y divide-gray-100">
                    {currentCourses.length > 0 ? (
                      currentCourses.map((course) => (
                        <tr key={course.id} className={`${selectedRows.includes(course.id) ? "bg-blue-50/50 hover:bg-blue-50/70" : "bg-white hover:bg-gray-50"} transition-colors group`}>
                          <td className="px-5 py-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedRows.includes(course.id)}
                              onChange={() => handleSelectRow(course.id)}
                              className="rounded border-gray-300 w-4 h-4 accent-blue-600 cursor-pointer" 
                            />
                          </td>
                          <td className="px-5 py-4">
                            {course.banner ? (
                              <img src={course.banner.startsWith("http") ? course.banner : `${API_URL}${course.banner}`} alt="banner" className="w-[52px] h-[32px] mx-auto rounded shadow-sm object-cover" />
                            ) : (
                              <div className={`w-[52px] h-[32px] mx-auto rounded bg-gray-200 shadow-sm`}></div>
                            )}
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-900">
                            <Link href={`/dashboard/courses/allCourses/${course.id}/sections`} className="hover:text-blue-600 hover:underline transition-colors">
                              {course.name}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-gray-600 font-medium capitalize text-center">{course.level}</td>
                          <td className="px-5 py-4 text-gray-900 font-medium text-center">{(course.price).toLocaleString()}</td>
                          <td className="px-5 py-4 text-gray-600 text-center">{getCategoryName(course.categoryId)}</td>
                          <td className="px-5 py-4 text-center">
                            {course.status === 'ACTIVE' ? (
                              <span className="text-green-600 font-medium text-[13px]">Faol</span>
                            ) : (
                              <span className="text-red-500 font-medium text-[13px]">Nofaol</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-3 text-gray-400">
                              <button 
                                onClick={() => {
                                  setCurrentCourse(course);
                                  setIsViewModalOpen(true);
                                }}
                                className="hover:text-blue-600 transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => openEditModal(course)}
                                className="hover:text-blue-600 transition-colors"
                              >
                                <Pen size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  setCurrentCourse(course);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500">
                          Ma'lumot topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Pagination */}
            <div className="mt-auto">
               <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(limit) => {
                  setItemsPerPage(limit);
                  setCurrentPage(1);
                }}
                onDownloadXLS={downloadXLS}
              />
            </div>

          </div>
        </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-150 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Qo’shish" : "Tahrirlash"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              
              {/* Uploads */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Banner</label>
                  <div className={`border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center ${modalMode === "edit" ? "p-2" : "py-6 px-4"} bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer group text-center`}>
                    {modalMode === "edit" ? (
                      <div className="w-full h-24 mb-3 rounded-xl bg-linear-to-br from-blue-400 to-indigo-500 shadow-sm relative overflow-hidden flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadCloud size={16} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} />
                      </div>
                    )}
                    <p className="text-[12px] text-gray-500 mb-0.5"><span className="text-blue-600 font-medium">Bu yerga torting</span> yoki faylni tanlang</p>
                    <p className="text-[10px] text-gray-400">SVG, PNG, JPG (max. 800x400)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kirish video</label>
                  <div className={`border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center ${modalMode === "edit" ? "p-2" : "py-6 px-4"} bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer group text-center`}>
                    {modalMode === "edit" ? (
                      <div className="w-full h-24 mb-3 rounded-xl bg-linear-to-br from-orange-400 to-red-500 shadow-sm relative overflow-hidden flex items-center justify-center">
                         <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadCloud size={16} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} />
                      </div>
                    )}
                    <p className="text-[12px] text-gray-500 mb-0.5"><span className="text-blue-600 font-medium">Bu yerga torting</span> yoki faylni tanlang</p>
                    <p className="text-[10px] text-gray-400">MP4, WebM (max. 50MB)</p>
                  </div>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kurs nomi</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Kiriting" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 transition-shadow"
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kurs haqida</label>
                <textarea 
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Kiriting" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 transition-shadow resize-none"
                />
              </div>

              {/* Level & Price */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Darajasi</label>
                  <CustomSelect
                    options={[
                      { value: "beginner", label: "Beginner" },
                      { value: "intermediate", label: "Intermediate" },
                      { value: "advanced", label: "Advanced" },
                    ]}
                    value={formData.level}
                    onChange={(v) => setFormData({ ...formData, level: v })}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Narxi</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="400 000" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 transition-shadow"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kategoriya</label>
                  <CustomSelect
                    options={categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }))}
                    value={formData.categoryId}
                    onChange={(v) => setFormData({ ...formData, categoryId: v })}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Holati</label>
                  <CustomSelect
                    options={[
                      { value: "ACTIVE", label: "Faol" },
                      { value: "INACTIVE", label: "Nofaol" },
                    ]}
                    value={formData.status}
                    onChange={(v) => setFormData({ ...formData, status: v })}
                  />
                </div>
              </div>

              {/* Mentor */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Mentor (Ixtiyoriy)</label>
                <CustomSelect
                  options={[
                    { value: "", label: "Biriktirilmagan" },
                    ...mentors.map((m) => ({ value: m.id.toString(), label: m.fullName }))
                  ]}
                  value={formData.teacherId}
                  onChange={(v) => setFormData({ ...formData, teacherId: v })}
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-gray-100 flex items-center bg-gray-50/50 rounded-b-3xl">
              <button 
                onClick={handleSaveCourse}
                disabled={!formData.title || !formData.level || !formData.categoryId || !formData.price}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="text-3xl font-bold">?</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-8">Siz rostdan ham o’chirmoqchimisiz?</h2>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                O’chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-8">{successMessage}</h2>
            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm inline-block"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* View Course Details Modal */}
      {isViewModalOpen && currentCourse && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-125 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Batafsil</h2>
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                  <EyeOff size={18} />
                </button>
                <button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(currentCourse);
                  }}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Pen size={18} />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors ml-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              <div>
                <p className="text-[12px] font-semibold text-gray-500 mb-1">Kurs nomi</p>
                <p className="text-sm font-medium text-gray-900">{currentCourse.name}</p>
              </div>

              <div>
                {currentCourse.banner ? (
                    <img src={currentCourse.banner.startsWith("http") ? currentCourse.banner : `${API_URL}${currentCourse.banner}`} alt="banner" className="w-full h-32 rounded-xl shadow-sm mb-2 object-cover" />
                ) : (
                    <div className={`w-full h-32 rounded-xl bg-gray-200 shadow-sm mb-2`}></div>
                )}
                {currentCourse.banner && (
                  <div className="flex items-center gap-1.5 text-blue-600 text-[13px] font-medium cursor-pointer hover:underline mb-4">
                    <LinkIcon size={14} />
                    <a href={currentCourse.banner.startsWith("http") ? currentCourse.banner : `${API_URL}${currentCourse.banner}`} target="_blank" rel="noreferrer">
                      Banner.png
                    </a>
                  </div>
                )}
                
                {currentCourse.introVideo && (
                  <div className="mt-2">
                    <p className="text-[12px] font-semibold text-gray-500 mb-1">Kirish video</p>
                    <video 
                      controls 
                      src={currentCourse.introVideo.startsWith("http") ? currentCourse.introVideo : `${API_URL}${currentCourse.introVideo}`} 
                      className="w-full h-40 bg-black rounded-xl object-contain shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Darajasi</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{currentCourse.level}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Narxi</p>
                  <p className="text-sm font-medium text-gray-900">{currentCourse.price.toLocaleString()} so’m</p>
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Sana</p>
                  <p className="text-sm font-medium text-gray-900">{currentCourse.created_at ? new Date(currentCourse.created_at).toLocaleDateString() : 'Noma\'lum'}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Kategoriya</p>
                  <p className="text-sm font-medium text-gray-900">{getCategoryName(currentCourse.categoryId)}</p>
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Mentor</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentCourse.user?.fullName || profile?.fullName || "Noma'lum Mentor"} (ID: {currentCourse.teacherId || profile?.id || "Noma'lum"})
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Holati</p>
                  <p className={`text-sm font-medium ${currentCourse.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                    {currentCourse.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                  </p>
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Assistent</p>
                  {currentCourse.assistant ? (
                    <div className="flex items-center justify-between group">
                      <p className="text-sm font-medium text-gray-900">{currentCourse.assistant}</p>
                      <button 
                        onClick={handleRemoveAssistant}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAssignModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Biriktirish
                    </button>
                  )}
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">O’quvchilar soni</p>
                  <p className="text-sm font-medium text-gray-900">{currentCourse.studentsCount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Assistant Modal */}
      {isAssignModalOpen && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Assistent biriktirish</h2>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-6">
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Assistentni tanlang</label>
              <CustomSelect
                options={[
                  { value: "Safarov Oybek", label: "Safarov Oybek" },
                  { value: "Aliyev Vali", label: "Aliyev Vali" },
                ]}
                value={assistant}
                onChange={setAssistant}
              />
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex items-center bg-gray-50/50 rounded-b-3xl">
              <button 
                onClick={handleAssignAssistant}
                disabled={!assistant}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'warning' ? 'bg-amber-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-[#4F7FFF]'
        }`}>
          {toast.type === 'warning' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
          {toast.type === 'error' && (
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          )}
          {toast.type === 'success' && (
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80 transition-opacity" aria-label="Yopish">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
