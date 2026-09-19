"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { baseAPI } from "@/app/lib/utils";
import { showToast } from "@/store/useToastStore";
import Image from "next/image";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  const { profile, fetchProfile, isLoading } = useProfileStore();

  // Profile Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Security Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      const data: any = (profile as any).data || profile;

      setName(data.fullName || data.name || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");

      const avatarPath = data.file || data.avatar || data.image;
      if (avatarPath) {
        if (avatarPath.startsWith("http")) {
          setImage(avatarPath);
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
          const cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
          setImage(`${cleanBase}${cleanPath}`);
        }
      } else {
        setImage("");
      }
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleDeleteImage = () => {
    setImage("");
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      if (name) formData.append("fullName", name);
      if (phone) formData.append("phone", phone);
      if (email) formData.append("email", email);

      if (imageFile) {
        formData.append("avatar", imageFile);
      }

      const response = await baseAPI.patch("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast(response.data?.message || "Profil muvaffaqiyatli yangilandi", {
        type: "success",
      });

      await fetchProfile();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Xatolik yuz berdi", {
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Barcha maydonlarni to'ldiring", { type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Yangi parollar bir-biriga mos kelmadi", { type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      showToast("Yangi parol kamida 6 ta belgi bo'lishi kerak", { type: "error" });
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await baseAPI.patch("/profile/change-password", {
        oldPassword,
        newPassword,
      });

      showToast(response.data?.message || "Parol muvaffaqiyatli o'zgartirildi", {
        type: "success",
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Parolni o'zgartirishda xatolik yuz berdi",
        { type: "error" }
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 gap-2">
        <Loader2 className="animate-spin" size={20} />
        <span>Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <main className="min-h-full w-full bg-[#F3F4F6] px-[13px] py-[17px]">
      <h1 className="mb-[28px] text-[18px] font-bold leading-[22px] text-[#171717]">
        {activeTab === "profile" ? "Shaxsiy ma’lumotlar" : "Profil sozlamalari"}
      </h1>

      <div className="grid w-full grid-cols-[256px_minmax(0,1fr)] gap-[12px]">
        {/* LEFT MENU */}
        <aside className="w-[256px]">
          <div className="flex flex-col gap-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`h-[42px] w-full rounded-[5px] px-[12px] text-left text-[14px] font-medium leading-none transition ${activeTab === "profile"
                  ? "bg-white text-[#171717]"
                  : "bg-transparent text-[#404040] hover:bg-white/60"
                }`}
            >
              Shaxsiy ma’lumotlar
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`h-[42px] w-full rounded-[5px] px-[12px] text-left text-[14px] font-medium leading-none transition ${activeTab === "security"
                  ? "bg-white text-[#171717]"
                  : "bg-transparent text-[#404040] hover:bg-white/60"
                }`}
            >
              Xavfsizlik
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`h-[42px] w-full rounded-[5px] px-[12px] text-left text-[14px] font-medium leading-none transition ${activeTab === "notifications"
                  ? "bg-white text-[#171717]"
                  : "bg-transparent text-[#404040] hover:bg-white/60"
                }`}
            >
              Bildirishnomalar
            </button>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="min-w-0">
          {activeTab === "profile" && (
            <div className="w-full rounded-[6px] bg-white px-[11px] py-[11px]">
              {/* IMAGE */}
              <div className="mb-[18px] flex items-center gap-[10px]">
                <div className="relative h-[44px] w-[44px] shrink-0">
                  {image ? (
                    <Image
                      src={image}
                      alt="Profile"
                      width={44}
                      height={44}
                      className="h-[44px] w-[44px] rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-blue-100 text-[18px] font-bold text-blue-600">
                      {name ? name.charAt(0).toUpperCase() : "A"}
                    </div>
                  )}

                  <label className="absolute bottom-[-1px] right-[-1px] flex h-[17px] w-[17px] cursor-pointer items-center justify-center rounded-full border-[2px] border-white bg-[#407BFF]">
                    <Camera size={9} strokeWidth={2.5} className="text-white" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="flex h-[24px] w-[64px] items-center justify-center rounded-full bg-[#F5F6F8] text-[11px] font-medium text-[#8A8F98] hover:bg-gray-200 transition"
                >
                  O&apos;chirish
                </button>
              </div>

              {/* NAME */}
              <div className="mb-[9px]">
                <label className="mb-[5px] block p-[4px] text-[13px] font-medium leading-none text-[#4B5563]">
                  To&apos;liq ism
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-[40px] w-full rounded-[5px] border border-[#DDE1E7] bg-white px-[8px] text-[12px] text-[#171717] outline-none transition focus:border-[#407BFF]"
                />
              </div>

              {/* PHONE */}
              <div className="mb-[9px]">
                <label className="mb-[5px] block p-[4px] text-[13px] font-medium leading-none text-[#4B5563]">
                  Telefon
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-[40px] w-full rounded-[5px] border border-[#DDE1E7] bg-white px-[8px] text-[12px] text-[#171717] outline-none transition focus:border-[#407BFF]"
                />
              </div>

              {/* EMAIL */}
              <div className="mb-[9px]">
                <label className="mb-[5px] block p-[4px] text-[13px] font-medium leading-none text-[#4B5563]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="h-[40px] w-full rounded-[5px] border border-[#DDE1E7] bg-white px-[8px] text-[12px] text-[#171717] outline-none transition focus:border-[#407BFF]"
                />
              </div>

              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="flex h-[43px] w-[120px] items-center justify-center gap-[5px] rounded-[5px] bg-[#407BFF] px-[12px] text-[12px] font-medium text-white transition hover:bg-[#306BEF] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <Check size={11} strokeWidth={2.5} />
                    Saqlash
                  </>
                )}
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="w-full rounded-[6px] bg-white px-[11px] py-[11px]">
              <div className="mb-[9px]">
                <label className="mb-[5px] block p-[4px] text-[13px] font-medium leading-none text-[#4B5563]">
                  Joriy parol
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-[40px] w-full rounded-[5px] border border-[#DDE1E7] bg-white px-[8px] text-[12px] text-[#171717] outline-none transition focus:border-[#407BFF]"
                />
              </div>

              <div className="mb-[9px]">
                <label className="mb-[5px] block p-[4px] text-[13px] font-medium leading-none text-[#4B5563]">
                  Yangi parol
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-[40px] w-full rounded-[5px] border border-[#DDE1E7] bg-white px-[8px] text-[12px] text-[#171717] outline-none transition focus:border-[#407BFF]"
                />
              </div>

              <div className="mb-[9px]">
                <label className="mb-[5px] block p-[4px] text-[13px] font-medium leading-none text-[#4B5563]">
                  Yangi parolni tasdiqlash
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-[40px] w-full rounded-[5px] border border-[#DDE1E7] bg-white px-[8px] text-[12px] text-[#171717] outline-none transition focus:border-[#407BFF]"
                />
              </div>

              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex h-[43px] w-[160px] items-center justify-center gap-[6px] rounded-[5px] bg-[#407BFF] px-[12px] text-[12px] font-medium text-white transition hover:bg-[#306BEF] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  "Parolni o'zgartirish"
                )}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="w-full rounded-[6px] bg-white px-[11px] py-[11px]">
              <h2 className="mb-[10px] text-[15px] font-bold leading-none text-[#171717]">
                Pochta bildirishnomalari
              </h2>

              <div className="mb-[9px] flex items-center gap-[7px]">
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`relative h-[16px] w-[30px] shrink-0 rounded-full transition ${notifications ? "bg-[#407BFF]" : "bg-[#E8EBF0]"
                    }`}
                  aria-label="Bildirishnomalarni yoqish"
                >
                  <span
                    className={`absolute top-[3px] h-[10px] w-[10px] rounded-full bg-white shadow-sm transition ${notifications ? "left-[17px]" : "left-[3px]"
                      }`}
                  />
                </button>

                <span className="text-[13px] font-normal leading-none text-[#596273]">
                  Bildirishnomalarni qabul qilish
                </span>
              </div>

              <button
                type="button"
                className="flex h-[43px] w-[120px] items-center justify-center gap-[5px] rounded-[5px] bg-[#407BFF] px-[12px] text-[12px] font-medium text-white transition hover:bg-[#306BEF]"
              >
                <Check size={11} strokeWidth={2.5} />
                Saqlash
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}