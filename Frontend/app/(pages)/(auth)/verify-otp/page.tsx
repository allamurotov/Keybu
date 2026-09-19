"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ImageLogin from "@/app/assets/register_purple.png";
import { Copy, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegisterStore } from "@/store/useRegisterStore";
import { showToast } from "@/store/useToastStore";
import { baseAPI, setToken } from "@/app/lib/utils";

function VerificationContent() {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(46);
  const { formData, resetFormData } = useRegisterStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      otp: code,
    };
    const courseId = searchParams.get('courseId');

    try {
      // courseId bo'lsa qo'shish, bo'lmasa oddiy register
      const url = courseId ? `/auth/register/${courseId}` : '/auth/register';
      const res = await baseAPI.post(url, payload);

      // Token ni saqlash
      if (res.data?.tokens?.accessToken) {
        setToken("accessToken", res.data.tokens.accessToken);
        setToken("refreshToken", res.data.tokens.refreshToken);
      }

      // User info'ni saqlash
      if (res.data?.data) {
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }

      // Role bo'yicha yo'naltirish
      const role = res.data?.data?.role;
      
      if (role === "SUPERADMIN" || role === "ADMIN") {
        router.push('/dashboard')
      } else if (role === "MENTOR") {
        router.push('/dashboard/users/mentors')
      } else if (role === "ASSISTANT") {
        router.push('/dashboard/users/assistents')
      } else {
        router.push('/students')
      }

      // Form datani tozalash
      resetFormData();
      
      showToast("Muvaffaqiyatli!", {
        title: "Ro'yxatdan o'tdingiz!",
        type: "success",
      });

    } catch (error: any) {
      showToast("Xatolik!", {
        title: error.response?.data?.message || "OTP kod noto'g'ri",
        type: "error",
      });
      console.error(error);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(60);
      // Logic for resending SMS code
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans bg-white">
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#F0F6FF] p-8 relative">
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={ImageLogin}
              alt="Illustration"
              fill
              className="object-contain"
              priority
            />
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-blue-400">
              <span className="text-sm text-gray-400 mt-1"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative min-h-screen">
        <div className="flex justify-end w-full">
          <div className="relative h-10 w-32 flex items-center justify-end">
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            Tasdiqlash kodi
          </h1>

          <form className="space-y-6" onSubmit={(e) => handleVerify(e)}>
            <div className="text-left">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Tasdiqlash kodi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="0 0 0 - 0 0 0"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10 tracking-widest font-mono"
                  required
                />
                <Copy className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 py-1">
              <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                {formatTime(timeLeft)}
              </div>
              <span>
                Tasdiqlash kodi kiritilgan telefon raqamining telegram akkaunti
                orqali telegram bot:{" "}
                <a
                  href="https://t.me/Lms_n27_otpbot"
                  target="_blank"
                  className="text-gray-600"
                >
                  @Lms_n27_otpbot
                </a>{" "}
                dan tasdiqlash kodini oling!
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-full transition-colors shadow-sm"
            >
              Davom etish
            </button>
          </form>
        </div>

        <div className="w-full text-center text-xs text-gray-400"></div>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <VerificationContent />
    </React.Suspense>
  );
}
