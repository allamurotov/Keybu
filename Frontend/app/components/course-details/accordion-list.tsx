"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lock, LockOpen } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export interface Lesson {
  id: number | string;
  title: string;
  description?: string;
  duration?: string;
  isFree?: boolean;
}

export interface Section {
  id: number | string;
  name: string;
  lessons?: Lesson[];
}

interface AccordionListProps {
  courseId?: string;
  sections?: Section[];
}

export function AccordionList({ sections = [] }: AccordionListProps) {
  const { t } = useLanguage();
  const [openModuleId, setOpenModuleId] = useState<string | number | null>(null);

  const toggleModule = (id: string | number) => {
    setOpenModuleId(openModuleId === id ? null : id);
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 italic text-center">
        {t("courseDetail.noLessons") || "Ma'lumot topilmadi"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((module) => {
        const isOpen = openModuleId === module.id;

        return (
          <div
            key={module.id}
            className="border-b border-gray-100 dark:border-[#1E293B] overflow-hidden"
          >
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <span className="font-semibold text-gray-800 dark:text-white text-sm">
                  {module.name}
                </span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-50 dark:divide-[#1E293B] bg-white dark:bg-[#0F172A]">
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 text-sm text-black dark:text-slate-200 hover:bg-gray-50/50 dark:hover:bg-[#1E293B]/50 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {lesson.isFree ? (
                          <div className="w-8 h-8 bg-[#F7F7F8] dark:bg-[#1E293B] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <LockOpen size={16} className="text-black dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-[#F7F7F8] dark:bg-[#1E293B] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Lock size={16} className="text-black dark:text-gray-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{lesson.title}</span>
                          {lesson.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {lesson.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-black dark:text-gray-400 whitespace-nowrap ml-4">
                        {lesson.duration || "-"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-xs text-black dark:text-gray-400 italic">
                    {t("courseDetail.noLessons") || "В этом модуле пока нет уроков"}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
