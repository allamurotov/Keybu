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
  type LucideIcon,
} from "lucide-react";
import Pagination from "@/app/components/dashboard/Pagination";
import MentorLessonHeader from "@/app/components/lesson/MentorLessonHeader";
import MentorLessonTabs from "@/app/components/lesson/MentorLessonTabs";
import {
  getHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
  Homework as APIHomework,
} from "@/app/lib/api/homeworks";
import { API_URL, baseAPI } from "@/app/lib/utils";

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  url?: string;
  file?: File;
}

interface Homework {
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

export interface MentorHomeworkTasksProps {
  /** When set, only homeworks for this lesson are shown (lesson tasks tab). */
  lessonId?: string;
  /** When set, renders lesson breadcrumb + tabs chrome. */
  lessonChrome?: {
    courseId: string;
    sectionId: string;
  };
  /** Standalone page title (used when lessonChrome is absent). */
  title?: string;
  description?: string;
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

export default function MentorHomeworkTasks({
  lessonId,
  lessonChrome,
  title = "Uyga vazifalar",
  description = "Barcha uyga vazifalar (topshiriqlar) ro'yxati",
}: MentorHomeworkTasksProps) {
  const courseId = lessonChrome?.courseId;
  const sectionId = lessonChrome?.sectionId;

  const [courseTitle, setCourseTitle] = useState("Kurs");
  const [lessonName, setLessonName] = useState("Dars");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Homework[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [newTask, setNewTask] = useState<{
    lessonId: string;
    title: string;
    description: string;
    files: AttachedFile[];
  }>({ lessonId: lessonId || "", title: "", description: "", files: [] });

  const [editingTask, setEditingTask] = useState<Homework | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLessonLabel = (id?: number) =>
    lessons.find((l) => l.id === id)?.name || lessonName;

  useEffect(() => {
    const loadMeta = async () => {
      if (!courseId || !lessonId) return;
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
    loadMeta();
  }, [courseId, lessonId]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHomeworks();

      try {
        const { data: resData } = await baseAPI.get("/lessons");
        const raw = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
        setLessons(
          raw.map((l: { id: number; sectionId?: number; name?: string; title?: string }) => ({
            id: l.id,
            sectionId: l.sectionId || 0,
            name: l.name || l.title || "Nomsiz dars",
          }))
        );
      } catch (err) {
        console.error("Darslar topilmadi", err);
      }

      const scoped = lessonId
        ? data.filter((h: APIHomework) => h.lessonId === Number(lessonId))
        : data;

      const mapped = scoped.map((h: APIHomework) => ({
        id: h.id,
        lessonId: h.lessonId,
        title: h.title || "Nomsiz",
        description: h.description || "",
        files: (h.file || []).map((url: string) => ({
          id: url,
          name: url.split("/").pop() || "Fayl",
          size: "Noma'lum",
          url: url.startsWith("http") ? url : `${API_URL}/${url}`,
        })),
      }));
      setTasks(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const resetForm = () => {
    setNewTask({ lessonId: lessonId || "", title: "", description: "", files: [] });
    setEditingTask(null);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.lessonId) return;

    const fd = new FormData();
    fd.append("title", newTask.title.trim());
    fd.append("description", newTask.description.trim());
    fd.append("lessonId", String(newTask.lessonId));
    newTask.files.forEach((f) => {
      if (f.file) fd.append("file", f.file);
    });

    try {
      await createHomework(fd);
      await loadData();
      setIsAddModalOpen(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Topshiriq qo'shishda xatolik yuz berdi");
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title.trim()) return;

    const fd = new FormData();
    fd.append("title", editingTask.title.trim());
    fd.append("description", editingTask.description.trim());
    fd.append("lessonId", String(editingTask.lessonId));
    editingTask.files.forEach((f) => {
      if (f.file) fd.append("file", f.file);
    });

    try {
      await updateHomework(editingTask.id, fd);
      await loadData();
      setIsEditModalOpen(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Topshiriq tahrirlashda xatolik yuz berdi");
    }
  };

  const handleDeleteTask = async () => {
    if (deletingTaskId === null) return;

    try {
      await deleteHomework(deletingTaskId);
      await loadData();
      setDeletingTaskId(null);
      setIsDeleteModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("O'chirishda xatolik yuz berdi");
    }
  };

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
      setEditingTask((prev) =>
        prev ? { ...prev, files: [...prev.files, ...newAttachedFiles] } : prev
      );
    } else {
      setNewTask((prev) => ({ ...prev, files: [...prev.files, ...newAttachedFiles] }));
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
    if (isEdit && editingTask) {
      setEditingTask({ ...editingTask, files: editingTask.files.filter((f) => f.id !== fileId) });
    } else {
      setNewTask((prev) => ({ ...prev, files: prev.files.filter((f) => f.id !== fileId) }));
    }
  };

  const openEditModal = (task: Homework) => {
    setEditingTask({ ...task, files: [...task.files] });
    setIsEditModalOpen(true);
  };

  const handleDownloadXLS = () => {
    const csvEscape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const headers = ["ID", "Dars", "Topshiriq nomi", "Topshiriq izohi", "Fayllar"];
    const rows = tasks.map((t) =>
      [
        t.id,
        csvEscape(getLessonLabel(t.lessonId)),
        csvEscape(t.title),
        csvEscape(t.description),
        csvEscape(t.files.map((f) => f.name).join("; ")),
      ].join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vazifalar.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderModalContent = (isEdit: boolean) => {
    const currentFiles = isEdit ? editingTask?.files || [] : newTask.files;

    return (
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Dars nomi</label>
          {isEdit ? (
            <input
              type="text"
              disabled
              value={getLessonLabel(editingTask?.lessonId)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-[14px] cursor-not-allowed"
            />
          ) : (
            <select
              value={newTask.lessonId}
              onChange={(e) => setNewTask({ ...newTask, lessonId: e.target.value })}
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

        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Topshiriq nomi</label>
          <input
            type="text"
            placeholder="Kiriting"
            value={isEdit ? editingTask?.title || "" : newTask.title}
            onChange={(e) => {
              if (isEdit && editingTask) {
                setEditingTask({ ...editingTask, title: e.target.value });
              } else {
                setNewTask({ ...newTask, title: e.target.value });
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          />
        </div>

        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Topshiriq haqida (izoh)</label>
          <input
            type="text"
            placeholder="Kiriting"
            value={isEdit ? editingTask?.description || "" : newTask.description}
            onChange={(e) => {
              if (isEdit && editingTask) {
                setEditingTask({ ...editingTask, description: e.target.value });
              } else {
                setNewTask({ ...newTask, description: e.target.value });
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          />
        </div>

        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-2">Fayl biriktirish</label>
          <div
            className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors mb-4"
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
            <div className="space-y-3">
              {currentFiles.map((file) => {
                const { Icon, color } = getFileMeta(file.name);
                return (
                  <div key={file.id} className="border border-gray-200 rounded-xl p-4 flex gap-4 bg-white">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-[14px] font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-[12px] text-gray-500">{file.size}</p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id, isEdit)}
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={isEdit ? handleEditTask : handleAddTask}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-2"
        >
          <Check size={18} /> Saqlash
        </button>
      </div>
    );
  };

  const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const showLessonChrome = Boolean(lessonChrome && courseId && sectionId && lessonId);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col h-full bg-transparent">
        {showLessonChrome ? (
          <MentorLessonHeader courseId={courseId!} sectionId={sectionId!} courseTitle={courseTitle} />
        ) : null}

        <div className="flex items-center justify-between mb-6">
          {showLessonChrome ? (
            <MentorLessonTabs
              courseId={courseId!}
              sectionId={sectionId!}
              lessonId={lessonId!}
              active="tasks"
            />
          ) : (
            <div>
              <h1 className="text-[24px] font-bold text-gray-900 mb-1">{title}</h1>
              <p className="text-[14px] text-gray-500">{description}</p>
            </div>
          )}
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
                      Topshiriq <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap border border-gray-200 w-[30%]">
                    <div className="flex items-center justify-between cursor-pointer group">
                      Fayllar <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
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
                ) : paginatedTasks.length > 0 ? (
                  paginatedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 border border-gray-200 text-gray-600 text-[13px]">
                        {task.description}
                      </td>
                      <td className="px-6 py-4 border border-gray-200">
                        {task.files.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {task.files.map((file) => {
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
                            onClick={() => openEditModal(task)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Pen size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingTaskId(task.id);
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
                      Vazifalar mavjud emas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl px-2 py-1 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(tasks.length / itemsPerPage) || 1}
              totalItems={tasks.length}
              startIndex={Math.min((currentPage - 1) * itemsPerPage, tasks.length)}
              endIndex={Math.min(currentPage * itemsPerPage, tasks.length)}
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
                  setDeletingTaskId(null);
                }}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex-1"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteTask}
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
