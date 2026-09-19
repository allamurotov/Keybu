"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, Pencil, Trash2, Check, Loader2 } from "lucide-react";
import Pagination from "@/app/components/dashboard/Pagination";
import { baseAPI } from "@/app/lib/utils";

interface Comment {
  id: number | string;
  fullName: string;
  phone: string;
  message: string;
  replies?: number;
  createdAt?: string;
  created_at?: string;
  date?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // Agar tayyor "01.01.2024" ko'rinishida bo'lsa shunday qaytaradi

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  // 1. Backend'dan izohlarni olish (GET)
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await baseAPI.get("/comments");
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setComments(data);
    } catch (error) {
      console.error("Izohlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Qidiruv mantiqi
  const filteredComments = useMemo(() => {
    return comments.filter(
      (c) =>
        (c.message && c.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.fullName && c.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.phone && c.phone.includes(searchQuery))
    );
  }, [comments, searchQuery]);

  // Pagination mantiqi
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredComments.length);
  const currentComments = filteredComments.slice(startIndex, endIndex);

  // CSV yuklab olish
  const handleDownloadXLS = () => {
    const headers = ["ID", "Izoh egasi", "Telefon raqami", "Izoh", "Sana"];
    const rows = comments.map((c) =>
      [
        c.id,
        `"${c.fullName || "—"}"`,
        `"${c.phone || "—"}"`,
        `"${c.message || "—"}"`,
        formatDate(c.createdAt || c.created_at || c.date),
      ].join(",")
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "izohlar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Izohni tahrirlash (PATCH)
  const openEditModal = (comment: Comment) => {
    setEditingComment(comment);
    setEditText(comment.message);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !editText.trim()) return;

    const commentId = editingComment.id || (editingComment as any)._id;

    setIsSubmitting(true);
    try {
      await baseAPI.patch(`/comments/${commentId}`, {
        message: editText.trim(),
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === editingComment.id ? { ...c, message: editText.trim() } : c
        )
      );
      setIsEditModalOpen(false);
      setEditingComment(null);
    } catch (error) {
      console.error("Izohni tahrirlashda xatolik:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Izohni o'chirish (DELETE)
  const confirmDelete = (id: number | string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;

    setIsSubmitting(true);
    try {
      await baseAPI.delete(`/comments/${deletingId}`);

      setComments((prev) => prev.filter((c) => c.id !== deletingId));
      if (currentComments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error("Izohni o'chirishda xatolik:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">Izohlar</h1>
          <div className="flex items-center text-[13px] text-gray-500 font-medium">
            Foydalanuvchilar
            <span className="mx-2 w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
            Izohlar
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-[400px]">
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
          <button className="bg-[#407BFF] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Izlash
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-t-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-200 min-w-[1000px]">
              <thead>
                <tr className="bg-white text-[12px] text-gray-900 font-bold tracking-wider">
                  <th className="px-5 py-4 w-16 border border-gray-200">ID</th>
                  <th className="px-5 py-4 w-48 border border-gray-200">
                    Izoh egasi{" "}
                    <ChevronDown
                      size={14}
                      className="inline-block text-gray-400 ml-1"
                    />
                  </th>
                  <th className="px-5 py-4 w-44 border border-gray-200">
                    Telefon raqami
                  </th>
                  <th className="px-5 py-4 border border-gray-200">
                    Izoh{" "}
                    <ChevronDown
                      size={14}
                      className="inline-block text-gray-400 ml-1"
                    />
                  </th>
                  <th className="px-5 py-4 w-32 border border-gray-200">
                    Sana{" "}
                    <ChevronDown
                      size={14}
                      className="inline-block text-gray-400 ml-1"
                    />
                  </th>
                  <th className="px-5 py-4 w-28 text-center border border-gray-200">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center border border-gray-200">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentComments.length > 0 ? (
                  currentComments.map((comment) => (
                    <tr
                      key={comment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium border border-gray-200 align-middle">
                        {comment.id}
                      </td>

                      <td className="px-5 py-4 border border-gray-200 align-middle">
                        <span className="font-semibold text-[13px] text-gray-800">
                          {comment.fullName || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[13px] text-gray-700 border border-gray-200 align-middle font-mono">
                        {comment.phone || "—"}
                      </td>

                      <td className="px-5 py-4 border border-gray-200 align-middle">
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] text-gray-700 leading-snug">
                            {comment.message}
                          </span>
                          {comment.replies !== undefined && comment.replies > 0 && (
                            <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-md bg-gray-700 text-white text-[11px] font-bold">
                              {comment.replies}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sana formatting funksiyasi ulangan joy */}
                      <td className="px-5 py-4 text-[13px] text-gray-600 border border-gray-200 align-middle">
                        {formatDate(comment.createdAt || comment.created_at || comment.date)}
                      </td>

                      <td className="px-5 py-4 border border-gray-200 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(comment)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(comment.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500 border border-gray-200"
                    >
                      Ma'lumot topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="border border-gray-200 border-t-0 rounded-b-xl overflow-hidden bg-[#F8F9FA]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredComments.length}
            startIndex={startIndex}
            endIndex={endIndex}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            onDownloadXLS={handleDownloadXLS}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingComment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-[10px] p-4"
          onClick={() => !isSubmitting && setIsEditModalOpen(false)}
        >
          <div
            className="bg-white relative flex flex-col w-full max-w-[560px] rounded-[10px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-gray-900">
                Izohni tahrirlash
              </h2>
              <button
                disabled={isSubmitting}
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Izoh
                </label>
                <textarea
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-[14px] outline-none focus:border-[#407BFF] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-start">
              <button
                disabled={isSubmitting}
                onClick={handleSaveEdit}
                className="flex items-center justify-center gap-2 bg-[#407BFF] hover:bg-blue-600 text-white font-medium transition-colors shadow-sm rounded-lg px-5 h-[48px] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Check size={18} strokeWidth={2.5} />
                )}
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-[4px]"
          onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] shadow-xl p-8 w-[400px] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[84px] h-[84px] rounded-full bg-[#FFF0F0] flex items-center justify-center mb-6">
              <div className="w-[60px] h-[60px] rounded-full bg-[#FF4D4F] flex items-center justify-center text-white text-[32px] font-bold">
                ?
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-8 text-center">
              Siz rostdan ham o'chirmoqchimisiz?
            </h3>
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                disabled={isSubmitting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingId(null);
                }}
                className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Bekor qilish
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleDelete}
                className="flex-1 py-3 rounded-lg bg-[#407BFF] hover:bg-blue-600 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}