"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  PlusCircle,
  X,
  Check,
  Search,
  Pencil,
  Trash2,
  Globe,
  Send,
  Camera,
  Briefcase,
  Code,
  Undo2,
  Archive,
} from "lucide-react";
import Pagination from "@/app/components/dashboard/Pagination";
import {
  Payment,
  getPayments,
  createPayment,
  updatePayment,
  archivePayment,
  restorePayment,
  deletePayment,
} from "@/app/lib/api/payments";
import { Student, getStudents } from "@/app/lib/api/students";
import { Course, getCourses } from "@/app/lib/api/courses";
import { fetchCategoriesCached } from "@/app/lib/utils";

export default function PaymentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] =
    useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<any>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [isBuyerOpen, setIsBuyerOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseIdError, setCourseIdError] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [statusValue, setStatusValue] = useState("true");

  useEffect(() => {
    loadAll();
  }, [viewMode]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [paymentsData, studentsData, coursesData] = await Promise.all([
        getPayments(viewMode === "active" ? "ACTIVE" : "INACTIVE"),
        getStudents(),
        getCourses(),
        fetchCategoriesCached(),
      ]);
      setPayments(paymentsData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const studentById = (id: number) => students.find((s) => s.id === id);
  const courseById = (id: number) => courses.find((c) => c.id === id);

  const filteredCourses = useMemo(
    () =>
      categoryId
        ? courses.filter((c) => c.categoryId === Number(categoryId))
        : courses,
    [courses, categoryId],
  );

  const filteredStudents = students.filter((student) => {
    const search = buyerSearch.toLowerCase().trim();

    if (!search) return true;

    return (
      student.fullName.toLowerCase().includes(search) ||
      student.phone?.toLowerCase().includes(search)
    );
  });

  const selectedCourse = courseId ? courseById(Number(courseId)) : undefined;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  const formatRole = (role: string) =>
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("uz-UZ").format(amount);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const buyerName =
        p.user?.fullName || studentById(p.userId)?.fullName || "";
      const courseName = p.course?.name || courseById(p.courseId)?.name || "";
      return (
        buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [payments, students, courses, searchQuery]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPayments.length);
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const handleDownloadXLS = () => {
    const headers = [
      "ID",
      "Sotib oluvchi",
      "Kurs nomi",
      "Summa",
      "Sana",
      "Holat",
    ];
    const rows = payments.map((p) => {
      const buyerName =
        p.user?.fullName || studentById(p.userId)?.fullName || "";
      const courseName = p.course?.name || courseById(p.courseId)?.name || "";
      return [
        p.id,
        buyerName,
        courseName,
        p.amount ?? "",
        formatDate(p.created_at),
        p.status ? "To’landi" : "Kutilmoqda",
        formatRole(p.isActive),
      ].join(",");
    });
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tolovlar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAvatarUrl = (file?: string) => {
    if (!file) return "/default-avatar.png";
    if (file.startsWith("http")) return file;
    return `${process.env.NEXT_PUBLIC_API_URL}${file}`;
  };

  const resetForm = () => {
    setEditingId(null);
    setUserId("");
    setCategoryId("");
    setCourseId("");
    setPaymentType("");
    setStatusValue("true");
    setUserIdError(false);
    setCourseIdError(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (payment: Payment) => {
    setEditingId(payment.id);
    setUserId(String(payment.userId));
    const course = payment.course || courseById(payment.courseId);
    setCategoryId(course?.categoryId ? String(course.categoryId) : "");
    setCourseId(String(payment.courseId));
    setPaymentType("");
    setStatusValue(payment.status ? "true" : "false");
    setUserIdError(false);
    setCourseIdError(false);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmPermanentDelete = (id: number) => {
    setDeletingId(id);
    setIsPermanentDeleteModalOpen(true);
  };

  const confirmRestore = (id: number) => {
    setRestoringId(id);
    setIsRestoreModalOpen(true);
  };

  const handleArchivePayment = async () => {
    if (!deletingId) return;
    try {
      await archivePayment(deletingId);
      setPayments((prevPayments) =>
        prevPayments.filter((p) => p.id !== deletingId),
      );
      if (currentPayments.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Arxivlab bo’lmadi");
    }
  };

  const handleRestorePayment = async () => {
    if (!restoringId) return;
    try {
      await restorePayment(restoringId);
      setPayments((prev) => prev.filter((a) => a.id !== restoringId));
      setIsRestoreModalOpen(false);
      setRestoringId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Tiklab bo’lmadi");
    }
  };

  const handleDeletePaymentPermanently = async () => {
    if (!deletingId) return;
    try {
      await deletePayment(deletingId);
      setStudents((prev) => prev.filter((a) => a.id !== deletingId));
      if (currentPayments.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      setIsPermanentDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "O’chirib bo’lmadi");
    }
  };

  const handleConfirmPayment = async (payment: Payment) => {
    try {
      await updatePayment(payment.id, { status: true });

      setPayments((prev) =>
        prev.map((item) =>
          item.id === payment.id
            ? {
                ...item,
                status: true,
              }
            : item,
        ),
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Tasdiqlab bo’lmadi — UpdatePaymentDto’da status maydoni yo’q bo’lishi mumkin",
      );
    }
  };

  const handleSavePayment = async () => {
    let hasError = false;

    if (!userId) {
      setUserIdError(true);
      hasError = true;
    } else setUserIdError(false);

    if (!courseId) {
      setCourseIdError(true);
      hasError = true;
    } else setCourseIdError(false);

    if (hasError) return;

    try {
      if (editingId) {
        await updatePayment(editingId, {
          userId: Number(userId),
          courseId: Number(courseId),
          status: statusValue === "true",
        });
      } else {
        await createPayment(Number(userId), Number(courseId));
      }

      await loadAll();
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Xatolik yuz berdi");
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 mb-1">
              To’lovlar
            </h1>
            <div className="flex items-center text-[13px] text-gray-500 font-medium">
              Foydalanuvchilar{" "}
              <span className="mx-2 w-1 h-1 bg-gray-400 rounded-full"></span>{" "}
              To’lovlar
            </div>
          </div>
          {viewMode === "active" && (
            <button
              onClick={openAddModal}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-[14px] font-medium transition-colors shadow-sm"
            >
              <PlusCircle size={18} strokeWidth={2} />
              Qo’shish
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-100">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
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
          <button
            onClick={() => {
              setViewMode((prev) =>
                prev === "active" ? "archived" : "active",
              );
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${
              viewMode === "archived"
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {viewMode === "archived" ? (
              <>
                <Undo2 size={16} />
                Faol to’lovlar
              </>
            ) : (
              <>
                <Archive size={16} />
                Arxiv
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="text-center text-gray-400 text-sm">
            Yuklanmoqda...
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-white rounded-t-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200 min-w-275">
                  <thead>
                    <tr className="bg-white text-[12px] text-gray-900 font-bold tracking-wider">
                      <th className="px-5 py-4 w-16 border border-gray-200">
                        ID
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        Sotib oluvchi{" "}
                        <ChevronDown
                          size={14}
                          className="inline-block text-gray-400 ml-1"
                        />
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        Kurs nomi{" "}
                        <ChevronDown
                          size={14}
                          className="inline-block text-gray-400 ml-1"
                        />
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        Summa{" "}
                        <ChevronDown
                          size={14}
                          className="inline-block text-gray-400 ml-1"
                        />
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        Sana{" "}
                        <ChevronDown
                          size={14}
                          className="inline-block text-gray-400 ml-1"
                        />
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        Holat
                      </th>
                      <th className="px-5 py-4 border border-gray-200 text-center">
                        Tasdiqlash
                      </th>
                      <th className="px-5 py-4 text-center border border-gray-200">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] text-gray-800">
                    {[...currentPayments]
                      .sort((a, b) => Number(a.status) - Number(b.status))
                      .map((payment) => {
                        const buyer =
                          payment.user || studentById(payment.userId);
                        const course =
                          payment.course || courseById(payment.courseId);
                        return (
                          <tr
                            key={payment.id}
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            <td className="px-5 py-4 font-medium border border-gray-200">
                              {payment.id}
                            </td>
                            <td className="px-5 py-4 border border-gray-200">
                              <div
                                className="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition-colors"
                                onClick={() => {
                                  setViewingStudent(buyer);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                <img
                                  src={getAvatarUrl(buyer?.file ?? undefined)}
                                  alt={buyer?.fullName}
                                  className="w-8 h-8 rounded-full object-cover bg-gray-100 border border-gray-200"
                                />
                                <span className="font-semibold text-[13px]">
                                  {buyer?.fullName || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-600 font-medium text-[13px] border border-gray-200">
                              {course?.name || "—"}
                            </td>
                            <td className="px-5 py-4 text-gray-600 font-medium text-[13px] border border-gray-200">
                              {formatAmount(payment.amount)}
                            </td>
                            <td className="px-5 py-4 text-gray-600 text-[13px] border border-gray-200">
                              {formatDate(payment.created_at)}
                            </td>
                            <td className="px-5 py-4 border border-gray-200">
                              <span
                                className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${
                                  payment.status
                                    ? "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]"
                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}
                              >
                                {payment.status ? "To’landi" : "Kutilmoqda"}
                              </span>
                            </td>
                            <td className="px-5 py-4 border border-gray-200 text-center">
                              {payment.status ? (
                                <span className="px-3 py-1 rounded-full text-[12px] font-semibold border bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]">
                                  Tasdiqlangan
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleConfirmPayment(payment)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium transition-colors"
                                >
                                  Tasdiqlash
                                </button>
                              )}
                            </td>
                            <td className="px-5 py-4 border border-gray-200 relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 whitespace-nowrap">
                                {viewMode === "active" ? (
                                  <>
                                    <button
                                      onClick={() => openEditModal(payment)}
                                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(payment.id)}
                                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-orange-600 transition-colors"
                                    >
                                      <Archive size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => confirmRestore(payment.id)}
                                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-green-600 transition-colors"
                                    >
                                      <Undo2 size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        confirmPermanentDelete(payment.id)
                                      }
                                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {currentPayments.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-10 text-center text-gray-500 border border-gray-200"
                        >
                          Ma’lumot topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-gray-200 border-t-0 rounded-b-xl overflow-hidden bg-[#F8F9FA]">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPayments.length}
                startIndex={startIndex}
                endIndex={endIndex}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                onDownloadXLS={handleDownloadXLS}
              />
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-[10px] p-4">
          <div className="bg-white relative flex flex-col w-full max-w-140 max-h-[95vh] rounded-[10px] p-[16px_24px] overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-[20px] font-bold text-gray-900">
                {editingId ? "Tahrirlash" : "Qo’shish"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 pb-2">
              {/* Sotib oluvchi */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Sotib oluvchi
                </label>

                <div className="relative w-full">
                  {/* SELECT BUTTON */}
                  <button
                    type="button"
                    onClick={() => setIsBuyerOpen((prev) => !prev)}
                    className={`w-full px-4 h-12 rounded-lg border text-[14px] outline-none transition-colors bg-white cursor-pointer flex items-center justify-between text-left ${
                      userId ? "text-gray-900" : "text-gray-400"
                    } ${
                      userIdError
                        ? "border-[#ff4d4f]"
                        : isBuyerOpen
                          ? "border-blue-500"
                          : "border-gray-200"
                    }`}
                  >
                    <span>
                      {userId
                        ? students.find((s) => String(s.id) === String(userId))
                            ?.fullName
                        : "Tanlang"}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform ${
                        isBuyerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* DROPDOWN */}
                  {isBuyerOpen && (
                    <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {/* SEARCH */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            type="text"
                            autoFocus
                            value={buyerSearch}
                            onChange={(e) => setBuyerSearch(e.target.value)}
                            placeholder="Ism yoki telefon raqam bo’yicha qidiring..."
                            className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 text-[13px] outline-none focus:border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* STUDENTS */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => {
                                setUserId(String(student.id));
                                setUserIdError(false);
                                setBuyerSearch("");
                                setIsBuyerOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-[#F5F8FF] transition-colors ${
                                String(student.id) === String(userId)
                                  ? "bg-[#F5F8FF]"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[14px] font-medium text-gray-900 truncate">
                                    {student.fullName}
                                  </p>

                                  <p className="text-[12px] text-gray-400 mt-0.5">
                                    {student.phone}
                                  </p>
                                </div>

                                {String(student.id) === String(userId) && (
                                  <Check
                                    size={18}
                                    className="text-blue-500 shrink-0"
                                  />
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-[13px] text-gray-400">
                            Foydalanuvchi topilmadi
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {userIdError && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1.5">
                    Sotib oluvchi tanlanmadi
                  </p>
                )}
              </div>

              {/* Kurs */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Kurs
                </label>
                <div className="relative w-full">
                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      if (courseIdError) setCourseIdError(false);
                    }}
                    className={`w-full px-4 h-12 rounded-lg border text-[14px] outline-none transition-colors appearance-none bg-white cursor-pointer ${
                      courseId ? "text-gray-900" : "text-gray-400"
                    } ${courseIdError ? "border-[#ff4d4f]" : "border-gray-200 focus:border-blue-500"}`}
                  >
                    <option value="" disabled hidden>
                      Tanlang
                    </option>
                    {filteredCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {courseIdError && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1.5">
                    Kurs tanlanmadi
                  </p>
                )}
              </div>

              {/* Kurs narxi — avtomatik, backendga yubormaymiz */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Kurs narxi
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    selectedCourse
                      ? formatAmount(Number(selectedCourse.price))
                      : ""
                  }
                  placeholder="Kurs tanlanganda avtomatik to’ldiriladi"
                  className="w-full px-4 h-12 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-[14px] cursor-not-allowed"
                />
              </div>

              {/* To’lov turi — decorativ, Payments modelida bunday maydon yo’q */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  To’lov turi{" "}
                  <span className="text-gray-400 font-normal ml-1">
                    (hozircha faqat vizual)
                  </span>
                </label>
                <div className="relative w-full">
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className={`w-full px-4 h-12 rounded-lg border text-[14px] outline-none transition-colors appearance-none bg-white cursor-pointer border-gray-200 focus:border-blue-500 ${
                      paymentType ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    <option value="" disabled hidden>
                      Tanlang
                    </option>
                    <option value="naqd">Naqd</option>
                    <option value="karta">Karta</option>
                    <option value="onlayn">Onlayn</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Holati — faqat tahrirlashda ishlaydi */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Holati{" "}
                  {!editingId && (
                    <span className="text-gray-400 font-normal ml-1">
                      (yaratishda har doim "To’landi")
                    </span>
                  )}
                </label>
                <div className="relative w-full">
                  <select
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                    disabled={!editingId}
                    className={`w-full px-4 h-12 rounded-lg border text-[14px] outline-none transition-colors appearance-none bg-white ${
                      editingId
                        ? "cursor-pointer border-gray-200 focus:border-blue-500 text-gray-900"
                        : "cursor-not-allowed bg-gray-50 text-gray-400"
                    }`}
                  >
                    <option value="true">To’landi</option>
                    <option value="false">Kutilmoqda</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-start shrink-0">
              <button
                onClick={handleSavePayment}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
                style={{
                  width: "129px",
                  height: "48px",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  gap: "10px",
                }}
              >
                <Check size={18} strokeWidth={2.5} />
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl p-6 w-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Arxivlashni tasdiqlash
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Haqiqatan ham arxivlamoqchimisiz? To’lov ro’yxatdan yashiriladi,
              lekin bazada saqlanib qoladi.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleArchivePayment}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors text-sm font-medium"
              >
                Arxivlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {isPermanentDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl p-6 w-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Butunlay o’chirishni tasdiqlash
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Diqqat! Bu amalni ortga qaytarib bo’lmaydi — administrator bazadan
              butunlay o’chiriladi.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsPermanentDeleteModalOpen(false);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeletePaymentPermanently}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium"
              >
                Butunlay o’chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl p-6 w-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Tiklashni tasdiqlash
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Haqiqatan ham tiklamoqchimisiz? To’lovni qaytadan faol ro’yxatga
              qaytariladi.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setRestoringId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRestorePayment}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-sm font-medium"
              >
                Tiklash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-xs"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] shadow-xl p-8 w-100 flex flex-col items-center animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-21 h-21 rounded-full bg-[#E6F4EA] flex items-center justify-center mb-6">
              <div className="w-15 h-15 rounded-full bg-[#137333] flex items-center justify-center text-white">
                <Check size={32} strokeWidth={3} />
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-8 text-center">
              Muvaffaqiyatli qo’shildi
            </h3>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && viewingStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-xs p-4"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-150 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-[20px] font-bold text-gray-900">
                Student haqida
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-8">
                <img
                  src={getAvatarUrl(viewingStudent.file)}
                  alt={viewingStudent.fullName}
                  className="w-20 h-20 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h3 className="text-[20px] font-bold text-gray-900 mb-1">
                    {viewingStudent.fullName}
                  </h3>
                  <p className="text-gray-500 text-[14px]">Student</p>
                </div>
              </div>

              <h4 className="text-[16px] font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                To’liq ma’lumotlar
              </h4>

              <div className="flex flex-col gap-5 mb-8">
                <div>
                  <p className="text-[12px] text-gray-500 mb-1">
                    Telefon raqami
                  </p>
                  <p className="text-[15px] font-bold text-gray-900">
                    {viewingStudent.phone}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500 mb-1">Rol</p>
                  <p className="text-[15px] font-bold text-gray-900">
                    {formatRole(viewingStudent.role)}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500 mb-1">
                    Ro’yxatdan o’tgan vaqti
                  </p>
                  <p className="text-[15px] font-bold text-gray-900">
                    {formatDate(viewingStudent.created_at)}
                  </p>
                </div>
              </div>

              <h4 className="text-[16px] font-bold text-gray-900 mb-4">
                Ijtimoiy tarmoq sahifalari:
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10.5 h-10.5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Globe size={20} />
                  </div>
                  <div className="w-10.5 h-10.5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Send size={20} />
                  </div>
                  <div className="w-10.5 h-10.5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Camera size={20} />
                  </div>
                  <div className="w-10.5 h-10.5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Briefcase size={20} />
                  </div>
                  <div className="w-10.5 h-10.5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Code size={20} />
                  </div>
                  <div className="h-10.5 px-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold text-[14px] hover:bg-gray-200 cursor-pointer transition-colors">
                    Portfolio
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(viewingStudent);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-[14px]"
                >
                  <Pencil size={16} />
                  Tahrirlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
