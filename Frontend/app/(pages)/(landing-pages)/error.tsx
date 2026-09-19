"use client";

import { useEffect } from "react";
import Link from "next/link";

import { LanguageProvider, useLanguage } from "@/app/context/LanguageContext";
import { RefreshCcw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function ErrorContent({ error, reset }: ErrorProps) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-20">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold text-[#141518]">{t("error.title")}</h2>
        <p className="mb-8 max-w-[500px] text-lg text-slate-600">
          {t("error.description")}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0047FF] px-8 py-3.5 font-medium text-white transition-colors hover:bg-blue-700 shadow-[0_4px_14px_rgba(0,71,255,0.25)] w-full sm:w-auto"
          >
            <RefreshCcw size={20} />
            <span>{t("error.retry")}</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-8 py-3.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 w-full sm:w-auto"
          >
            <Home size={20} />
            <span>{t("error.backHome")}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <LanguageProvider>
      <ErrorContent error={error} reset={reset} />
    </LanguageProvider>
  );
}
