"use client";

import {
  ChevronDown,
  LayoutGrid,
  PanelLeftClose,
  Users,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function MentorSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isUsersOpen, setIsUsersOpen] = useState(pathname.includes('/mentor/students'));
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(pathname.includes('/mentor/courses') || pathname.includes('/mentor/qa') || pathname.includes('/mentor/homeworks'));

  return (
    <aside
      className={`${
        isOpen ? "w-70" : "w-20"
      } bg-[#10061e] text-white flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out z-20`}
    >
      {/* Logo Area */}
      <div
        className={`flex items-center h-20 ${
          isOpen ? "px-6 justify-between" : "justify-center"
        } border-b border-white/5`}
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
            className="h-10 w-auto object-contain brightness-0 invert" 
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-[#27173b] hover:bg-[#34204d] transition-colors cursor-pointer border border-white/5"
        >
          <PanelLeftClose
            size={20}
            className={`transition-transform duration-300 ${
              isOpen ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-6">
        <div>
          <div
            className={`mb-4 text-[13px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isOpen ? "px-6 opacity-100" : "px-0 opacity-0 h-0"
            }`}
          >
            BOSHQARUV PANELI
          </div>
          <nav className={`space-y-2 ${isOpen ? "px-4" : "px-2"}`}>
            <Link
              href="/mentor"
              className={`flex items-center py-3.5 rounded-xl transition-all overflow-hidden ${
                pathname === "/mentor" 
                  ? "bg-[#2b193d] text-white shadow-sm" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${
                isOpen ? "px-4 gap-4" : "justify-center px-0 gap-0"
              }`}
              title="Asosiy"
            >
              <LayoutGrid size={22} strokeWidth={2} className="shrink-0" />
              <span
                className={`font-medium text-[16px] whitespace-nowrap transition-opacity duration-300 ${
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
                className={`w-full flex items-center justify-between py-2.5 rounded-lg group transition-all overflow-hidden cursor-pointer ${
                  isOpen ? "px-3" : "justify-center px-0"
                } ${
                  pathname.includes('/mentor/students') 
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
                  <Link
                    href="/mentor/students"
                    className={`block px-3 py-2 text-sm rounded-lg capitalize transition-colors ${
                      pathname.includes('/mentor/students')
                        ? "bg-white/10 text-white font-medium"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    O&apos;quvchilarim
                  </Link>
                </div>
              </div>
            </div>

            {/* Materiallar Accordion */}
            <div>
              <button
                onClick={() => {
                  if (!isOpen) {
                    setIsOpen(true);
                    setIsMaterialsOpen(true);
                  } else {
                    setIsMaterialsOpen(!isMaterialsOpen);
                  }
                }}
                className={`w-full flex items-center justify-between py-2.5 rounded-lg group transition-all overflow-hidden cursor-pointer ${
                  isOpen ? "px-3" : "justify-center px-0"
                } ${
                  pathname.includes("/mentor/courses") ||
                  pathname.includes("/mentor/qa") ||
                  pathname.includes("/mentor/homeworks")
                    ? "text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
                title="Materiallar"
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
                    Materiallar
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-all duration-300 ${
                    isMaterialsOpen ? "rotate-180" : ""
                  } ${isOpen ? "opacity-100 w-4 ml-2" : "opacity-0 w-0 ml-0"}`}
                />
              </button>

              {/* Accordion Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen && isMaterialsOpen
                    ? "max-h-96 mt-1 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-11 pr-3 py-1 space-y-1">
                  {[
                    { name: "Mening kurslarim", href: "/mentor/courses" },
                    { name: "Savol-javoblar", href: "/mentor/qa" },
                    { name: "Uyga vazifalar", href: "/mentor/homeworks" },
                  ].map((link) => {
                    const isActive =
                      pathname === link.href || pathname.startsWith(`${link.href}/`);
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

          </nav>
        </div>
      </div>
    </aside>
  );
}
