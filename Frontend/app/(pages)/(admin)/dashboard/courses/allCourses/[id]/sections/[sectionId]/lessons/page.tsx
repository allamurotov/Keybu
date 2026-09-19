"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
  Loader2,
} from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";

import Pagination from "@/app/components/dashboard/Pagination";
import { useCourseStore } from "@/app/store/useCourseStore";
import { baseAPI } from "@/app/lib/utils";

/* =========================================================
   TYPES
========================================================= */

interface Lesson {
  id: number;
  sectionId: number;
  name: string;
  description: string;
  file: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Section {
  id: number;
  courseId: number;
  name: string;
}

interface LessonForm {
  name: string;
  description: string;
  file: File | null;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LessonsPage() {
  /* =======================================================
     PARAMS
  ======================================================= */

  const params = useParams<{
    id: string;
    sectionId: string;
  }>();

  const courseId = params?.id;
  const sectionId = params?.sectionId;

  /* =======================================================
     COURSE STORE
  ======================================================= */

  const { courses } = useCourseStore();

  const currentCourse = courses.find(
    (course) =>
      Number(course.id) === Number(courseId)
  );

  const courseTitle =
    currentCourse?.title ||
    (currentCourse as any)?.name ||
    "Kurs";

  /* =======================================================
     STATES
  ======================================================= */

  const [section, setSection] =
    useState<Section | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  /* =======================================================
     MODALS
  ======================================================= */

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  /* =======================================================
     EDIT / DELETE
  ======================================================= */

  const [editingLesson, setEditingLesson] =
    useState<Lesson | null>(null);

  const [deletingLessonId, setDeletingLessonId] =
    useState<number | null>(null);

  /* =======================================================
     VIDEO
  ======================================================= */

  const [isPlayingVideo, setIsPlayingVideo] =
    useState(false);

  const [playingVideoUrl, setPlayingVideoUrl] =
    useState("");

  /* =======================================================
     FORM
  ======================================================= */

  const [newLesson, setNewLesson] =
    useState<LessonForm>({
      name: "",
      description: "",
      file: null,
    });

  const [nameError, setNameError] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* =========================================================
     GET ARRAY DATA
  ========================================================= */

  const getArrayData = useCallback(
    (data: any): any[] => {
      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.data)) {
        return data.data;
      }

      if (Array.isArray(data?.items)) {
        return data.items;
      }

      if (Array.isArray(data?.results)) {
        return data.results;
      }

      return [];
    },
    []
  );

  /* =========================================================
     GET SECTION
  ========================================================= */

  const fetchSection = useCallback(async () => {
    if (!courseId || !sectionId) return;

    try {
      const response =
        await baseAPI.get("/sections");

      const sections =
        getArrayData(response.data);

      const currentSection =
        sections.find(
          (item: Section) =>
            Number(item.id) ===
              Number(sectionId) &&
            Number(item.courseId) ===
              Number(courseId)
        );

      if (currentSection) {
        setSection(currentSection);
      } else {
        setSection(null);

        console.warn(
          "SECTION TOPILMADI",
          {
            courseId,
            sectionId,
          }
        );
      }
    } catch (error: any) {
      console.error(
        "GET SECTION ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );
    }
  }, [
    courseId,
    sectionId,
    getArrayData,
  ]);

  /* =========================================================
     GET LESSONS
  ========================================================= */

  const fetchLessons = useCallback(async () => {
    if (!sectionId) return;

    try {
      setLoading(true);
      setApiError("");

      const response =
        await baseAPI.get("/lessons", {
          params: {
            sectionId: Number(sectionId),
          },
        });

      console.log(
        "GET LESSONS RESPONSE:",
        response.data
      );

      const data =
        getArrayData(response.data);

      const filteredLessons =
        data.filter(
          (lesson: Lesson) =>
            Number(lesson.sectionId) ===
            Number(sectionId)
        );

      setLessons(filteredLessons);

      /*
       * Agar page o'zgarib ketgan bo'lsa,
       * mavjud pagega qaytaramiz.
       */

      const totalPages =
        Math.ceil(
          filteredLessons.length /
            itemsPerPage
        );

      if (
        currentPage > totalPages &&
        totalPages > 0
      ) {
        setCurrentPage(totalPages);
      }
    } catch (error: any) {
      console.error(
        "GET LESSONS ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      setApiError(
        error?.response?.data?.message ||
          "Darslarni olishda xatolik yuz berdi"
      );

      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [
    sectionId,
    getArrayData,
    itemsPerPage,
    currentPage,
  ]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (!courseId || !sectionId) {
      return;
    }

    fetchSection();
    fetchLessons();
  }, [
    courseId,
    sectionId,
    fetchSection,
    fetchLessons,
  ]);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setNewLesson({
      name: "",
      description: "",
      file: null,
    });

    setEditingLesson(null);

    setNameError(false);

    setApiError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     CLOSE MODALS
  ========================================================= */

  const closeAddEditModal = () => {
    if (saving) return;

    setIsAddModalOpen(false);
    setIsEditModalOpen(false);

    resetForm();
  };

  /* =========================================================
     OPEN ADD
  ========================================================= */

  const openAddModal = () => {
    resetForm();

    setIsAddModalOpen(true);
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEditModal = (
    lesson: Lesson
  ) => {
    setApiError("");
    setNameError(false);

    setEditingLesson({
      ...lesson,
    });

    setIsEditModalOpen(true);
  };

  /* =========================================================
     CREATE LESSON
  ========================================================= */

  const handleAddLesson = async () => {
    const name =
      newLesson.name.trim();

    const description =
      newLesson.description.trim();

    if (!name) {
      setNameError(true);
      return;
    }

    if (!sectionId) {
      setApiError(
        "Section ID topilmadi"
      );
      return;
    }

    try {
      setSaving(true);
      setApiError("");

      /*
       * MUHIM:
       *
       * Backend multipart/form-data kutyapti.
       *
       * Fieldlar:
       *
       * sectionId
       * name
       * description
       * file
       *
       * `video` yubormaymiz!
       */

      const formData = new FormData();

      formData.append(
        "sectionId",
        String(Number(sectionId))
      );

      formData.append(
        "name",
        name
      );

      formData.append(
        "description",
        description
      );

      /*
       * Video tanlangan bo'lsa,
       * backenddagi field nomi `file`.
       */

      if (newLesson.file) {
        formData.append(
          "file",
          newLesson.file
        );
      }

      console.log(
        "CREATE LESSON FORM DATA:"
      );

      console.log(
        "sectionId:",
        Number(sectionId)
      );

      console.log(
        "name:",
        name
      );

      console.log(
        "description:",
        description
      );

      console.log(
        "file:",
        newLesson.file
          ? newLesson.file.name
          : "VIDEO TANLANMAGAN"
      );

      const response =
        await baseAPI.post(
          "/lessons",
          formData
        );

      console.log(
        "CREATE LESSON RESPONSE:",
        response.data
      );

      /*
       * Modalni yopamiz
       */

      setIsAddModalOpen(false);

      resetForm();

      /*
       * Yangi lessonlarni qayta olamiz
       */

      await fetchLessons();
    } catch (error: any) {
      console.error(
        "CREATE LESSON ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "DATA:",
        error?.response?.data
      );

      console.error(
        "URL:",
        error?.config?.url
      );

      console.error(
        "METHOD:",
        error?.config?.method
      );

      setApiError(
        error?.response?.data?.message ||
          "Dars qo'shishda xatolik yuz berdi"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     UPDATE LESSON
  ========================================================= */

  const handleEditLesson = async () => {
    if (!editingLesson) {
      return;
    }

    const name =
      editingLesson.name.trim();

    const description =
      editingLesson.description.trim();

    if (!name) {
      setNameError(true);
      return;
    }

    try {
      setSaving(true);
      setApiError("");

      /*
       * EDIT ham FormData.
       *
       * Backend:
       * sectionId
       * name
       * description
       * file
       */

      const formData = new FormData();

      formData.append(
        "sectionId",
        String(Number(sectionId))
      );

      formData.append(
        "name",
        name
      );

      formData.append(
        "description",
        description
      );

      /*
       * Agar yangi video tanlangan bo'lsa,
       * file yuboramiz.
       *
       * Eski video o'z holicha qoladi.
       */

      if (
        editingLesson.file &&
        editingLesson.file.startsWith(
          "blob:"
        )
      ) {
        /*
         * blob URL bo'lsa bu yangi browser
         * file emas.
         *
         * Shu sababli bu yerda avtomatik
         * yubormaymiz.
         */
      }

      console.log(
        "UPDATE LESSON:",
        {
          id: editingLesson.id,
          sectionId,
          name,
          description,
        }
      );

      const response =
        await baseAPI.patch(
          `/lessons/${editingLesson.id}`,
          formData
        );

      console.log(
        "UPDATE LESSON RESPONSE:",
        response.data
      );

      setIsEditModalOpen(false);

      resetForm();

      await fetchLessons();
    } catch (error: any) {
      console.error(
        "UPDATE LESSON ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "DATA:",
        error?.response?.data
      );

      setApiError(
        error?.response?.data?.message ||
          "Darsni tahrirlashda xatolik yuz berdi"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE LESSON
  ========================================================= */

  const handleDeleteLesson = async () => {
    if (
      deletingLessonId === null
    ) {
      return;
    }

    try {
      setDeleting(true);
      setApiError("");

      console.log(
        "DELETE LESSON ID:",
        deletingLessonId
      );

      /*
       * DELETE endpoint:
       *
       * DELETE /lessons/:id
       */

      const response =
        await baseAPI.delete(
          `/lessons/${deletingLessonId}`
        );

      console.log(
        "DELETE LESSON RESPONSE:",
        response.data
      );

      /*
       * Eng muhim qism:
       * serverdan javob kelgandan keyin
       * local listdan ham o'chiramiz.
       */

      setLessons((prev) =>
        prev.filter(
          (lesson) =>
            Number(lesson.id) !==
            Number(deletingLessonId)
        )
      );

      setIsDeleteModalOpen(false);

      setDeletingLessonId(null);

      /*
       * Backenddagi ro'yxatni ham yangilaymiz.
       */

      await fetchLessons();
    } catch (error: any) {
      console.error(
        "DELETE LESSON ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      console.error(
        "DELETE STATUS:",
        error?.response?.status
      );

      console.error(
        "DELETE URL:",
        error?.config?.url
      );

      console.error(
        "DELETE METHOD:",
        error?.config?.method
      );

      setApiError(
        error?.response?.data?.message ||
          "Darsni o'chirishda xatolik yuz berdi"
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     OPEN DELETE MODAL
  ========================================================= */

  const openDeleteModal = (
    lessonId: number
  ) => {
    setDeletingLessonId(
      lessonId
    );

    setApiError("");

    setIsDeleteModalOpen(true);
  };

  /* =========================================================
     CLOSE DELETE MODAL
  ========================================================= */

  const closeDeleteModal = () => {
    if (deleting) return;

    setIsDeleteModalOpen(false);

    setDeletingLessonId(null);

    setApiError("");
  };

  /* =========================================================
     FILE SELECT
  ========================================================= */

  const validateVideoFile = (
    file: File
  ) => {
    if (
      !file.type.startsWith(
        "video/"
      )
    ) {
      alert(
        "Faqat video fayl yuklang"
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     HANDLE FILE UPLOAD
  ========================================================= */

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !validateVideoFile(file)
    ) {
      e.target.value = "";
      return;
    }

    setNewLesson((prev) => ({
      ...prev,
      file,
    }));
  };

  /* =========================================================
     HANDLE DROP
  ========================================================= */

  const handleFileDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    const file =
      e.dataTransfer.files?.[0];

    if (!file) return;

    if (
      !validateVideoFile(file)
    ) {
      return;
    }

    setNewLesson((prev) => ({
      ...prev,
      file,
    }));
  };

  /* =========================================================
     REMOVE SELECTED FILE
  ========================================================= */

  const removeSelectedFile = () => {
    setNewLesson((prev) => ({
      ...prev,
      file: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     VIDEO URL
  ========================================================= */

  const getVideoUrl = (
    file: string | null
  ) => {
    if (!file) {
      return "";
    }

    if (
      file.startsWith("http://") ||
      file.startsWith("https://")
    ) {
      return file;
    }

    if (
      file.startsWith("/")
    ) {
      return `http://63.180.181.4:8080${file}`;
    }

    return `http://63.180.181.4:8080/${file}`;
  };

  /* =========================================================
     DOWNLOAD CSV
  ========================================================= */

  const handleDownloadXLS = () => {
    const headers = [
      "ID",
      "Biriktirilgan kurs",
      "Bo'lim",
      "Dars mavzusi",
      "Dars haqida",
    ];

    const rows =
      lessons.map((lesson) =>
        [
          lesson.id,
          courseTitle,
          section?.name || "",
          lesson.name,
          lesson.description,
        ]
          .map(
            (item) =>
              `"${String(item).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      );

    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows,
      ].join("\n");

    const blob =
      new Blob(
        [csvContent],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "darslar.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    Math.min(
      startIndex +
        itemsPerPage,
      lessons.length
    );

  const paginatedLessons =
    lessons.slice(
      startIndex,
      endIndex
    );

  const totalPages =
    Math.ceil(
      lessons.length /
        itemsPerPage
    ) || 1;

  /* =========================================================
     MODAL CONTENT
  ========================================================= */

  const renderModalContent = (
    isEdit: boolean
  ) => {
    const editLesson =
      isEdit
        ? editingLesson
        : null;

    const name = isEdit
      ? editLesson?.name || ""
      : newLesson.name;

    const description =
      isEdit
        ? editLesson?.description ||
          ""
        : newLesson.description;

    return (
      <div className="p-6 space-y-5">

        {/* SECTION */}

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Bo&apos;lim nomi
          </label>

          <input
            type="text"
            disabled
            value={
              section?.name ||
              "Bo'lim topilmadi"
            }
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-[14px] cursor-not-allowed"
          />
        </div>

        {/* LESSON NAME */}

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Dars nomi{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            type="text"
            placeholder="Masalan: React bilan ishlash"
            value={name}
            onChange={(e) => {
              setNameError(false);

              if (isEdit) {
                setEditingLesson(
                  (prev) =>
                    prev
                      ? {
                          ...prev,
                          name:
                            e.target
                              .value,
                        }
                      : prev
                );
              } else {
                setNewLesson(
                  (prev) => ({
                    ...prev,
                    name:
                      e.target
                        .value,
                  })
                );
              }
            }}
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px] ${
              nameError
                ? "border-red-500 bg-red-50"
                : "border-gray-200"
            }`}
          />

          {nameError && (
            <p className="text-red-500 text-[12px] mt-1.5">
              Dars nomi kiritilishi shart
            </p>
          )}
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Dars haqida
          </label>

          <textarea
            rows={4}
            placeholder="Dars haqida ma'lumot"
            value={description}
            onChange={(e) => {
              if (isEdit) {
                setEditingLesson(
                  (prev) =>
                    prev
                      ? {
                          ...prev,
                          description:
                            e.target
                              .value,
                        }
                      : prev
                );
              } else {
                setNewLesson(
                  (prev) => ({
                    ...prev,
                    description:
                      e.target
                        .value,
                  })
                );
              }
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px] resize-none"
          />
        </div>

        {/* VIDEO */}

        {!isEdit && (
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Video fayl
            </label>

            {!newLesson.file ? (
              <div
                className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={(e) =>
                  e.preventDefault()
                }
                onDrop={
                  handleFileDrop
                }
              >
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                  <UploadCloud
                    size={20}
                    className="text-gray-500"
                  />
                </div>

                <p className="text-[14px] text-gray-600 text-center">
                  <span className="text-blue-600 font-medium">
                    Bu yerga bosing
                  </span>{" "}
                  yoki faylni suring
                </p>

                <p className="text-[12px] text-gray-400 mt-1">
                  MP4 yoki MOV
                </p>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="video/mp4,video/quicktime,video/*"
                  onChange={
                    handleFileUpload
                  }
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <FileVideo
                    size={20}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 truncate">
                    {
                      newLesson
                        .file
                        .name
                    }
                  </p>

                  <p className="text-[12px] text-gray-500">
                    Video tanlangan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    removeSelectedFile
                  }
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* EDIT OLD VIDEO */}

        {isEdit &&
          editingLesson?.file && (
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Hozirgi video
              </label>

              <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <FileVideo
                    size={20}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700 truncate">
                    {
                      editingLesson.file
                    }
                  </p>

                  <p className="text-[12px] text-gray-400">
                    Saqlangan video
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* API ERROR */}

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-[13px]">
            {apiError}
          </div>
        )}

        {/* BUTTON */}

        <div className="flex justify-end gap-3 pt-2">

          <button
            type="button"
            disabled={saving}
            onClick={
              closeAddEditModal
            }
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={
              isEdit
                ? handleEditLesson
                : handleAddLesson
            }
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-medium flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Check size={17} />
                Saqlash
              </>
            )}
          </button>

        </div>
      </div>
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col h-full bg-transparent">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-[22px] font-bold text-gray-900 mb-2">
              Darslar
            </h1>

            {/* BREADCRUMB */}

            <div className="flex items-center flex-wrap text-[13px] font-medium gap-2">

              {/* 1. KURSLAR */}

              <Link
                href="/dashboard/courses/allCourses"
                className="text-gray-500 hover:text-blue-600"
              >
                Kurslar
              </Link>

              <span className="w-1 h-1 rounded-full bg-gray-300" />

              {/* 2. TANLANGAN KURS */}

              <Link
                href={`/dashboard/courses/allCourses/${courseId}/sections`}
                className="text-gray-500 hover:text-blue-600"
              >
                {courseTitle}
              </Link>

              <span className="w-1 h-1 rounded-full bg-gray-300" />

              {/* 3. BO'LIMLAR */}

              <Link
                href={`/dashboard/courses/allCourses/${courseId}/sections`}
                className="text-gray-500 hover:text-blue-600"
              >
                Bo&apos;limlar
              </Link>

              <span className="w-1 h-1 rounded-full bg-gray-300" />

              {/* 4. DARS */}

              <span className="text-gray-900">
                {section?.name ||
                  "Darslar"}
              </span>

            </div>
          </div>

          {/* ADD */}

          <button
            onClick={
              openAddModal
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Dars qo&apos;shish
          </button>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {apiError &&
          !isAddModalOpen &&
          !isEditModalOpen &&
          !isDeleteModalOpen && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {apiError}
            </div>
          )}

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="flex-1 flex flex-col">

          <div className="overflow-x-auto rounded-t-xl overflow-hidden border border-gray-200">

            <table className="w-full text-left border-collapse min-w-[1000px] bg-white">

              <thead className="bg-gray-50">

                <tr className="text-[13px] text-gray-900 font-bold">

                  <th className="px-6 py-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      Biriktirilgan kurs
                      <Filter
                        size={14}
                        className="text-gray-400"
                      />
                    </div>
                  </th>

                  <th className="px-6 py-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      Dars mavzusi
                      <Filter
                        size={14}
                        className="text-gray-400"
                      />
                    </div>
                  </th>

                  <th className="px-6 py-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      Dars haqida
                      <Filter
                        size={14}
                        className="text-gray-400"
                      />
                    </div>
                  </th>

                  <th className="px-6 py-4 border border-gray-200">
                    Dars video fayli
                  </th>

                  <th className="px-6 py-4 border border-gray-200">
                    Materiallar
                  </th>

                  <th className="px-6 py-4 text-center border border-gray-200">
                    Amallar
                  </th>

                </tr>

              </thead>

              <tbody className="text-[14px] text-gray-800">

                {/* LOADING */}

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Darslar yuklanmoqda...
                      </div>
                    </td>
                  </tr>
                ) : paginatedLessons.length >
                  0 ? (

                  /* LESSONS */

                  paginatedLessons.map(
                    (lesson) => (
                      <tr
                        key={
                          lesson.id
                        }
                        className="hover:bg-blue-50/30 transition-colors"
                      >

                        {/* COURSE */}

                        <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">

                          <Link
                            href={`/dashboard/courses/allCourses/${courseId}/sections/${sectionId}/lessons/${lesson.id}/materials`}
                            className="hover:text-blue-600"
                          >
                            {
                              courseTitle
                            }
                          </Link>

                        </td>

                        {/* NAME */}

                        <td className="px-6 py-4 border border-gray-200">

                          <Link
                            href={`/dashboard/courses/allCourses/${courseId}/sections/${sectionId}/lessons/${lesson.id}/materials`}
                            className="hover:text-blue-600"
                          >
                            {
                              lesson.name
                            }
                          </Link>

                        </td>

                        {/* DESCRIPTION */}

                        <td className="px-6 py-4 border border-gray-200 text-gray-600 text-[13px]">
                          {
                            lesson.description ||
                            "-"
                          }
                        </td>

                        {/* VIDEO */}

                        <td className="px-6 py-4 border border-gray-200">

                          {lesson.file ? (
                            <button
                              onClick={() => {
                                const url =
                                  getVideoUrl(
                                    lesson.file
                                  );

                                setPlayingVideoUrl(
                                  url
                                );

                                setIsPlayingVideo(
                                  true
                                );
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-[13px] font-medium"
                            >
                              <Play
                                size={
                                  14
                                }
                                className="fill-blue-600"
                              />
                              Video
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[13px] italic">
                              Yuklanmagan
                            </span>
                          )}

                        </td>

                        {/* MATERIAL */}

                        <td className="px-6 py-4 border border-gray-200">

                          <Link
                            href={`/dashboard/courses/allCourses/${courseId}/sections/${sectionId}/lessons/${lesson.id}/materials`}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[13px] font-medium inline-block"
                          >
                            Biriktirish
                          </Link>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4 text-center border border-gray-200">

                          <div className="flex items-center justify-center gap-3">

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  lesson
                                )
                              }
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Tahrirlash"
                            >
                              <Pen
                                size={
                                  16
                                }
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(
                                  lesson.id
                                )
                              }
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="O'chirish"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                ) : (

                  /* EMPTY */

                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Bu bo&apos;limda
                      darslar mavjud
                      emas
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl px-2 py-1 shadow-sm">

            <Pagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              totalItems={
                lessons.length
              }
              startIndex={
                lessons.length ===
                0
                  ? 0
                  : startIndex + 1
              }
              endIndex={
                endIndex
              }
              itemsPerPage={
                itemsPerPage
              }
              onPageChange={
                setCurrentPage
              }
              onItemsPerPageChange={(
                limit
              ) => {
                setItemsPerPage(
                  limit
                );
                setCurrentPage(
                  1
                );
              }}
              onDownloadXLS={
                handleDownloadXLS
              }
            />

          </div>

        </div>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {(isAddModalOpen ||
        isEditModalOpen) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={
            closeAddEditModal
          }
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

              <h2 className="text-xl font-bold text-gray-900">
                Dars{" "}
                {isEditModalOpen
                  ? "tahrirlash"
                  : "qo'shish"}
              </h2>

              <button
                type="button"
                onClick={
                  closeAddEditModal
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

            </div>

            {renderModalContent(
              isEditModalOpen
            )}

          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={
            closeDeleteModal
          }
        >

          <div
            className="bg-white rounded-3xl shadow-xl w-full max-w-[400px] p-8 text-center"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">

              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                ?
              </div>

            </div>

            <h2 className="text-[22px] font-bold text-gray-900 mb-8">
              Rostdan ham
              o&apos;chirmoqchimisiz?
            </h2>

            {apiError && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {apiError}
              </div>
            )}

            <div className="flex gap-4">

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  closeDeleteModal
                }
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 flex-1"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  handleDeleteLesson
                }
                className="px-6 py-2.5 bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium hover:bg-red-700 flex-1 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    O&apos;chirilmoqda
                  </>
                ) : (
                  "O'chirish"
                )}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          VIDEO PLAYER
      ===================================================== */}

      {isPlayingVideo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() =>
            setIsPlayingVideo(
              false
            )
          }
        >

          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                setIsPlayingVideo(
                  false
                )
              }
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full"
            >
              <X size={18} />
            </button>

            {playingVideoUrl && (
              <video
                className="w-full aspect-video object-contain"
                controls
                autoPlay
                src={
                  playingVideoUrl
                }
              />
            )}

          </div>

        </div>
      )}
    </>
  );
}