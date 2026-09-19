"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../../context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full overflow-hidden min-h-[660px] flex items-center bg-gradient-to-r from-[#EAF2FF] via-[#F8FAFC] to-[#FFF3EB] dark:from-[#0A0E17] dark:via-[#0D1220] dark:to-[#0A0E17] py-12 lg:py-0 transition-colors duration-200">
      {/* Dark mode decorative glow */}
      <div className="hidden dark:block absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Left column */}
          <div className="space-y-6 text-left max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
              <span
                style={{
                  background: "linear-gradient(92.51deg, #615DFF -2.3%, #FF1111 38.2%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                className="inline-block"
              >
                {t("hero.title_gradient")}
              </span>{" "}
              <span className="text-slate-900 dark:text-white">{t("hero.title_part1")}</span>
              <br />
              <span className="text-slate-900 dark:text-white">{t("hero.title_part2")}</span>
            </h1>

            <p className="text-[#64748B] dark:text-[#94A3B8] text-base lg:text-[16px] font-normal leading-relaxed max-w-lg">
              {t("hero.subtitle")}
            </p>

            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm lg:text-base shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                {t("hero.button")}
              </Link>
            </div>
          </div>

          {/* Right column: Hero Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[580px]">
              <Image
                src="/hero_purple.png"
                alt="IT Live Academy Hero Illustration"
                width={600}
                height={450}
                priority
                className="w-full h-auto object-contain dark:drop-shadow-[0_0_40px_rgba(59,130,246,0.15)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
