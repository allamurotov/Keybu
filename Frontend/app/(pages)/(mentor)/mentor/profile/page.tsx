"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Check, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { baseAPI, API_URL } from "@/app/lib/utils";

export default function MentorProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");

  // Personal Info State
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mentor Info State
  const [profession, setProfession] = useState("Full Stack Mentor");
  const [experience, setExperience] = useState("3");
  const [about, setAbout] = useState("Dasturlash va zamonaviy texnologiyalar o'qituvchisi");
  const [socials, setSocials] = useState({
    telegram: "https://t.me",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    website: "https://keybu.uz",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await baseAPI.get("/profile");
      const user = res.data?.data || res.data;
      if (user) {
        setFullName(user.fullName || "");
        setPhone(user.phone || "");
        setEmail(user.email || "");
        if (user.file) {
          setProfileImage(user.file.startsWith("http") ? user.file : `${API_URL}/${user.file}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Profil ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (activeTab === "personal") {
        const formData = new FormData();
        formData.append("fullName", fullName);
        if (email) formData.append("email", email);
        if (phone) formData.append("phone", phone);
        if (selectedFile) {
          formData.append("avatar", selectedFile);
        }

        const res = await baseAPI.patch("/profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const user = res.data?.data || res.data;
        if (user?.file) {
          setProfileImage(user.file.startsWith("http") ? user.file : `${API_URL}/${user.file}`);
        }
        setSelectedFile(null);
        setSuccessMessage("Profil muvaffaqiyatli saqlandi!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("Ma'lumotlar saqlandi!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setSelectedFile(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
      <h1 className="text-[24px] font-bold text-gray-900 mb-6">Profil sozlamalari</h1>

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2 max-w-4xl">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 max-w-4xl">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-start max-w-4xl">
        {/* Left Tabs */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("personal")}
            className={`text-left px-5 py-3 rounded-xl text-[14px] font-medium transition-colors cursor-pointer ${
              activeTab === "personal"
                ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            Shaxsiy ma'lumotlar
          </button>
          <button
            onClick={() => setActiveTab("mentor")}
            className={`text-left px-5 py-3 rounded-xl text-[14px] font-medium transition-colors cursor-pointer ${
              activeTab === "mentor"
                ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            Mentor ma'lumotlari
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 size={20} className="animate-spin text-blue-600" />
              Yuklanmoqda...
            </div>
          ) : (
            <>
              {/* TAB: Personal Info */}
              {activeTab === "personal" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  {/* Profile Image */}
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-[72px] h-[72px] rounded-full object-cover border border-gray-200" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/profile.svg";
                        }}
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        <User size={32} />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Rasm tanlash
                      </button>
                      {profileImage && (
                        <button 
                          onClick={handleRemoveImage}
                          className="px-4 py-2 bg-white border border-gray-200 text-red-500 text-[13px] font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Rasmni o'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-gray-900 mb-2">To'liq ism</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-gray-900 mb-2">Telefon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#407BFF] hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg text-[14px] font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <Check size={18} strokeWidth={2.5} />
                          Saqlash
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: Mentor Info */}
              {activeTab === "mentor" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Profession */}
                    <div className="flex-1 flex flex-col">
                      <label className="text-[13px] font-bold text-gray-900 mb-2">Kasb / Lavozim</label>
                      <input
                        type="text"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                      />
                    </div>

                    {/* Experience */}
                    <div className="flex-1 flex flex-col">
                      <label className="text-[13px] font-bold text-gray-900 mb-2">Tajriba (yil)</label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* About */}
                  <div className="flex flex-col border-b border-gray-100 pb-8">
                    <label className="text-[13px] font-bold text-gray-900 mb-2">O'zingiz haqingizda</label>
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="w-full px-4 py-3 min-h-[120px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors resize-y"
                    ></textarea>
                  </div>

                  {/* Socials */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 mb-1">Ijtimoiy tarmoqlar</h3>
                      <p className="text-[12px] text-gray-500">Har bir maydonga to'liq havola kiriting. Bo'sh qoldirsangiz bo'ladi.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                      <div className="flex flex-col">
                        <label className="text-[13px] font-bold text-gray-900 mb-2">Telegram</label>
                        <input
                          type="text"
                          value={socials.telegram}
                          onChange={(e) => setSocials({ ...socials, telegram: e.target.value })}
                          className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[13px] font-bold text-gray-900 mb-2">Instagram</label>
                        <input
                          type="text"
                          value={socials.instagram}
                          onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                          className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[13px] font-bold text-gray-900 mb-2">GitHub</label>
                        <input
                          type="text"
                          value={socials.github}
                          onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                          className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[13px] font-bold text-gray-900 mb-2">LinkedIn</label>
                        <input
                          type="text"
                          value={socials.linkedin}
                          onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                          className="w-full px-4 h-[48px] rounded-lg border border-gray-200 focus:border-[#407BFF] text-[14px] text-gray-900 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#407BFF] hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg text-[14px] font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      <Check size={18} strokeWidth={2.5} />
                      Saqlash
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

