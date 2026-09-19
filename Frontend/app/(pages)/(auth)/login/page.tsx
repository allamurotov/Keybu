"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import loginImage from "@/app/assets/login2_purple.png";
import { baseAPI, setToken } from "@/app/lib/utils";
import { showToast } from "@/store/useToastStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [loginData, setForm] = useState({ phone: "", password: "" });

    async function submitForm(e: React.FormEvent) {
        e.preventDefault();

        try {
            if (!loginData.phone || !loginData.password) {
                return showToast("Xatolik !", {
                    title: "Iltimos barcha maydonlarni to'ldiring",
                    type: "error",
                });
            }
            
            // Clean inputs to avoid 401 errors due to accidental spaces
            const cleanPhone = loginData.phone.replace(/\s/g, '');
            const cleanPassword = loginData.password.trim();
            
            const res = await baseAPI.post('/auth/login', { 
                phone: cleanPhone, 
                password: cleanPassword 
            });

            if (res.data?.tokens?.accessToken) {
                setToken("accessToken", res.data.tokens.accessToken);
            }
            if (res.data?.tokens?.refreshToken) {
                setToken("refreshToken", res.data.tokens.refreshToken);
            }

            // Save user info
            if (res.data?.data) {
              localStorage.setItem("user", JSON.stringify(res.data.data));
            }

            if(res.data?.data?.role === "SUPERADMIN" || res.data?.data?.role === "ADMIN") {
                router.push('/dashboard')
            } else if(res.data?.data?.role === "MENTOR") {
                router.push('/mentor')
            } else if(res.data?.data?.role === "ASSISTANT") {
                router.push('/assistents')
            } else {
                router.push('/students')
            }

        } catch (error: any) {
            showToast("Xatolik !", {
                title: error.response?.data?.message,
                type: "error",
            });
            console.error(error);
        }
    }

    return (
        <main className="min-h-screen bg-white">
            <section className="flex min-h-screen">

                {/* ================= LEFT ================= */}
                <div className="relative flex w-1/2 min-h-screen flex-col bg-white">

                    {/* LOGO */}
                    <div className="absolute left-7 top-6">
                        <Image src="/Kebyu_logo_purple.png" alt="Kebyu Logo" width={140} height={40} className="object-contain" style={{ width: "auto", height: "auto" }} />
                    </div>

                    {/* LOGIN FORM */}
                    <div className="absolute left-1/2 top-1/2 w-[340px] -translate-x-1/2 -translate-y-1/2">

                        {/* TITLE */}
                        <h1 className="mb-7 text-left text-[22px] font-bold text-black">
                            Kirish
                        </h1>
                        <form onSubmit={(e) => submitForm(e)}>

                            <div className="mb-5">
                                <label
                                    htmlFor="phone"
                                    className="mb-1.5 block text-[11px] font-medium text-[#333]"
                                >
                                    Telefon
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+998"
                                    className="h-[42px] w-full rounded-md border border-[#dedede] bg-white px-3 text-[12px] text-black outline-none transition focus:border-[#3478ed] focus:ring-2 focus:ring-[#3478ed]/20"
                                    onChange={(e) => setForm({ ...loginData, phone: e.target.value })}
                                />
                            </div>

                            {/* PAROL */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-[11px] font-medium text-[#333]"
                                >
                                    Parol
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="••••••••"
                                        className="h-[42px] w-full rounded-md border border-[#dedede] bg-white px-3 pr-10 text-[12px] text-black outline-none transition focus:border-[#3478ed] focus:ring-2 focus:ring-[#3478ed]/20"
                                        onChange={(e) => setForm({ ...loginData, password: e.target.value })}
                                    />

                                    <button
                                        type="button"
                                        aria-label={
                                            showPassword
                                                ? "Parolni yashirish"
                                                : "Parolni ko'rsatish"
                                        }
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] transition hover:text-[#555]"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* FORGOT PASSWORD */}
                            <div className="mb-5 mt-3 text-right">
                                <button
                                    type="button"
                                    className="text-[10px] text-blue-600 hover:underline"
                                >
                                    Parolni unutdingizmi?
                                </button>
                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                className="h-[42px] w-full rounded-full bg-blue-600 text-[11px] font-medium text-white transition hover:bg-blue-700 active:scale-[0.99]"
                            >
                                Kirish
                            </button>
                        </form>
                    </div>

                    {/* FOOTER */}
                    <div className="absolute bottom-5 left-7 text-[9px] text-[#666]">
                        © 2026. Barcha huquqlar himoyalangan
                    </div>
                </div>

                {/* ================= RIGHT ================= */}
                <div className="relative min-h-screen w-1/2 overflow-hidden">

                    <Image
                        src={loginImage}
                        alt="Kebyu LMS"
                        fill
                        loading="eager"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                    />

                </div>
            </section>
        </main>
    );
}