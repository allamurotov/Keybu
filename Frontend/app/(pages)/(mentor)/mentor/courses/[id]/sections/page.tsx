"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Pen,
  Trash2,
  X,
  Check,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Pagination from "@/app/components/dashboard/Pagination";
import { baseAPI } from "@/app/lib/utils";

interface Section {
  id: number;
  name: string;
  courseId?: number;
}

export default function MentorCourseSectionsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  // ============================================================
  // STATES
  // ============================================================

  const [courseTitle, setCourseTitle] = useState("Kurs");

  const [sections, setSections] = useState<Section[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [newSectionName, setNewSectionName] = useState("");
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<number | null>(null);

  // ============================================================
  // MESSAGES
  // ============================================================

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const showSuccess = (message: string) => {
    setError("");
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ============================================================
  // GET COURSE TITLE
  // ============================================================

  const getCourseTitle = async () => {
    try {
      const response = await baseAPI.get(`/courses/${courseId}`);
      const data = response.data?.data || response.data;
      if (data?.name) setCourseTitle(data.name);
    } catch {
      // ignore — fallback title already set
    }
  };

  // ============================================================
  // GET SECTIONS
  // ============================================================

  const getSections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await baseAPI.get("/sections");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      const filteredSections = data.filter(
        (section: Section) => Number(section.courseId) === Number(courseId)
      );

      setSections(filteredSections);

      const maxPage = Math.ceil(filteredSections.length / itemsPerPage) || 1;
      if (currentPage > maxPage) setCurrentPage(maxPage);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Bo'limlarni yuklashda xatolik yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    if (courseId) {
      getCourseTitle();
      getSections();
    }
  }, [courseId]);

  // ============================================================
  // ADD SECTION
  // ============================================================

  const handleAddSection = async () => {
    const name = newSectionName.trim();
    if (!name) {
      setError("Bo'lim nomini kiriting.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      await baseAPI.post("/sections", { name, courseId: Number(courseId) });
      await getSections();

      setNewSectionName("");
      setIsAddModalOpen(false);
      setCurrentPage(1);

      showSuccess("Bo'lim muvaffaqiyatli qo'shildi!");
    } catch (err: any) {
      setError(
        err.response?.status === 401
          ? "Avtorizatsiya muddati tugagan. Qaytadan login qiling."
          : err.response?.data?.message || "Bo'lim qo'shishda xatolik yuz berdi."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT SECTION
  // ============================================================

  const handleEditSection = async () => {
    if (!editingSection) return;

    const name = editingSection.name.trim();
    if (!name) {
      setError("Bo'lim nomini kiriting.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      await baseAPI.patch(`/sections/${editingSection.id}`, {
        name,
        courseId: Number(courseId),
      });
      await getSections();

      setEditingSection(null);
      setIsEditModalOpen(false);

      showSuccess("Bo'lim muvaffaqiyatli tahrirlandi!");
    } catch (err: any) {
      setError(
        err.response?.status === 401
          ? "Avtorizatsiya muddati tugagan. Qaytadan login qiling."
          : err.response?.data?.message || "Bo'limni tahrirlashda xatolik yuz berdi."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE SECTION
  // ============================================================

  const handleDeleteSection = async () => {
    if (deletingSectionId === null) return;

    try {
      setDeleting(true);
      clearMessages();

      await baseAPI.delete(`/sections/${deletingSectionId}`);
      await getSections();

      setDeletingSectionId(null);
      setIsDeleteModalOpen(false);

      showSuccess("Bo'lim muvaffaqiyatli o'chirildi!");
    } catch (err: any) {
      setError(
        err.response?.status === 401
          ? "Avtorizatsiya muddati tugagan. Qaytadan login qiling."
          : err.response?.data?.message || "Bo'limni o'chirishda xatolik yuz berdi."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // CLOSE MODALS
  // ============================================================

  const closeModal = () => {
    if (saving) return;
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setNewSectionName("");
    setEditingSection(null);
    setError("");
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setIsDeleteModalOpen(false);
    setDeletingSectionId(null);
  };

  // ============================================================
  // DOWNLOAD CSV
  // ============================================================

  const handleDownloadXLS = () => {
    const headers = ["ID", "Bo'lim nomi"];
    const rows = sections.map((s) =>
      [s.id, `"${s.name.replace(/"/g, '""')}"`].join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bolimlar.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.ceil(sections.length / itemsPerPage) || 1;
  const startIndex = Math.min((currentPage - 1) * itemsPerPage, sections.length);
  const endIndex = Math.min(currentPage * itemsPerPage, sections.length);
  const paginatedSections = sections.slice(startIndex, endIndex);

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col h-full bg-transparent">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-1.5">
              Bo&apos;limlar
            </h1>

            <div className="flex items-center text-[13px] font-medium gap-2">
              <Link
                href="/mentor/courses"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Kurslar
              </Link>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <Link
                href={`/mentor/courses/${courseId}/sections`}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {courseTitle}
              </Link>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-gray-900">Bo&apos;limlar</span>
            </div>
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => {
              clearMessages();
              setNewSectionName("");
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Bo&apos;lim qo&apos;shish
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="flex-1 flex flex-col">
          <div className="overflow-x-auto rounded-t-xl overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse min-w-[800px] bg-white">
              <thead className="bg-gray-50">
                <tr className="text-[13px] text-gray-900 font-bold tracking-wide">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200">
                    <div className="flex items-center gap-2 cursor-pointer group">
                      Bo&apos;lim nomi
                      <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap text-right w-32 border border-gray-200">
                    Amallar
                  </th>
                </tr>
              </thead>

              <tbody className="text-[14px] text-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center border border-gray-200">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 size={20} className="animate-spin" />
                        Bo&apos;limlar yuklanmoqda...
                      </div>
                    </td>
                  </tr>
                ) : paginatedSections.length > 0 ? (
                  paginatedSections.map((section) => (
                    <tr
                      key={section.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* NAME */}
                      <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">
                        <Link
                          href={`/mentor/courses/${courseId}/sections/${section.id}/lessons`}
                          className="hover:text-blue-600 transition-colors cursor-pointer block w-full"
                        >
                          {section.name}
                        </Link>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right border border-gray-200">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          {/* EDIT */}
                          <button
                            onClick={() => {
                              clearMessages();
                              setEditingSection({ ...section });
                              setIsEditModalOpen(true);
                            }}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="Tahrirlash"
                          >
                            <Pen size={16} />
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => {
                              clearMessages();
                              setDeletingSectionId(section.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 hover:text-red-500 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-8 text-center text-gray-500 border border-gray-200 bg-white"
                    >
                      Bo&apos;limlar mavjud emas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl px-2 py-1 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sections.length}
              startIndex={startIndex}
              endIndex={endIndex}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(limit) => {
                setItemsPerPage(limit);
                setCurrentPage(1);
              }}
              onDownloadXLS={handleDownloadXLS}
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Bo&apos;lim {isEditModalOpen ? "tahrirlash" : "qo\u02bbishish"}
              </h2>
              <button
                onClick={closeModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-4">
              {/* COURSE */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Biriktirilgan kurs
                </label>
                <input
                  type="text"
                  disabled
                  value={courseTitle}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-[14px] cursor-not-allowed"
                />
              </div>

              {/* SECTION NAME */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Bo&apos;lim nomi
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Bo'lim nomini kiriting"
                  disabled={saving}
                  value={
                    isEditModalOpen ? editingSection?.name || "" : newSectionName
                  }
                  onChange={(e) => {
                    if (isEditModalOpen && editingSection) {
                      setEditingSection({ ...editingSection, name: e.target.value });
                    } else {
                      setNewSectionName(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !saving) {
                      isEditModalOpen ? handleEditSection() : handleAddSection();
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px] disabled:bg-gray-100"
                />
              </div>

              {/* MODAL ERROR */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* SAVE */}
              <button
                disabled={saving}
                onClick={isEditModalOpen ? handleEditSection : handleAddSection}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Saqlash
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-3xl shadow-xl w-full max-w-[400px] flex flex-col items-center text-center p-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ICON */}
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                ?
              </div>
            </div>

            <h2 className="text-[22px] font-bold text-gray-900 mb-3">
              Rostdan ham o&apos;chirmoqchimisiz?
            </h2>

            <p className="text-sm text-gray-500 mb-8">
              Bu bo&apos;lim o&apos;chirilgandan keyin qayta tiklab bo&apos;lmaydi.
            </p>

            {/* BUTTONS */}
            <div className="flex items-center justify-center gap-4 w-full">
              {/* CANCEL */}
              <button
                disabled={deleting}
                onClick={closeDeleteModal}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex-1 disabled:opacity-50"
              >
                Bekor qilish
              </button>

              {/* DELETE */}
              <button
                disabled={deleting}
                onClick={handleDeleteSection}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex-1 disabled:bg-red-300 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    O&apos;chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    O&apos;chirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
