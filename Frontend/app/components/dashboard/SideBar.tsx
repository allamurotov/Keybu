"use client";

import {
  ChevronDown,
  LayoutGrid,
  PanelLeftClose,
  Users,
  BookOpen,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isUsersOpen, setIsUsersOpen] = useState(pathname.includes('/dashboard/users'));
  const [isCoursesOpen, setIsCoursesOpen] = useState(pathname.includes('/dashboard/courses'));
  const userSubLinks = ["administrators", "assistents", "mentors", "students"];

  useEffect(() => {
    if (pathname.includes('/dashboard/users')) {
      setIsUsersOpen(true);
    }
    if (pathname.includes('/dashboard/courses')) {
      setIsCoursesOpen(true);
    }
  }, [pathname]);

  return (
    <aside
      className={`${
        isOpen ? "w-70" : "w-20"
      } bg-blue-950 text-white flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out z-20`}
    >
      {/* Logo Area */}
      <div
        className={`flex items-center h-16 ${
          isOpen ? "px-6 justify-between" : "justify-center"
        }`}
      >
        <div
          className={`flex items-center overflow-hidden transition-all duration-300 ${
            isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
          }`}
        >
          <Image 
            src="/Kebyu_logo_purple.png" 
            alt="Kebyu" 
            width={160} 
            height={48} 
            style={{ width: "auto", height: "auto" }}
            className="h-10 w-auto object-contain brightness-0 invert" 
            priority
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white p-1 rounded bg-white/10 transition-colors"
        >
          <PanelLeftClose
            size={18}
            className={`transition-transform duration-300 ${
              isOpen ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6">
        <div>
          <div
            className={`mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isOpen ? "px-6 opacity-100" : "px-0 opacity-0 h-0"
            }`}
          >
            Boshqaruv Paneli
          </div>
          <nav className={`space-y-1 ${isOpen ? "px-3" : "px-2"}`}>
            <Link
              href="/dashboard"
              className={`flex items-center py-2.5 rounded-lg transition-all overflow-hidden ${
                pathname === "/dashboard" 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${
                isOpen ? "px-3 gap-3" : "justify-center px-0 gap-0"
              }`}
              title="Asosiy"
            >
              <LayoutGrid size={20} className="shrink-0" />
              <span
                className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                Asosiy
              </span>
            </Link>

            {/* Foydalanuvchilar Accordion */}
            <div>
              <button
                onClick={() => {
                  if (!isOpen) {
                    setIsOpen(true);
                    setIsUsersOpen(true);
                  } else {
                    setIsUsersOpen(!isUsersOpen);
                  }
                }}
                className={`w-full flex items-center justify-between py-2.5 rounded-lg group transition-all overflow-hidden ${
                  isOpen ? "px-3" : "justify-center px-0"
                } ${
                  pathname.includes('/dashboard/users') 
                    ? "text-white" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
                title="Foydalanuvchilar"
              >
                <div
                  className={`flex items-center ${isOpen ? "gap-3" : "gap-0"}`}
                >
                  <Users size={20} className="shrink-0" />
                  <span
                    className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0 w-0"
                    }`}
                  >
                    Foydalanuvchilar
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-all duration-300 ${
                    isUsersOpen ? "rotate-180" : ""
                  } ${isOpen ? "opacity-100 w-4 ml-2" : "opacity-0 w-0 ml-0"}`}
                />
              </button>

              {/* Accordion Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen && isUsersOpen
                    ? "max-h-60 mt-1 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-11 pr-3 py-1 space-y-1">
                  {userSubLinks.map((link) => {
                    const isActive = pathname.includes(`/dashboard/users/${link}`);
                    return (
                      <Link
                        key={link}
                        href={`/dashboard/users/${link}`}
                        className={`block px-3 py-2 text-sm rounded-lg capitalize transition-colors ${
                          isActive
                            ? "bg-white/10 text-white font-medium"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Kurslar Accordion */}
            <div>
              <button
                onClick={() => {
                  if (!isOpen) {
                    setIsOpen(true);
                    setIsCoursesOpen(true);
                  } else {
                    setIsCoursesOpen(!isCoursesOpen);
                  }
                }}
                className={`w-full flex items-center justify-between py-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg group transition-all overflow-hidden ${
                  isOpen ? "px-3" : "justify-center px-0"
                }`}
                title="Kurslar"
              >
                <div
                  className={`flex items-center ${isOpen ? "gap-3" : "gap-0"}`}
                >
                  <BookOpen size={20} className="shrink-0" />
                  <span
                    className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0 w-0"
                    }`}
                  >
                    Kurslar
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-all duration-300 ${
                    isCoursesOpen ? "rotate-180" : ""
                  } ${isOpen ? "opacity-100 w-4 ml-2" : "opacity-0 w-0 ml-0"}`}
                />
              </button>

              {/* Accordion Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen && isCoursesOpen
                    ? "max-h-96 mt-1 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-11 pr-3 py-1 space-y-1">
                  {[
                    { name: "Barcha kurslar", href: "/dashboard/courses/allCourses" },
                    { name: "Kategoriyalar", href: "/dashboard/courses/categories" },
                  ].map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`block px-3 py-2 text-sm rounded-lg capitalize transition-colors ${
                          isActive
                            ? "bg-white/10 text-white font-medium"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/payments"
              className={`flex items-center py-2.5 rounded-lg transition-all overflow-hidden ${
                pathname === "/dashboard/payments"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${isOpen ? "px-3 gap-3" : "justify-center px-0 gap-0"}`}
              title="To’lovlar"
            >
              <CreditCard size={20} className="shrink-0" />
              <span
                className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                To’lovlar
              </span>
            </Link>

            <Link
              href="/dashboard/comments"
              className={`flex items-center py-2.5 rounded-lg transition-all overflow-hidden ${
                pathname === "/dashboard/comments"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${isOpen ? "px-3 gap-3" : "justify-center px-0 gap-0"}`}
              title="Izohlar"
            >
              <MessageSquare size={20} className="shrink-0" />
              <span
                className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                Izohlar
              </span>
            </Link>

            <Link
              href="/dashboard/qa"
              className={`flex items-center py-2.5 rounded-lg transition-all overflow-hidden ${
                pathname === "/dashboard/qa" || pathname.startsWith("/dashboard/qa/")
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${isOpen ? "px-3 gap-3" : "justify-center px-0 gap-0"}`}
              title="Savol-javoblar"
            >
              <MessageSquare size={20} className="shrink-0" />
              <span
                className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                Savol-javoblar
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
