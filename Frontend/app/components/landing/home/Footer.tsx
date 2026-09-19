"use client";

import Link from "next/link";
import FinalCTA from "./FinalCTA";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-white dark:bg-[#0A0E17] transition-colors duration-200">
      {/* ── Final CTA section included inside Footer ──────────────────────── */}
      <FinalCTA />

      {/* ── Footer Bottom Bar ────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-[#1E293B] py-6 text-slate-500 dark:text-slate-400 text-sm">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Left: Copyright */}
          <div className="font-medium text-[14px] text-[#636C79] dark:text-[#94A3B8]">
            {t("footer.copyright")}
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            <Link
              href="#terms"
              className="font-medium text-[14px] text-[#636C79] dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="#security"
              className="font-medium text-[14px] text-[#636C79] dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
            >
              {t("footer.security")}
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}