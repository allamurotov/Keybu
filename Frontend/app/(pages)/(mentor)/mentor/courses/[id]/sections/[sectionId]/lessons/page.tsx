"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Filter,
  Pen,
  Trash2,
  X,
  Check,
  Play,
  UploadCloud,
  FileVideo,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Pagination from "@/app/components/dashboard/Pagination";
import { baseAPI, API_URL } from "@/app/lib/utils";

interface Lesson {
  id: number;
  title: string;
  description: string;
  video: { name: string; size: string; url?: string } | null;
}

export default function MentorLessonsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const sectionId = params?.sectionId as string;

  const [courseTitle, setCourseTitle] = useState("Kurs");
  const [sectionName, setSectionName] = useState("Bo'lim");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [newLesson, setNewLesson] = useState<{
    title: string;
    description: string;
    video: { name: string; size: string; progress: number; rawFile?: File } | null;
  }>({ title: "", description: "", video: null });

  const [editingLesson, setEditingLesson] = useState<
    (Lesson & { videoProgress?: number; rawFile?: File }) | null
  >(null);
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);
  const [titleError, setTitleError] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadMeta = async () => {
    try {
      const [courseRes, sectionRes] = await Promise.allSettled([
        baseAPI.get(`/courses/${courseId}`),
        baseAPI.get(`/sections/${sectionId}`),
      ]);

      if (courseRes.status === "fulfilled") {
        const d = courseRes.value.data?.data || courseRes.value.data;
        if (d?.name) setCourseTitle(d.name);
      }
      if (sectionRes.status === "fulfilled") {
        const d = sectionRes.value.data?.data || sectionRes.value.data;
        if (d?.name) setSectionName(d.name);
      }
    } catch {
      // ignore
    }
  };

  const getLessons = async () => {
    try {
      setLoading(true);
      const response = await baseAPI.get("/lessons");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      const filtered = data.filter(
        (l: any) => Number(l.sectionId) === Number(sectionId)
      );

      setLessons(
        filtered.map((l: any) => ({
          id: l.id,
          title: l.name || l.title || "",
          description: l.description || "",
          video: l.file ? { 
            name: l.file.split("/").pop() || "video.mp4", 
            size: "",
            url: l.file.startsWith("http") ? l.file : `${API_URL}${l.file}`
          } : null,
        }))
      );
    } catch {
      // ignore — show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && sectionId) {
      loadMeta();
      getLessons();
    }
  }, [courseId, sectionId]);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setNewLesson({ title: "", description: "", video: null });
    setEditingLesson(null);
    setTitleError(false);
    setError("");
  };

  // ============================================================
  // ADD LESSON
  // ============================================================

  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) {
      setTitleError(true);
      return;
    }

    if (!newLesson.video?.rawFile) {
      setError("Dars video fayli yuklanishi shart");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const formData = new FormData();
      formData.append("name", newLesson.title.trim());
      formData.append("description", newLesson.description.trim());
      formData.append("sectionId", String(sectionId));
      formData.append("file", newLesson.video.rawFile);

      await baseAPI.post("/lessons", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await getLessons();
      setIsAddModalOpen(false);
      resetForm();
      setSuccessMessage("Dars muvaffaqiyatli qo'shildi!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Dars qo'shishda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT LESSON
  // ============================================================

  const handleEditLesson = async () => {
    if (!editingLesson || !editingLesson.title.trim()) {
      setTitleError(true);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const formData = new FormData();
      formData.append("name", editingLesson.title.trim());
      formData.append("description", editingLesson.description.trim());
      formData.append("sectionId", String(sectionId));
      if (editingLesson.rawFile) {
        formData.append("file", editingLesson.rawFile);
      }

      await baseAPI.patch(`/lessons/${editingLesson.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await getLessons();
      setIsEditModalOpen(false);
      resetForm();
      setSuccessMessage("Dars muvaffaqiyatli tahrirlandi!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Darsni tahrirlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE LESSON
  // ============================================================

  const handleDeleteLesson = async () => {
    if (deletingLessonId === null) return;

    try {
      setDeleting(true);
      await baseAPI.delete(`/lessons/${deletingLessonId}`);
      await getLessons();
      setDeletingLessonId(null);
      setIsDeleteModalOpen(false);
      setSuccessMessage("Dars muvaffaqiyatli o'chirildi!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Darsni o'chirishda xatolik.");
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // FILE UPLOAD
  // ============================================================

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSize = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const fileName = file.name;

    if (isEditModalOpen && editingLesson) {
      setEditingLesson({ 
        ...editingLesson, 
        videoProgress: 100, 
        rawFile: file,
        video: { name: fileName, size: fileSize } 
      });
    } else {
      setNewLesson((prev) => ({ 
        ...prev, 
        video: { name: fileName, size: fileSize, progress: 100, rawFile: file } 
      }));
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileSize = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const fileName = file.name;

    if (isEditModalOpen && editingLesson) {
      setEditingLesson({ 
        ...editingLesson, 
        videoProgress: 100, 
        rawFile: file,
        video: { name: fileName, size: fileSize } 
      });
    } else {
      setNewLesson((prev) => ({ 
        ...prev, 
        video: { name: fileName, size: fileSize, progress: 100, rawFile: file } 
      }));
    }
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson({ ...lesson, videoProgress: lesson.video ? 100 : undefined });
    setTitleError(false);
    setError("");
    setIsEditModalOpen(true);
  };

  // ============================================================
  // DOWNLOAD CSV
  // ============================================================

  const handleDownloadXLS = () => {
    const headers = ["ID", "Biriktirilgan kurs", "Dars mavzusi", "Dars haqida"];
    const rows = lessons.map((l) => [l.id, courseTitle, l.title, l.description].join(","));
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "darslar.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // MODAL CONTENT
  // ============================================================

  const renderModalContent = (isEdit: boolean) => {
    const currentVideo = isEdit ? editingLesson?.video : newLesson.video;
    const currentProgress = isEdit
      ? editingLesson?.videoProgress || 0
      : newLesson.video?.progress || 0;

    return (
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Bo&apos;lim nomi
          </label>
          <input
            type="text"
            disabled
            value={sectionName}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-[14px] cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Dars nomi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Kiriting"
            value={isEdit ? editingLesson?.title || "" : newLesson.title}
            onChange={(e) => {
              setTitleError(false);
              if (isEdit && editingLesson) {
                setEditingLesson({ ...editingLesson, title: e.target.value });
              } else {
                setNewLesson({ ...newLesson, title: e.target.value });
              }
            }}
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px] ${
              titleError ? "border-red-500 bg-red-50/50" : "border-gray-200"
            }`}
          />
          {titleError && (
            <p className="text-red-500 text-[12px] mt-1.5 font-medium">
              Dars mavzusi kiritilishi shart
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Dars haqida
          </label>
          <input
            type="text"
            placeholder="Kiriting"
            value={isEdit ? editingLesson?.description || "" : newLesson.description}
            onChange={(e) => {
              if (isEdit && editingLesson) {
                setEditingLesson({ ...editingLesson, description: e.target.value });
              } else {
                setNewLesson({ ...newLesson, description: e.target.value });
              }
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Video fayl
          </label>

          {!currentVideo ? (
            <div
              className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                <UploadCloud size={20} className="text-gray-500" />
              </div>
              <p className="text-[14px] text-gray-600 text-center">
                <span className="text-blue-600 font-medium">Bu yerga bosing</span> yoki
                faylni suring
              </p>
              <p className="text-[12px] text-gray-400 mt-1">.mp4 yoki .MOV</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/mp4,video/quicktime"
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-white relative">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <FileVideo size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[14px] font-medium text-gray-900 truncate pr-4">
                    {currentVideo.name}
                  </p>
                  {currentProgress === 100 && (
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[12px] text-gray-500 mb-2">{currentVideo.size}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEdit && editingLesson) {
                    setEditingLesson({ ...editingLesson, video: null, videoProgress: 0 });
                  } else {
                    setNewLesson({ ...newLesson, video: null });
                  }
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          disabled={saving}
          onClick={isEdit ? handleEditLesson : handleAddLesson}
          className="w-[120px] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors mt-2"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Check size={18} /> Saqlash
            </>
          )}
        </button>
      </div>
    );
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.ceil(lessons.length / itemsPerPage) || 1;
  const startIndex = Math.min((currentPage - 1) * itemsPerPage, lessons.length);
  const endIndex = Math.min(currentPage * itemsPerPage, lessons.length);

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col h-full bg-transparent">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-1.5">Darslar</h1>
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
              <Link
                href={`/mentor/courses/${courseId}/sections`}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Bo&apos;limlar
              </Link>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-gray-900">Darslar</span>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Dars qo&apos;shish
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TABLE CONTAINER */}
        <div className="flex-1 flex flex-col">
          <div className="overflow-x-auto rounded-t-xl overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse min-w-[1000px] bg-white">
              <thead className="bg-gray-50">
                <tr className="text-[13px] text-gray-900 font-bold tracking-wide">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[20%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Biriktirilgan kurs{" "}
                      <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[20%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Dars mavzusi{" "}
                      <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[30%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Dars haqida{" "}
                      <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[15%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Dars video fayli{" "}
                      <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[10%]">
                    Materiallar
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap text-center w-[5%] border border-gray-200">
                    Amallar
                  </th>
                </tr>
              </thead>

              <tbody className="text-[14px] text-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center border border-gray-200">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 size={20} className="animate-spin" />
                        Darslar yuklanmoqda...
                      </div>
                    </td>
                  </tr>
                ) : lessons.length > 0 ? (
                  lessons
                    .slice(startIndex, endIndex)
                    .map((lesson) => (
                      <tr
                        key={lesson.id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">
                          <Link
                            href={`/mentor/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}/materials`}
                            className="hover:text-blue-600 transition-colors cursor-pointer block w-full"
                          >
                            {courseTitle}
                          </Link>
                        </td>
                        <td className="px-6 py-4 border border-gray-200">
                          <Link
                            href={`/mentor/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}/materials`}
                            className="hover:text-blue-600 transition-colors cursor-pointer block w-full"
                          >
                            {lesson.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 border border-gray-200 text-gray-600 text-[13px]">
                          {lesson.description}
                        </td>
                        <td className="px-6 py-4 border border-gray-200">
                          {lesson.video ? (
                            <button
                              onClick={() => {
                                setPlayingVideoUrl(lesson.video?.url || "");
                                setIsPlayingVideo(true);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[13px] font-medium cursor-pointer"
                            >
                              <Play size={14} className="fill-blue-600" />
                              Video
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[13px] italic">
                              Yuklanmagan
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 border border-gray-200">
                          <Link
                            href={`/mentor/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}/materials`}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[13px] font-medium transition-colors inline-block text-center"
                          >
                            Biriktirish
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center border border-gray-200">
                          <div className="flex items-center justify-center gap-3 text-gray-400">
                            <button
                              onClick={() => openEditModal(lesson)}
                              className="p-1 hover:text-blue-600 transition-colors"
                            >
                              <Pen size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingLessonId(lesson.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1 hover:text-red-500 transition-colors"
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
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500 border border-gray-200 bg-white"
                    >
                      Darslar mavjud emas
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
              totalItems={lessons.length}
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

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Dars {isEditModalOpen ? "tahrirlash" : "qo\u02bbishish"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {renderModalContent(isEditModalOpen)}
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => {
            if (!deleting) {
              setIsDeleteModalOpen(false);
              setDeletingLessonId(null);
            }
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-xl w-full max-w-[400px] flex flex-col items-center text-center p-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                ?
              </div>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-8">
              Rostdan ham o&apos;chirmoqchimisiz?
            </h2>
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                disabled={deleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingLessonId(null);
                }}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex-1 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteLesson}
                className="px-8 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex-1 disabled:bg-red-300 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <Loader2 size={18} className="animate-spin" />
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

      {/* VIDEO PLAYER MODAL */}
      {isPlayingVideo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsPlayingVideo(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPlayingVideo(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <video
              className="w-full aspect-video object-cover"
              controls
              autoPlay
              src={playingVideoUrl || "/video_2026-08-10_11-15-10.mp4"}
            />
          </div>
        </div>
      )}
    </>
  );
}
