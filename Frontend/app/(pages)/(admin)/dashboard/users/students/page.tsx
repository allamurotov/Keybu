"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  PlusCircle,
  X,
  Eye,
  EyeOff,
  Check,
  Search,
  Pencil,
  Trash2,
  Upload,
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
  getStudents,
  createStudent,
  updateStudent,
  Student,
  archiveStudent,
  restoreStudent,
  deleteStudent,
} from "@/app/lib/api/students";

export default function StudentPage() {
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] =
    useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<any>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");

  // Form states
  const [fullName, setName] = useState("");
  const [fullNameError, setNameError] = useState(false);
  const [phone, setPhone] = useState("+998");
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState(
    "Telefon raqam to'liq kiritilmadi",
  );
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, [viewMode]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const students = await getStudents(
        viewMode === "active" ? "ACTIVE" : "INACTIVE",
      );

      setStudents(students);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        (student.fullName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        student.phone.includes(searchQuery),
    );
  }, [students, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredStudents.length);
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleDownloadXLS = () => {
    const headers = [
      "ID",
      "F.I.Sh",
      "Telefon raqam",
      "Yaratilgan vaqt",
      "Rol",
      "Holati",
    ];
    const rows = students.map((a) =>
      [
        a.id,
        a.fullName,
        a.phone,
        formatDate(a.created_at),
        formatRole(a.role),
        formatRole(a.status),
      ].join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "studentlar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const getAvatarUrl = (file?: string) => {
    if (!file) return "/default-avatar.png";
    if (file.startsWith("http")) return file;
    return `${process.env.NEXT_PUBLIC_API_URL}${file}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9+]/g, "");

    if (!val.startsWith("+998")) {
      val = "+998" + val.replace(/\+998/g, "").trim();
    }

    if (val.length <= 13) {
      setPhone(val);
      if (phoneError) setPhoneError(false);
      if (val.length < 13) {
        setPhoneErrorMessage("Telefon raqam to'liq kiritilmadi");
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setPhone("+998");
    setPassword("");
    setImageFile(null);
    setImagePreview(null);
    setNameError(false);
    setPasswordError(false);
    setPhoneError(false);
    setImageError(false);
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingId(student.id);
    setName(student.fullName);
    setPhone(student.phone);
    setPassword("");
    setImageFile(null);
    setImagePreview(getAvatarUrl(student?.file ?? undefined));
    setNameError(false);
    setPasswordError(false);
    setPhoneError(false);
    setImageError(false);
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

  const handleArchiveStudent = async () => {
    if (!deletingId) return;
    try {
      await archiveStudent(deletingId);
      setStudents((prevStudent) =>
        prevStudent.filter((a) => a.id !== deletingId),
      );
      if (currentStudents.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Arxivlab bo’lmadi");
    }
  };

  const handleRestoreStudent = async () => {
    if (!restoringId) return;
    try {
      await restoreStudent(restoringId);
      setStudents((prev) => prev.filter((a) => a.id !== restoringId));
      setIsRestoreModalOpen(false);
      setRestoringId(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Tiklab bo’lmadi");
    }
  };

  const handleDeleteStudentPermanently = async () => {
    if (!deletingId) return;
    try {
      await deleteStudent(deletingId);
      setStudents((prev) => prev.filter((a) => a.id !== deletingId));
      if (currentStudents.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      setIsPermanentDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "O’chirib bo’lmadi");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  const handleSaveStudent = async () => {
    let hasError = false;

    if (!fullName.trim() || fullName.length < 4) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (phone.length < 13) {
      setPhoneErrorMessage("Telefon raqam to'liq kiritilmadi");
      setPhoneError(true);
      hasError = true;
    } else {
      setPhoneError(false);
    }

    if (
      (!editingId && password.length < 8) ||
      (editingId && password && password.length < 8)
    ) {
      setPasswordError(true);
      hasError = true;
    } else {
      setPasswordError(false);
    }

    if (hasError) return;

    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("phone", phone);

      if (password) {
        formData.append("password", password);
      }

      if (imageFile) {
        formData.append("file", imageFile);
      }

      if (editingId) {
        await updateStudent(editingId, formData);
      } else {
        await createStudent(formData);
      }

      await loadStudents();

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);

      setEditingId(null);
      setName("");
      setPhone("+998");
      setPassword("");
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error(error);
      const backendMessage: string = error.response?.data?.message || "";

      if (
        error.response?.status === 409 ||
        backendMessage.toLowerCase().includes("band") ||
        backendMessage.toLowerCase().includes("ro'yxatdan o'tgan")
      ) {
        setPhoneErrorMessage("Bu telefon raqami allaqachon band");
        setPhoneError(true);
      } else {
        alert(backendMessage || error.message || "Xatolik yuz berdi");
      }
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Top Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 mb-1">
              Studentlar
            </h1>
            <div className="flex items-center text-[13px] text-gray-500 font-medium">
              Foydalanuvchilar{" "}
              <span className="mx-2 w-1 h-1 bg-gray-400 rounded-full"></span>{" "}
              Studentlar
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

        {/* Search Bar */}
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
          <div className="text-center text-gray-500 text-sm">
            Yuklanmoqda...
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Table (Excel Style Borders) */}
            <div className="bg-white rounded-t-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200 min-w-250">
                  <thead>
                    <tr className="bg-white text-[12px] text-gray-900 font-bold tracking-wider">
                      <th className="px-5 py-4 w-16 border border-gray-200">
                        ID
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        F.I.Sh{" "}
                        <ChevronDown
                          size={14}
                          className="inline-block text-gray-400 ml-1"
                        />
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        Telefon raqam{" "}
                        <ChevronDown
                          size={14}
                          className="inline-block text-gray-400 ml-1"
                        />
                      </th>
                      <th className="px-5 py-4 border border-gray-200">
                        Yaratilgan vaqt{" "}
                        <ChevronDown
                          size={14}
                          className="inline-block text-gray-400 ml-1"
                        />
                      </th>
                      <th className="px-5 py-4 text-center border border-gray-200">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] text-gray-800">
                    {[...currentStudents]
                      .sort((a, b) => Number(b.id) - Number(a.id))
                      .map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-5 py-4 font-medium border border-gray-200">
                            {student.id}
                          </td>
                          <td className="px-5 py-4 border border-gray-200">
                            <div
                              className="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition-colors"
                              onClick={() => {
                                setViewingStudent(student);
                                setIsViewModalOpen(true);
                              }}
                            >
                              <img
                                src={getAvatarUrl(student?.file ?? undefined)}
                                alt={student?.fullName}
                                className="w-8 h-8 rounded-full object-cover bg-gray-100 border border-gray-200"
                              />
                              <span className="font-semibold text-[13px]">
                                {student.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-600 font-medium text-[13px] border border-gray-200">
                            {student.phone}
                          </td>
                          <td className="px-5 py-4 text-gray-600 text-[13px] border border-gray-200">
                            {formatDate(student.created_at)}
                          </td>
                          <td className="px-5 py-4 border border-gray-200 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 whitespace-nowrap">
                              {viewMode === "active" ? (
                                <>
                                  <button
                                    onClick={() => openEditModal(student)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(student.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-orange-600 transition-colors"
                                  >
                                    <Archive size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => confirmRestore(student.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-green-600 transition-colors"
                                  >
                                    <Undo2 size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      confirmPermanentDelete(student.id)
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
                      ))}
                    {currentStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
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

            {/* Bottom Pagination Component */}
            <div className="border border-gray-200 border-t-0 rounded-b-xl overflow-hidden bg-[#F8F9FA]">
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
          </>
        )}
      </div>

      {/* Add/Edit Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-[10px] p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white relative flex flex-col w-full max-w-168.25 max-h-[95vh] rounded-[10px] p-[16px_24px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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

            {/* Form Fields - 1 Column Stack */}
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 pb-2">
              {/* Rasm */}
              <div className="flex flex-col items-center gap-1 w-full shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 w-full text-left">
                  Rasm
                </label>
                <div className="flex flex-col items-center gap-2 w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-30 h-30 rounded-full border-[1.5px] border-dashed cursor-pointer hover:bg-gray-50 transition-colors bg-white overflow-hidden relative ${imageError ? "border-[#ff4d4f]" : "border-gray-300"}`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex flex-col items-center ${imageError ? "text-[#ff4d4f]" : "text-gray-400"}`}
                      >
                        <Upload size={32} />
                        <span className="text-[13px] mt-2 font-medium">
                          Yuklash
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imageError && (
                    <p className="text-[#ff4d4f] text-[12px] -mt-1">
                      Rasm yuklash majburiy
                    </p>
                  )}
                  {imagePreview && (
                    <label className="cursor-pointer text-blue-600 text-[13px] font-medium hover:underline text-center">
                      Qayta yuklash
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* F.I.Sh */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  F.I.Sh
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fullNameError && e.target.value.length >= 4)
                      setNameError(false);
                  }}
                  placeholder="Kiriting"
                  className={`w-full px-4 h-12 rounded-lg border text-[14px] outline-none transition-colors ${fullNameError ? "border-[#ff4d4f] focus:border-[#ff4d4f] text-[#ff4d4f] placeholder:text-[#ff4d4f]" : "border-gray-200 focus:border-blue-500 text-gray-900"}`}
                />
                {fullNameError && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1.5">
                    Eng kamida 4 ta belgi
                  </p>
                )}
              </div>

              {/* Telefon raqami */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Telefon raqami
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 h-12 rounded-lg border text-[14px] outline-none transition-colors tracking-wide ${phoneError ? "border-[#ff4d4f] focus:border-[#ff4d4f] text-[#ff4d4f]" : "border-gray-200 focus:border-blue-500 text-gray-900"}`}
                />
                {phoneError && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1.5">
                    {phoneErrorMessage}
                  </p>
                )}
              </div>

              {/* Parol */}
              <div className="flex flex-col shrink-0">
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Parol{" "}
                  {editingId && (
                    <span className="text-gray-400 font-normal ml-1">
                      (O’zgartirmaslik uchun bo’sh qoldiring)
                    </span>
                  )}
                </label>
                <div className="relative w-full h-12">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError && e.target.value.length >= 8)
                        setPasswordError(false);
                    }}
                    placeholder="******"
                    className={`w-full h-full px-4 pr-10 rounded-lg border text-[14px] outline-none transition-colors tracking-widest placeholder:tracking-normal ${passwordError ? "border-[#ff4d4f] focus:border-[#ff4d4f] text-[#ff4d4f]" : "border-gray-200 focus:border-blue-500 text-gray-900"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1.5">
                    Eng kamida 8 ta belgi
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-4 flex justify-start shrink-0">
              <button
                onClick={handleSaveStudent}
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
                onClick={handleArchiveStudent}
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
                onClick={handleDeleteStudentPermanently}
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
              Haqiqatan ham tiklamoqchimisiz? Student qaytadan faol ro’yxatga
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
                onClick={handleRestoreStudent}
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
                  src={getAvatarUrl(viewingStudent?.file ?? undefined)}
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
