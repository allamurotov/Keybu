"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../../../context/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Komponent brauzerga yuklangandan so’ng mounted state-ni true qilamiz
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="cta-section"
      className="relative overflow-hidden text-white bg-blue-600 dark:bg-blue-900 py-[132px] transition-colors duration-200"
    >
      <div className="container relative">

        {/* ── Yer xaritasi ───────────────────── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1280 320"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="dot" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="rgba(255,255,255,0.18)" />
            </pattern>
          </defs>
          <polygon points="62,26 118,20 155,25 175,42 200,46 216,72 210,106 200,136 182,162 164,182 145,186 125,174 106,164 88,142 70,118 62,88 58,56" fill="url(#dot)" />
          <polygon points="250,6 305,5 332,12 342,30 330,50 306,56 278,50 253,36 248,20" fill="url(#dot)" />
          <polygon points="134,196 165,190 193,196 210,222 216,258 206,300 193,328 173,338 155,328 140,300 130,258 128,226" fill="url(#dot)" />
          <polygon points="466,36 484,32 494,46 486,64 474,68 462,56" fill="url(#dot)" />
          <polygon points="488,36 540,30 572,34 584,50 580,70 568,90 554,100 534,104 516,100 498,90 480,82 476,68 482,50" fill="url(#dot)" />
          <polygon points="480,100 534,90 580,96 606,114 622,148 626,188 620,232 606,276 585,314 562,332 540,336 516,324 498,296 482,250 468,208 466,158 472,124" fill="url(#dot)" />
          <polygon points="576,16 644,10 718,8 792,10 864,14 936,16 998,24 1020,38 1010,56 978,68 928,74 874,76 820,72 772,80 724,72 682,68 652,62 624,58 590,50 572,44 570,28" fill="url(#dot)" />
          <polygon points="574,84 625,76 660,84 676,104 672,130 658,148 632,156 608,150 585,138 572,120 568,100" fill="url(#dot)" />
          <polygon points="676,82 748,76 786,82 800,102 804,128 790,154 776,176 756,192 736,194 716,182 698,164 682,142 673,116 672,96" fill="url(#dot)" />
          <polygon points="800,34 866,30 930,34 970,50 984,70 978,94 959,112 936,126 900,132 862,126 830,116 806,100 793,78 794,54" fill="url(#dot)" />
          <polygon points="984,56 1004,50 1018,62 1022,80 1010,94 994,91 982,78" fill="url(#dot)" />
          <polygon points="854,128 906,122 944,130 960,150 954,172 932,182 900,178 868,167 848,150" fill="url(#dot)" />
          <polygon points="906,234 964,224 1012,228 1043,244 1058,270 1048,304 1026,326 995,334 962,328 930,310 910,284 899,258" fill="url(#dot)" />
          <polygon points="1054,298 1066,288 1076,300 1073,318 1063,323 1052,312" fill="url(#dot)" />
          <polygon points="624,218 636,208 646,218 646,244 636,258 622,249 618,232" fill="url(#dot)" />
        </svg>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center relative z-10 gap-6">
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-[48px] leading-tight lg:leading-[60px] tracking-normal text-white m-0">
            {mounted ? t("cta.title") : "Istalgan nuqtadan onlayn o’qish imkoniyati"}
          </h2>

          <p className="font-medium text-lg sm:text-[20px] leading-relaxed lg:leading-[30px] tracking-normal text-white/90 m-0">
            {mounted ? t("cta.subtitle") : "Biz sizga bu imkoniyatni taqdim qilamiz"}
          </p>

          <a
            href="#register"
            className="inline-flex items-center justify-center bg-white text-[#1C232C] hover:bg-slate-100 py-3.5 px-6 rounded-lg font-medium text-[15px] leading-none no-underline cursor-pointer transition-colors whitespace-nowrap shadow-md"
          >
            {mounted ? t("cta.registerBtn") : "Ro’yxatdan o’tish"}
          </a>
        </div>
      </div>
    </section>
  );
}