"use client";

import { useState } from "react";

type LessonStatus = "completed" | "current" | "upcoming";

type Lesson = {
  id: string;
  title: string;
  duration: string;
  status: LessonStatus;
};

export type ModuleItem = {
  id: string | number;
  title: string;
  duration?: string;
  lessons?: Lesson[];
};
export default function CourseSidebar({
  courseTitle = "Darslik",
  modules = [],
  activeLessonId,
  onLessonChange,
}: {
  courseTitle?: string;
  modules?: ModuleItem[];
  activeLessonId?: string | number;
  onLessonChange?: (lessonId: string | number) => void;
}) {
  const [openModuleId, setOpenModuleId] = useState<string | number>(modules[0]?.id || "");

  const handleLessonClick = (lessonId: string | number, title?: string) => {
    if (onLessonChange) {
      onLessonChange(lessonId);
    }
  };

  return (
    <aside className="w-[320px] shrink-0 bg-white rounded-xl border border-gray-200 h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-1">{courseTitle}</h2>
        <p className="text-sm text-[#64748B]">30 daqiqa</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {modules.map((mod) => {
            const isOpen = openModuleId === mod.id;
            return (
              <div key={mod.id} className="border-b border-gray-100">
                <button
                  onClick={() => setOpenModuleId(isOpen ? "" : mod.id)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-[#1a1a1a] truncate">{mod.title}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{mod.duration}</p>
                    </div>
                  </div>
                  <svg
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="#94A3B8" strokeWidth="2"
                    className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                {isOpen && (
                  mod.lessons ? (
                    <div className="flex flex-col">
                      {mod.lessons.map((lesson) => {
                        const isActive = lesson.id === activeLessonId;
                        return (
                          <button
                            key={lesson.id}
                            aria-current={isActive ? "true" : undefined}
                            onClick={() => handleLessonClick(lesson.id, lesson.title)}
                            className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-all border-b border-gray-100 last:border-b-0 ${
                              isActive ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                lesson.status === "completed" ? "bg-green-100"
                                : lesson.status === "current" ? "bg-red-500"
                                : "bg-gray-100"
                              }`}>
                                {lesson.status === "completed" ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24"
                                    fill={lesson.status === "current" ? "white" : "#94A3B8"}>
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium truncate ${
                                  isActive ? "text-[#4F7FFF]" : "text-[#1a1a1a]"
                                }`}>
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-[#94A3B8]">{lesson.duration}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" className="mx-auto mb-3">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      <p className="text-sm text-[#94A3B8] font-medium">Darslik mavjud emas</p>
                      <p className="text-xs text-[#CBD5E1] mt-1">Tez orada qo&apos;shiladi</p>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
