"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLanguage, type Language } from "@/app/context/LanguageContext";
import { getCategories } from "@/app/lib/api/categories";
import { getCourses } from "@/app/lib/api/courses";

export default function Navbar() {
  const pathname = usePathname();
  const langRef = useRef<HTMLDivElement>(null);

  const { selectedLang, setSelectedLang, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = mounted && resolvedTheme === "dark";

  const [dbCategories, setDbCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const [categoriesData, coursesData] = await Promise.all([
          getCategories(),
          getCourses()
        ]);
        
        const allCourses = (coursesData as any[]) || [];
        const activeCategoryIds = new Set(
          allCourses
            .filter((c: any) => !c.status || c.status.toLowerCase() !== 'inactive')
            .map((c: any) => c.categoryId)
        );
        
        const filteredCategories = (categoriesData || []).filter((c: any) => activeCategoryIds.has(c.id));
        setDbCategories(filteredCategories);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
    };
    fetchCategories();
  }, []);

  const languages: Language[] = ["O’z", "Рус", "Eng"];

  useEffect(() => {
    setLangDropdownOpen(false);
    setCoursesDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  const getLinkStyle = (path: string) => {
    return isActive(path)
      ? "text-slate-900 dark:text-white font-semibold relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500"
      : "text-[#2F3641] dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors pb-1";
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="w-full bg-white dark:bg-[#0A0E17]/95 border-b border-slate-100 dark:border-[#1E293B] sticky top-0 z-50 backdrop-blur-sm transition-colors duration-200">
      <div className="container h-[80px] flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-10 xl:gap-14">
          <Link href="/" className="flex items-center">
            <Image
              src="/Kebyu_logo_purple.png"
              alt="Kebyu Logo"
              width={140}
              height={45}
              priority
              style={{ width: "auto", height: "auto" }}
              className="h-auto w-[120px] object-contain dark:brightness-0 dark:invert"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px]">
            <Link href="/" className={getLinkStyle("/")}>
              {t("Navbar.home")}
            </Link>

            {/* Courses Dropdown */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setCoursesDropdownOpen(true)}
              onMouseLeave={() => setCoursesDropdownOpen(false)}
            >
              <Link
                href="/courses"
                className={`flex items-center gap-1.5 ${getLinkStyle("/courses")}`}
              >
                <span>{t("Navbar.courses")}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    coursesDropdownOpen ? "rotate-180 text-blue-500" : "text-slate-400 dark:text-slate-500"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {coursesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-fadeIn">
                  <div className="w-[135px] bg-white dark:bg-[#151C28] rounded-[10px] shadow-lg border border-slate-100 dark:border-[#1E293B] p-3 flex flex-col gap-[6px]">
                    {dbCategories.map((item) => (
                      <Link
                        key={item.id}
                        href={`/courses?category=${item.id}`}
                        className="text-[15px] font-medium text-[#2F3641] dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-none py-1 block"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/about" className={getLinkStyle("/about")}>
              {t("Navbar.about")}
            </Link>

            <Link href="/contact" className={getLinkStyle("/contact")}>
              {t("Navbar.contact")}
            </Link>
          </nav>
        </div>

        {/* Right side: Lang, Theme, Login */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#2A3547] transition-all cursor-pointer"
            >
              <span>{selectedLang}</span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-20 bg-white dark:bg-[#151C28] rounded-[10px] shadow-md border border-slate-100 dark:border-[#1E293B] py-1 z-50 animate-fadeIn">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      selectedLang === lang
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E293B]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2A3547] transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {mounted && isDark ? (
              /* Sun icon — shown in dark mode */
              <svg className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 24 24">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
              </svg>
            ) : (
              /* Moon icon — shown in light mode */
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Login Button */}
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{t("Navbar.login")}</span>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2A3547] focus:outline-none cursor-pointer"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0A0E17] border-b border-slate-200 dark:border-[#1E293B] px-6 pt-4 pb-6 space-y-4 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-3 font-medium text-[#2F3641] dark:text-slate-300">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={isActive("/") ? "text-blue-600 dark:text-blue-400 font-semibold" : "hover:text-blue-600 dark:hover:text-blue-400"}
            >
              {t("Navbar.home")}
            </Link>
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className={isActive("/courses") ? "text-blue-600 dark:text-blue-400 font-semibold" : "hover:text-blue-600 dark:hover:text-blue-400"}
            >
              {t("Navbar.courses")}
            </Link>
            <div className="pl-4 space-y-2 border-l-2 border-slate-100 dark:border-[#1E293B]">
              {dbCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses?category=${c.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={isActive("/about") ? "text-blue-600 dark:text-blue-400 font-semibold" : "hover:text-blue-600 dark:hover:text-blue-400"}
            >
              {t("Navbar.about")}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={isActive("/contact") ? "text-blue-600 dark:text-blue-400 font-semibold" : "hover:text-blue-600 dark:hover:text-blue-400"}
            >
              {t("Navbar.contact")}
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-100 dark:border-[#1E293B] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Til:</span>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedLang === l
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {isDark ? "Yorug' rejim" : "Qorong'u rejim"}
              </span>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300"
                aria-label="Toggle dark mode"
              >
                {mounted && isDark ? (
                  <svg className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-[10px] bg-blue-600 text-white font-medium text-sm shadow-xs"
            >
              {t("Navbar.login")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
