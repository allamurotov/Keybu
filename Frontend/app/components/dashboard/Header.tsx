"use client";

import React, { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { removeToken } from "@/app/lib/utils";
import { useProfileStore } from "@/store/useProfileStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import Image from "next/image";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("uz");
  const router = useRouter();
  const { profile, fetchProfile, isLoading } = useProfileStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, connectSocket, disconnectSocket } = useNotificationStore();

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    connectSocket();
    return () => disconnectSocket();
  }, [fetchProfile, fetchNotifications, connectSocket, disconnectSocket]);

  const handleLogout = () => {
    removeToken("accessToken");
    removeToken("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/?clear_auth=true";
  };

  const getProfileImage = () => {
    if (profile?.file) {
      return `${process.env.NEXT_PUBLIC_API_URL}${profile.file}`;
    }
    return "";
  };

  return (
    <header className="h-[88px] flex items-center justify-between px-8 shrink-0 bg-white border-b border-gray-100 shadow-sm z-10 relative">
      {/* Overlay to close dropdowns when clicking outside */}
      {(isProfileOpen || isNotificationsOpen || isLanguageOpen) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
            setIsLanguageOpen(false);
          }}
        />
      )}

      <div className="flex items-center gap-2 relative z-50">
        <ShieldCheck size={20} className="text-gray-700" />
        <span className="font-semibold text-gray-800 text-lg">Admin</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Icons Box */}
        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm text-gray-500">
          <div className="relative">
            <button 
              className="relative hover:text-gray-700 transition-colors"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
                setIsLanguageOpen(false);
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
                      if (notif.link && notif.link.includes('/students/')) {
                        const courseIdMatch = notif.link.match(/\/students\/(\d+)/);
                        if (courseIdMatch) {
                          router.push(`/dashboard/qa?courseId=${courseIdMatch[1]}`);
                        } else {
                          router.push("/dashboard/qa");
                        }
                      } else if (notif.link) {
                        router.push(notif.link);
                      } else {
                        router.push("/dashboard/comments");
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
          <button 
            className="hover:text-gray-700 transition-colors"
            onClick={() => router.push("/dashboard/profile")}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Language Selector Box */}
        <div className="relative">
          <div 
            className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm cursor-pointer"
            onClick={() => {
              setIsLanguageOpen(!isLanguageOpen);
              setIsProfileOpen(false);
              setIsNotificationsOpen(false);
            }}
          >
            <span>{language === "uz" ? "O’zbek (Lotin)" : "Русский"}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>

          <div
            className={`absolute right-0 top-12 w-48 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-1 z-50 origin-top-right transition-all duration-200 ease-out ${
              isLanguageOpen
                ? "opacity-100 scale-100 translate-y-0 visible"
                : "opacity-0 scale-95 -translate-y-2 invisible"
            }`}
          >
            <button
              onClick={() => { setLanguage("uz"); setIsLanguageOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              O’zbek (Lotin)
            </button>
            <button
              onClick={() => { setLanguage("ru"); setIsLanguageOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Русский
            </button>
          </div>
        </div>

        {/* Profile Box */}
        <div className="relative">
          <button
            className="flex items-center gap-3 text-left bg-white p-1 pr-4 rounded-full border border-gray-100 shadow-sm transition-shadow hover:shadow-md"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
              setIsLanguageOpen(false);
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
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">
                {isLoading ? "Yuklanmoqda..." : profile?.fullName || "Administrator"}
              </span>
              <span className="text-[11px] text-gray-500 leading-none">
                {profile?.role === "SUPERADMIN" ? "Superadmin" : "Administrator"}
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
              href="/dashboard/profile"
              onClick={() => setIsProfileOpen(false)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-gray-400" />
                <span className="font-medium">
                  Profil
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors mt-1 border-t border-gray-50"
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
