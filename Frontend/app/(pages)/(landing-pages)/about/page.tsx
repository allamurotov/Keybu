"use client";

import photo1 from "@/app/assets/Rectangle 1508.png";
import photo2 from "@/app/assets/Rectangle 1509.png";
import photo3 from "@/app/assets/Rectangle 1510.png";
import photo4 from "@/app/assets/Rectangle 1511.png";
import photo5 from "@/app/assets/Rectangle 1512.png";
import photo6 from "@/app/assets/Rectangle 1516.png";
import photo7 from "@/app/assets/Rectangle 1517.png";
import Mentors from "../../../components/landing/home/Mentors";
import { useLanguage } from "@/app/context/LanguageContext";

export default function AboutUs() {
  const { t } = useLanguage();

  return (
    <div className="w-full font-sans py-12 md:py-16 bg-white dark:bg-[#0A0E17] transition-colors duration-200">
      {/* Ichki chegaralangan container (max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Biz haqimizda section */}
        <section className="mb-16">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {t("aboutPage.heading")}
          </h1>
          <div className="text-gray-600 dark:text-[#94A3B8] space-y-4 text-sm md:text-base leading-relaxed w-full">
            <p>{t("aboutPage.aboutText1")}</p>
            <p>{t("aboutPage.aboutText2")}</p>
            <p>{t("aboutPage.aboutText3")}</p>
          </div>
        </section>

        {/* Media galereya section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("aboutPage.mediaGallery")}
          </h2>

          <div className="flex flex-col gap-4">
            {/* Top row - 3 images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-[#151C28]">
                <img
                  src={photo1.src}
                  alt="Media 1"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-[#151C28]">
                <img
                  src={photo2.src}
                  alt="Media 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-[#151C28]">
                <img
                  src={photo3.src}
                  alt="Media 3"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            {/* Bottom row - 2 images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden bg-gray-100 dark:bg-[#151C28]">
                <img
                  src={photo4.src}
                  alt="Media 4"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden bg-gray-100 dark:bg-[#151C28]">
                <img
                  src={photo5.src}
                  alt="Media 5"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-10 flex items-center justify-between border-t border-gray-200 dark:border-[#1E293B] pt-4 max-w-lg mx-auto">
            <button className="text-sm text-gray-400 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              <span aria-hidden="true">&larr;</span> {t("aboutPage.paginationPrev")}
            </button>
            <div className="hidden sm:flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-500 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-500 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 transition-colors">
                3
              </button>
              <span className="text-gray-400 dark:text-[#94A3B8] px-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-500 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors">
                9
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-500 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors">
                10
              </button>
            </div>
            <button className="text-sm text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              {t("aboutPage.paginationNext")} <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </section>

        {/* Sertifikat va guvohnomalar section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("aboutPage.certificates")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Certificate 1 (Portrait) */}
            <div className="aspect-[3/4] bg-white dark:bg-[#151C28] border border-gray-200 dark:border-[#1E293B] p-2 shadow-sm flex items-center justify-center rounded-lg overflow-hidden group">
              <img
                src={photo7.src}
                alt="Sertifikat 1"
                className="w-full h-full object-cover rounded shadow-sm group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Certificate 2 (Portrait) */}
            <div className="aspect-[3/4] bg-white dark:bg-[#151C28] border border-gray-200 dark:border-[#1E293B] p-2 shadow-sm flex items-center justify-center rounded-lg overflow-hidden group">
              <img
                src={photo7.src}
                alt="Sertifikat 2"
                className="w-full h-full object-cover rounded shadow-sm group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Certificates 3 & 4 (Landscape Stacked) */}
            <div className="flex flex-col gap-6 h-full justify-between">
              <div className="h-[calc(50%-0.75rem)] bg-white dark:bg-[#151C28] border border-gray-200 dark:border-[#1E293B] p-2 shadow-sm flex items-center justify-center rounded-lg overflow-hidden group">
                <img
                  src={photo6.src}
                  alt="Sertifikat 3"
                  className="w-full h-full object-cover rounded shadow-sm group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-[calc(50%-0.75rem)] bg-white dark:bg-[#151C28] border border-gray-200 dark:border-[#1E293B] p-2 shadow-sm flex items-center justify-center rounded-lg overflow-hidden group">
                <img
                  src={photo6.src}
                  alt="Sertifikat 4"
                  className="w-full h-full object-cover rounded shadow-sm group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Tajribali Mentorlar section — Container'dan TASHQARIDA (Full Screen Width) */}
      <div className="w-full">
        <Mentors />
      </div>
    </div>
  );
}
