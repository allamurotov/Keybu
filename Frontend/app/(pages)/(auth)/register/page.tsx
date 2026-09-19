"use client";

import React, { useState } from "react";
import Image from "next/image";
import ImageLogin from "@/app/assets/register_purple.png";
import Link from "next/link";
import { User, Smartphone, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "@/store/useToastStore";
import { useRegisterStore } from "@/store/useRegisterStore";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [data, setData] = useState({ fullName: "", phone: "", password: "" });
  const [isSame, verifyPass] = useState("");
  const setFormData = useRegisterStore((state) => state.setFormData);

  async function RegisterForm(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!data.fullName || !data.phone || !data.password) {
        return showToast("Xatolik !", {
          title: "Iltimos barcha maydonlarni to’ldiring",
          type: "error",
        });
      }
      if (isSame !== data.password) {
        return showToast("Xatolik !", {
          title: "Parol tasdiqlashda xatolik!",
          type: "error",
        });
      }
      setFormData(data);
      
      const courseId = searchParams.get('courseId');
      const verifyUrl = courseId ? `/verify-otp?courseId=${courseId}` : '/verify-otp';
      
      router.push(verifyUrl);
    } catch (error) {
      throw error;
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans bg-white">
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#F0F6FF] p-8 relative">
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={ImageLogin}
              alt="Register Illustration"
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
            <div className="flex items-center gap-1 font-extrabold text-2xl tracking-wide">
              <Image src="/Kebyu_logo_purple.png" alt="Kebyu Logo" width={140} height={40} className="object-contain" style={{ width: "auto", height: "auto" }} />
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
            Ro’yxatdan o’tish
          </h1>

          <form className="space-y-5" onSubmit={(e) => RegisterForm(e)}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                To’liq ismingizni kiriting{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  onChange={(e) =>
                    setData({ ...data, fullName: e.target.value })
                  }
                  type="text"
                  placeholder="Kiritish"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10"
                  required
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Telefon raqamingiz <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  type="tel"
                  placeholder="+998"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10"
                  required
                />
                <Smartphone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Parolni kiriting
              </label>
              <div className="relative">
                <input
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4 stroke-[1.5]" />
                  ) : (
                    <EyeOff className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <input
                  onChange={(e) => verifyPass(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <Eye className="w-4 h-4 stroke-[1.5]" />
                  ) : (
                    <EyeOff className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-full transition-colors shadow-sm mt-2"
            >
              Davom etish
            </button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
            Menda hisob mavjud!{" "}
            <Link
              href="/login"
              className="text-blue-500 font-semibold hover:underline"
            >
              Kirish
            </Link>
          </div>
        </div>

        <div className="w-full text-center text-xs text-gray-400"></div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <RegisterFormContent />
    </React.Suspense>
  );
}
