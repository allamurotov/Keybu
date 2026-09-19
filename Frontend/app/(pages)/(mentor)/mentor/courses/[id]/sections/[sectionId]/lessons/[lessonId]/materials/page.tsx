"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Filter,
  Pen,
  Trash2,
  X,
  Check,
  UploadCloud,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  type LucideIcon
} from "lucide-react";
import Pagination from "@/app/components/dashboard/Pagination";
import MentorLessonHeader from "@/app/components/lesson/MentorLessonHeader";
import MentorLessonTabs from "@/app/components/lesson/MentorLessonTabs";
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, Material as APIMaterial } from "@/app/lib/api/materials";
import { API_URL, baseAPI } from "@/app/lib/utils";
import { useParams } from "next/navigation";

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  url?: string;
  file?: File;
  uploading?: boolean;
}

interface Material {
  id: number;
  lessonId?: number;
  title: string;
  description: string;
  files: AttachedFile[];
}

interface Lesson {
  id: number;
  sectionId: number;
  name: string;
}

const getFileMeta = (name: string): { Icon: LucideIcon; color: string; label: string } => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["xls", "xlsx", "csv"].includes(ext)) return { Icon: FileSpreadsheet, color: "bg-green-600", label: "Excel" };
  if (ext === "pdf") return { Icon: FileText, color: "bg-red-600", label: "PDF" };
  if (["doc", "docx"].includes(ext)) return { Icon: FileText, color: "bg-blue-600", label: "Word" };
  if (["ppt", "pptx"].includes(ext)) return { Icon: FileText, color: "bg-orange-500", label: "PowerPoint" };
  if (["svg", "png", "jpg", "jpeg", "gif"].includes(ext)) return { Icon: ImageIcon, color: "bg-purple-600", label: "Rasm" };
  return { Icon: FileIcon, color: "bg-gray-500", label: "Fayl" };
};

const UPLOAD_ACCEPT = ".pdf,.xls,.xlsx,.csv,.doc,.docx,.ppt,.pptx,.svg,.png,.jpg,.jpeg,.gif";

export default function MentorLessonMaterialsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const sectionId = params?.sectionId as string;
  const lessonId = params?.lessonId as string;

  const [courseTitle, setCourseTitle] = useState("Kurs");
  const [lessonName, setLessonName] = useState("Dars");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [newMaterial, setNewMaterial] = useState<{
    lessonId: string;
    title: string;
    description: string;
    files: AttachedFile[];
  }>({ lessonId: lessonId, title: "", description: "", files: [] });

  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // LOAD META
  // ============================================================

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [courseRes, lessonRes] = await Promise.allSettled([
          baseAPI.get(`/courses/${courseId}`),
          baseAPI.get(`/lessons/${lessonId}`),
        ]);
        if (courseRes.status === "fulfilled") {
          const d = courseRes.value.data?.data || courseRes.value.data;
          if (d?.name) setCourseTitle(d.name);
        }
        if (lessonRes.status === "fulfilled") {
          const d = lessonRes.value.data?.data || lessonRes.value.data;
          if (d?.name) setLessonName(d.name);
        }
      } catch {
        // ignore
      }
    };
    if (courseId && lessonId) loadMeta();
  }, [courseId, lessonId]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMaterials();

      let fetchedLessons: Lesson[] = [];
      try {
        const { data: resData } = await baseAPI.get("/lessons");
        fetchedLessons = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
        setLessons(fetchedLessons);
      } catch (err) {
        console.error("Darslar topilmadi", err);
      }

      const filtered = data.filter((m: APIMaterial) => m.lessonId === Number(lessonId));

      const mapped = filtered.map((m: APIMaterial) => ({
        id: m.id,
        lessonId: m.lessonId,
        title: m.title || "Nomsiz",
        description: m.description || "",
        files: (m.file || []).map((url: string) => ({
          id: url,
          name: url.split("/").pop() || "Fayl",
          size: "Noma'lum",
          url: url.startsWith("http") ? url : `${API_URL}/${url}`,
        })),
      }));
      setMaterials(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setNewMaterial({ lessonId: lessonId, title: "", description: "", files: [] });
    setEditingMaterial(null);
  };

  // ============================================================
  // ADD
  // ============================================================

  const handleAddMaterial = async () => {
    if (!newMaterial.title.trim()) return;

    const fd = new FormData();
    fd.append("title", newMaterial.title.trim());
    fd.append("description", newMaterial.description.trim());
    fd.append("lessonId", String(newMaterial.lessonId));
    newMaterial.files.forEach((f) => {
      if (f.file) fd.append("file", f.file);
    });

    try {
      await createMaterial(fd);
      await loadData();
      setIsAddModalOpen(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Material qo'shishda xatolik yuz berdi");
    }
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEditMaterial = async () => {
    if (!editingMaterial || !editingMaterial.title.trim()) return;

    const fd = new FormData();
    fd.append("title", editingMaterial.title.trim());
    fd.append("description", editingMaterial.description.trim());
    fd.append("lessonId", String(editingMaterial.lessonId));
    editingMaterial.files.forEach((f) => {
      if (f.file) fd.append("file", f.file);
    });

    try {
      await updateMaterial(editingMaterial.id, fd);
      await loadData();
      setIsEditModalOpen(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Material o'zgartirishda xatolik yuz berdi");
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDeleteMaterial = async () => {
    if (deletingMaterialId === null) return;

    try {
      await deleteMaterial(deletingMaterialId);
      await loadData();
      setDeletingMaterialId(null);
      setIsDeleteModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  // ============================================================
  // FILE HELPERS
  // ============================================================

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const targetIsEdit = isEditModalOpen;

    const newAttachedFiles: AttachedFile[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      file: file,
    }));

    if (targetIsEdit) {
      setEditingMaterial((prev) =>
        prev ? { ...prev, files: [...prev.files, ...newAttachedFiles] } : prev
      );
    } else {
      setNewMaterial((prev) => ({ ...prev, files: [...prev.files, ...newAttachedFiles] }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (fileId: string, isEdit: boolean) => {
    if (isEdit && editingMaterial) {
      setEditingMaterial({ ...editingMaterial, files: editingMaterial.files.filter((f) => f.id !== fileId) });
    } else {
      setNewMaterial((prev) => ({ ...prev, files: prev.files.filter((f) => f.id !== fileId) }));
    }
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial({ ...material, files: [...material.files] });
    setIsEditModalOpen(true);
  };

  // ============================================================
  // DOWNLOAD
  // ============================================================

  const handleDownloadXLS = () => {
    const csvEscape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const headers = ["ID", "Dars", "Material uchun izoh", "Biriktirilgan fayllar"];
    const rows = materials.map((m) =>
      [m.id, csvEscape(m.title), csvEscape(m.description), csvEscape(m.files.map((f) => f.name).join("; "))].join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "materiallar.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // MODAL CONTENT
  // ============================================================

  const renderModalContent = (isEdit: boolean) => {
    const currentFiles = isEdit ? editingMaterial?.files || [] : newMaterial.files;

    return (
      <div className="p-6 space-y-6">
        {/* Dars nomi */}
        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Dars nomi</label>
          {isEdit ? (
            <input
              type="text"
              disabled
              value={lessons.find((l) => l.id === editingMaterial?.lessonId)?.name || lessonName}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-[14px] cursor-not-allowed"
            />
          ) : (
            <select
              value={newMaterial.lessonId}
              onChange={(e) => setNewMaterial({ ...newMaterial, lessonId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px] bg-white cursor-pointer"
            >
              <option value="">Darsni tanlang</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Material nomi */}
        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Material nomi</label>
          <input
            type="text"
            placeholder="Kiriting"
            value={isEdit ? editingMaterial?.title || "" : newMaterial.title}
            onChange={(e) => {
              if (isEdit && editingMaterial) {
                setEditingMaterial({ ...editingMaterial, title: e.target.value });
              } else {
                setNewMaterial({ ...newMaterial, title: e.target.value });
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          />
        </div>

        {/* Material haqida */}
        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Material haqida</label>
          <input
            type="text"
            placeholder="Kiriting"
            value={isEdit ? editingMaterial?.description || "" : newMaterial.description}
            onChange={(e) => {
              if (isEdit && editingMaterial) {
                setEditingMaterial({ ...editingMaterial, description: e.target.value });
              } else {
                setNewMaterial({ ...newMaterial, description: e.target.value });
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          />
        </div>

        {/* Fayllar */}
        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Fayllar</label>
          <div
            className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
              <UploadCloud size={20} className="text-gray-500" />
            </div>
            <p className="text-[14px] text-gray-600 text-center">
              <span className="text-blue-600 font-medium">Bu yerga bosing</span> yoki faylni suring
            </p>
            <p className="text-[12px] text-gray-400 mt-1">PDF, Excel, Word, rasm va h.k.</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={UPLOAD_ACCEPT}
              multiple
              className="hidden"
            />
          </div>

          {currentFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {currentFiles.map((file) => {
                const { Icon, color } = getFileMeta(file.name);
                return (
                  <div key={file.id} className="border border-gray-200 rounded-xl p-3 flex items-center gap-3 bg-white">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 truncate pr-4">{file.name}</p>
                      <p className="text-[12px] text-gray-500">{file.size}</p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id, isEdit)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={isEdit ? handleEditMaterial : handleAddMaterial}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-2"
        >
          <Check size={18} /> Saqlash
        </button>
      </div>
    );
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const paginatedMaterials = materials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col h-full bg-transparent">
        <MentorLessonHeader courseId={courseId} sectionId={sectionId} courseTitle={courseTitle} />

        <div className="flex items-center justify-between mb-6">
          <MentorLessonTabs courseId={courseId} sectionId={sectionId} lessonId={lessonId} active="materials" />
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
          >
            <PlusCircle size={18} />
            Qo&apos;shish
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="overflow-x-auto rounded-t-xl overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse min-w-[800px] bg-white">
              <thead className="bg-gray-50">
                <tr className="text-[13px] text-gray-900 font-bold tracking-wide">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[20%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Dars <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[40%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Material uchun izoh <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[30%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Biriktirilgan fayllar <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap text-center w-[10%] border border-gray-200">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 border border-gray-200 bg-white">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : paginatedMaterials.length > 0 ? (
                  paginatedMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">
                        {material.title}
                      </td>
                      <td className="px-6 py-4 border border-gray-200 text-gray-600 text-[13px]">
                        {material.description}
                      </td>
                      <td className="px-6 py-4 border border-gray-200">
                        {material.files.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {material.files.map((file) => {
                              const { Icon, color, label } = getFileMeta(file.name);
                              return (
                                <a
                                  key={file.id}
                                  href={file.url || "#"}
                                  target={file.url ? "_blank" : undefined}
                                  rel="noopener noreferrer"
                                  title={file.name}
                                  className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-800 hover:border-blue-300 hover:text-blue-600 transition-colors"
                                >
                                  <span className={`w-6 h-6 rounded-md text-white flex items-center justify-center shrink-0 ${color}`}>
                                    <Icon size={13} />
                                  </span>
                                  {label}
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[13px] italic">Yuklanmagan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center border border-gray-200">
                        <div className="flex items-center justify-center gap-3 text-gray-400">
                          <button
                            onClick={() => openEditModal(material)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Pen size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingMaterialId(material.id);
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
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 border border-gray-200 bg-white">
                      Materiallar mavjud emas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl px-2 py-1 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(materials.length / itemsPerPage) || 1}
              totalItems={materials.length}
              startIndex={Math.min((currentPage - 1) * itemsPerPage, materials.length)}
              endIndex={Math.min(currentPage * itemsPerPage, materials.length)}
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] flex flex-col max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditModalOpen ? "Tahrirlash" : "Qo\u02bbishish"}
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
          onClick={() => setIsDeleteModalOpen(false)}
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
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingMaterialId(null);
                }}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex-1"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteMaterial}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex-1"
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
