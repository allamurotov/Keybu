"use client";

import Image from "next/image";
import ismatxurshidov from "../../../../assets/ismatxurshidov.png";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import messagesUz from "../../../../messages/uz.json";
import messagesRu from "../../../../messages/ru.json";
import messagesEn from "../../../../messages/en.json";
import { removeToken } from "@/app/lib/utils";
import { ShieldCheck, Bell, Settings, ChevronDown, ChevronRight, LogOut, User, LayoutGrid } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { useNotificationStore } from "@/store/useNotificationStore";

type LanguageType = "uz" | "ru" | "en";

const messages = {
  uz: messagesUz,
  ru: messagesRu,
  en: messagesEn,
};



export default function Topbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageType>("uz");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { profile, fetchProfile, isLoading } = useProfileStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, connectSocket, disconnectSocket } = useNotificationStore();

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    connectSocket();
    return () => disconnectSocket();
  }, [fetchProfile, fetchNotifications, connectSocket, disconnectSocket]);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = (localStorage.getItem("language") || "uz") as LanguageType;
    setLanguage(savedLang);
  }, []);

  const getProfileImage = () => {
    if (profile?.file) {
      return `${process.env.NEXT_PUBLIC_API_URL}${profile.file}`;
    }
    return "";
  };

  // Handle language change
  const handleLanguageChange = (lang: LanguageType) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    setIsLangDropdownOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    removeToken("accessToken");
    removeToken("refreshToken");
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    window.location.href = "/?clear_auth=true";
  };

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLangLabel = () => {
    const langMap: Record<LanguageType, string> = {
      uz: "O'zbek",
      ru: "Русский",
      en: "English",
    };
    return langMap[language];
  };

  return (
    <header className="h-[88px] flex items-center justify-between px-8 shrink-0 bg-white border-b border-gray-100 shadow-sm z-10 relative">
      {/* Overlay to close dropdowns when clicking outside */}
      {(isDropdownOpen || isLangDropdownOpen || isNotificationsOpen) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsLangDropdownOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}

      <div className="flex items-center gap-2 relative z-50">
        <div className="w-5 h-5 rounded-full border-2 border-gray-700 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-700" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="font-semibold text-gray-800 text-lg">Student</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Icons Box */}
        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm text-gray-500">
          <div className="relative">
            <button 
              className="relative hover:text-gray-700 transition-colors"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsDropdownOpen(false);
                setIsLangDropdownOpen(false);
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 text-[9px] flex items-center justify-center text-white bg-red-500 rounded-full border border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown Menu */}
            <div
              className={`absolute right-[-10px] top-12 w-80 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 origin-top-right transition-all duration-200 ease-out ${
                isNotificationsOpen
                  ? "opacity-100 scale-100 translate-y-0 visible"
                  : "opacity-0 scale-95 -translate-y-2 invisible"
              }`}
            >
              <div className="px-4 py-2 border-b border-gray-50">
                <span className="font-semibold text-gray-800">Bildirishnomalar</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {unreadCount === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Yangi bildirishnomalar yo&apos;q
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex flex-col gap-1" onClick={() => {
                      markAsRead(notif.id);
                      setIsNotificationsOpen(false);
                      if (notif.link) {
                        router.push(notif.link);
                      }
                    }}>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm text-gray-800">{notif.title}</span>
                        <span className="text-[10px] text-gray-400">{new Date(notif.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="w-[1px] h-5 bg-gray-200"></div>

          <button onClick={() => router.push("/students/profile")} className="hover:text-gray-700 transition-colors">
            <Settings size={20} />
          </button>

          <div className="w-[1px] h-5 bg-gray-200"></div>

          {/* Language Selector Box */}
          <div className="relative" ref={langDropdownRef}>
            <div 
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              onClick={() => {
                setIsLangDropdownOpen(!isLangDropdownOpen);
                setIsDropdownOpen(false);
              }}
            >
              <span>{getLangLabel()}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            <div
              className={`absolute right-0 top-12 w-40 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-1 z-50 origin-top-right transition-all duration-200 ease-out ${
                isLangDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0 visible"
                  : "opacity-0 scale-95 -translate-y-2 invisible"
              }`}
            >
              <button
                onClick={() => handleLanguageChange("uz")}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  language === "uz" ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                O&apos;zbek
              </button>
              <button
                onClick={() => handleLanguageChange("ru")}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  language === "ru" ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Русский
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  language === "en" ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Profile Box */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-3 text-left bg-white p-1 pr-4 rounded-full border border-gray-100 shadow-sm transition-shadow hover:shadow-md"
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsLangDropdownOpen(false);
            }}
          >
            {isLoading ? (
               <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : getProfileImage() ? (
              <Image
                src={getProfileImage()}
                alt="Profile"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover bg-gray-100"
                unoptimized
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-[16px] font-bold text-blue-600">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "O'"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">
                {isLoading ? "Yuklanmoqda..." : profile?.fullName || "Student"}
              </span>
              <span className="text-[11px] text-gray-500 leading-none">
                {profile?.role === "STUDENT" ? "O'quvchi" : profile?.role || "O'quvchi"}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </button>

          {/* Profile Dropdown Menu */}
          <div
            className={`absolute right-0 top-14 w-60 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-1 z-50 origin-top-right transition-all duration-200 ease-out ${
              isDropdownOpen
                ? "opacity-100 scale-100 translate-y-0 visible"
                : "opacity-0 scale-95 -translate-y-2 invisible"
            }`}
          >
            <button onClick={() => { router.push("/students/profile"); setIsDropdownOpen(false); }} className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-gray-400" />
                <span className="font-medium">Profil ma&apos;lumotlari</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <div className="h-px bg-gray-100 my-1 mx-2"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-700 hover:bg-red-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <LogOut size={16} className="text-red-500" />
                <span className="font-medium text-red-500">Profildan chiqish</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
