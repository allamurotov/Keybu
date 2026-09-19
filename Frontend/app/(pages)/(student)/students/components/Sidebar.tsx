"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeftClose, BookOpen, Layers } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Barcha kurslar",
    href: "/students/all-courses",
    icon: <Layers size={20} className="shrink-0" />,
  },
  {
    label: "Mening kurslarim",
    href: "/students",
    icon: <BookOpen size={20} className="shrink-0" />,
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={`${
        isOpen ? "w-70" : "w-20"
      } bg-blue-950 text-white flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out z-20`}
      style={{ width: isOpen ? "280px" : "80px" }}
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
            width={120} 
            height={36} 
            style={{ width: "auto", height: "auto" }}
            className="h-8 w-auto object-contain brightness-0 invert" 
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
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center py-2.5 rounded-lg transition-all overflow-hidden ${
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  } ${
                    isOpen ? "px-3 gap-3" : "justify-center px-0 gap-0"
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  <span
                    className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0 w-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}