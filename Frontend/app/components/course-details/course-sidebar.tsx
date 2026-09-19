"use client";

import Image from "next/image";
import { PrecisionStars } from "./precision-stars";
import { useLanguage } from "@/app/context/LanguageContext";
import { register } from "module";
import Link from "next/link";

interface CourseSidebarProps {
  id: number;
  price: number;
  title: string;
  cover?: string;
  coverImg?: string;
  introVideo?: string;
}

export function CourseSidebar({
  id,
  price,
  title,
  cover,
  coverImg,
}: CourseSidebarProps) {
  const { t } = useLanguage();
  const formattedPrice = new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#151C28] p-6 rounded-2xl space-y-4 border border-transparent dark:border-[#1E293B] transition-colors duration-200">
        <div
          className={`aspect-video rounded-xl relative overflow-hidden flex items-center justify-center ${cover || "bg-gray-100 dark:bg-[#0F172A]"}`}
        >
          {coverImg ? (
            <Image
              src={coverImg}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 350px"
              priority={true}
            />
          ) : !cover ? (
            <span className="text-xs text-gray-400 dark:text-gray-500">{t("courseDetail.noImage")}</span>
          ) : null}
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formattedPrice} UZS
          </div>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] leading-relaxed">
            {t("courseDetail.courseDesc")}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <PrecisionStars rating={4.5} stars={5} />
        </div>

        <Link href={`/register?courseId=${id}`}>
          <button className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors text-sm">
            {t("courseDetail.buyButton")}
          </button>
        </Link>
      </div>

      <div className="bg-white dark:bg-[#151C28] p-4 rounded-2xl flex flex-col gap-4 border border-transparent dark:border-[#1E293B] transition-colors duration-200">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-[#1E293B] rounded-full shrink-0 relative overflow-hidden">
            <div className="w-full h-full bg-slate-300 dark:bg-[#2A3547] flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
              OS
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              Oybek Safarov
            </h4>
            <p className="text-xs text-gray-400 dark:text-[#94A3B8]">
              Front-end Developer, Designer
            </p>
            <div className="flex items-center gap-1 pt-0.5">
              <PrecisionStars rating={4.6} stars={1} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-3">
          <div>
            <div className="font-bold text-gray-800 dark:text-white text-sm">100</div>
            <div className="text-[10px] text-gray-400 dark:text-[#94A3B8]">{t("courseDetail.studentsLabel")}</div>
          </div>
          <div className="border-x border-gray-100 dark:border-[#1E293B] px-2">
            <div className="font-bold text-gray-800 dark:text-white text-sm">2</div>
            <div className="text-[10px] text-gray-400 dark:text-[#94A3B8]">{t("courseDetail.coursesLabel")}</div>
          </div>
          <div>
            <div className="font-bold text-gray-800 dark:text-white text-sm">245</div>
            <div className="text-[10px] text-gray-400 dark:text-[#94A3B8]">{t("courseDetail.viewsCount")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
