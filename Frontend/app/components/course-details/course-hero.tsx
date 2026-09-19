"use client";

import { useState } from "react";
import { Clock, Users, BarChart, Play, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface CourseHeroProps {
  title: string;
  description: string;
  duration: string;
  studentsCount: number;
  level: string;
  category?: string;
  updatedAt?: string;
  introVideo?: string;
}

export function CourseHero({
  title,
  description,
  duration,
  studentsCount,
  level,
  category,
  updatedAt,
  introVideo,
}: CourseHeroProps) {
  const { t } = useLanguage();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <div className="bg-blue-600 dark:bg-blue-900 text-white pt-16 pb-24 px-4 md:px-8 transition-colors duration-200">
        <div className="container relative">
          <svg
            className="absolute -inset-12 pointer-events-none"
            viewBox="0 0 1280 320"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="dot"
                x="0"
                y="0"
                width="14"
                height="14"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="2"
                  y="2"
                  width="5"
                  height="5"
                  rx="1"
                  fill="rgba(255,255,255,0.18)"
                />
              </pattern>
            </defs>
            <polygon
              points="62,26 118,20 155,25 175,42 200,46 216,72 210,106 200,136 182,162 164,182 145,186 125,174 106,164 88,142 70,118 62,88 58,56"
              fill="url(#dot)"
            />
            <polygon
              points="250,6 305,5 332,12 342,30 330,50 306,56 278,50 253,36 248,20"
              fill="url(#dot)"
            />
            <polygon
              points="134,196 165,190 193,196 210,222 216,258 206,300 193,328 173,338 155,328 140,300 130,258 128,226"
              fill="url(#dot)"
            />
            <polygon
              points="466,36 484,32 494,46 486,64 474,68 462,56"
              fill="url(#dot)"
            />
            <polygon
              points="488,36 540,30 572,34 584,50 580,70 568,90 554,100 534,104 516,100 498,90 480,82 476,68 482,50"
              fill="url(#dot)"
            />
            <polygon
              points="480,100 534,90 580,96 606,114 622,148 626,188 620,232 606,276 585,314 562,332 540,336 516,324 498,296 482,250 468,208 466,158 472,124"
              fill="url(#dot)"
            />
            <polygon
              points="576,16 644,10 718,8 792,10 864,14 936,16 998,24 1020,38 1010,56 978,68 928,74 874,76 820,72 772,80 724,72 682,68 652,62 624,58 590,50 572,44 570,28"
              fill="url(#dot)"
            />
            <polygon
              points="574,84 625,76 660,84 676,104 672,130 658,148 632,156 608,150 585,138 572,120 568,100"
              fill="url(#dot)"
            />
            <polygon
              points="676,82 748,76 786,82 800,102 804,128 790,154 776,176 756,192 736,194 716,182 698,164 682,142 673,116 672,96"
              fill="url(#dot)"
            />
            <polygon
              points="800,34 866,30 930,34 970,50 984,70 978,94 959,112 936,126 900,132 862,126 830,116 806,100 793,78 794,54"
              fill="url(#dot)"
            />
            <polygon
              points="984,56 1004,50 1018,62 1022,80 1010,94 994,91 982,78"
              fill="url(#dot)"
            />
            <polygon
              points="854,128 906,122 944,130 960,150 954,172 932,182 900,178 868,167 848,150"
              fill="url(#dot)"
            />
            <polygon
              points="906,234 964,224 1012,228 1043,244 1058,270 1048,304 1026,326 995,334 962,328 930,310 910,284 899,258"
              fill="url(#dot)"
            />
            <polygon
              points="1054,298 1066,288 1076,300 1073,318 1063,323 1052,312"
              fill="url(#dot)"
            />
            <polygon
              points="624,218 636,208 646,218 646,244 636,258 622,249 618,232"
              fill="url(#dot)"
            />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              {category && (
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                  {category}
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {title}
            </h1>
            <p className="text-lg opacity-90 leading-relaxed max-w-2xl">
              {description}
            </p>

            <div className="flex flex-wrap gap-6 pt-2 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {studentsCount} {t("courseDetail.viewsLabel")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                <span>
                  {t("courseDetail.levelLabel")} {level}
                </span>
              </div>
              {updatedAt && (
                <div className="flex items-center gap-2">
                  <span>
                    {t("courseDetail.updatedAt") || "Oxirgi yangilanish:"}{" "}
                    {new Date(updatedAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              )}
            </div>

            {introVideo && (
              <div className="pt-6">
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="flex items-center gap-4 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all cursor-pointer backdrop-blur-md group w-full max-w-md"
                >
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                    <Play size={20} className="ml-1 fill-current" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-white">
                      Kirish videosi (Intro)
                    </div>
                    <div className="text-sm text-blue-100 opacity-90 mt-0.5">
                      Kurs haqida qisqacha ma&apos;lumotni ko&apos;rish
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isVideoOpen && introVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="aspect-video w-full">
              <video
                src={introVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
