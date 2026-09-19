"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useMentorStore } from "@/store/useMentorStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useRouter } from "next/navigation";
import { removeToken, baseAPI, API_URL } from "@/app/lib/utils";

export default function MentorHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();
  const { fullName, profileImage } = useMentorStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, connectSocket, disconnectSocket } = useNotificationStore();

  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user?.fullName) {
          useMentorStore.getState().updateProfile(user.fullName, null);
        }
      } catch {
        localStorage.removeItem("user");
      }
    }

    fetchNotifications();
    connectSocket();

    baseAPI.get("/profile").then((res) => {
      const user = res.data?.data || res.data;
      if (user) {
        useMentorStore.getState().updateProfile(
          user.fullName || "Mentor",
          user.file ? (user.file.startsWith("http") ? user.file : `${API_URL}/${user.file}`) : null
        );
      }
    }).catch(() => {});

    return () => disconnectSocket();
  }, [fetchNotifications, connectSocket, disconnectSocket]);

  const handleLogout = () => {
    removeToken("accessToken");
    removeToken("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login?clear_auth=true";
  };
  
  const languages = [
    { code: "uz", name: "O'zbek tili", flag: "🇺🇿" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "en", name: "English", flag: "🇬🇧" },
  ];
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  return (
    <header className="h-[88px] flex items-center justify-between px-8 shrink-0 bg-white border-b border-gray-100 shadow-sm z-10">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-gray-700" />
        <span className="font-semibold text-gray-800 text-lg">Mentor</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Icons Box */}
        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm text-gray-500">
          <div className="relative">
            <button 
              className="relative hover:text-gray-700 transition-colors cursor-pointer"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
                setIsLangOpen(false);
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
                      // Mentor gets redirected to mentor/qa if it's a student question link
                      if (notif.link && notif.link.includes('/students/')) {
                        const courseIdMatch = notif.link.match(/\/students\/(\d+)/);
                        if (courseIdMatch) {
                          router.push(`/mentor/qa?courseId=${courseIdMatch[1]}`);
                        } else {
                          router.push("/mentor/qa");
                        }
                      } else {
                        router.push("/mentor/qa");
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
          <button className="hover:text-gray-700 transition-colors cursor-pointer">
            <Settings size={20} />
          </button>
        </div>

        {/* Language Selector Box */}
        <div className="relative">
          <div 
            className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <span className="text-[16px] leading-none">{selectedLang.flag}</span>
            <span>{selectedLang.name}</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
          </div>

          {/* Language Dropdown */}
          <div
            className={`absolute right-0 top-14 w-48 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 origin-top-right transition-all duration-200 ease-out ${
              isLangOpen
                ? "opacity-100 scale-100 translate-y-0 visible"
                : "opacity-0 scale-95 -translate-y-2 invisible"
            }`}
          >
            {languages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang);
                  setIsLangOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg cursor-pointer transition-colors ${
                  selectedLang.code === lang.code
                    ? "bg-[#F3F4F6] text-gray-900 font-bold"
                    : "hover:bg-gray-50 text-gray-700 font-medium"
                }`}
              >
                <span className="text-[20px] leading-none drop-shadow-sm">{lang.flag}</span>
                <span className="text-[16px]">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Box */}
        <div className="relative">
          <button
            className="flex items-center gap-3 text-left bg-white p-1 pr-4 rounded-full border border-gray-100 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <User size={20} />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">
                {fullName || "Mentor"}
              </span>
              <span className="text-[11px] text-gray-500 leading-none">
                Mentor
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </button>

          {/* Profile Dropdown Menu */}
          <div
            className={`absolute right-0 top-14 w-56 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-1 z-50 origin-top-right transition-all duration-200 ease-out ${isProfileOpen
                ? "opacity-100 scale-100 translate-y-0 visible"
                : "opacity-0 scale-95 -translate-y-2 invisible"
              }`}
          >
            <Link
              href="/mentor/profile"
              onClick={() => setIsProfileOpen(false)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-gray-400" />

                <span className="font-medium">
                  Profilga o’tish
                </span>
              </div>

              <ChevronRight size={16} className="text-gray-400" />
            </Link>
            <button className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Settings size={16} className="text-gray-400" />
                <span className="font-medium">Profil sozlamalari</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors mt-1 border-t border-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LogOut size={16} className="text-gray-400" />
                <span className="font-medium">Tizimdan chiqish</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
