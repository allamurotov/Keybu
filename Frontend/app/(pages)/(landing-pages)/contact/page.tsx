"use client";

import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { baseAPI } from "@/app/lib/utils"; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface FormData {
  fullName: string;
  countryCode: string;
  phone: string;
  message: string;
}

const countryOptions = [
  { code: "UZ", prefix: "+998", flag: "🇺🇿", label: "O'zbekiston", minLength: 9 },
  { code: "RU", prefix: "+7", flag: "🇷🇺", label: "Rossiya", minLength: 10 },
  { code: "US", prefix: "+1", flag: "🇺🇸", label: "AQSH", minLength: 10 },
  { code: "KZ", prefix: "+7", flag: "🇰🇿", label: "Qozog'iston", minLength: 10 },
];

const contactTranslations = {
  "O'z": {
    badge: "Bog'lanish",
    title: "Savollaringiz bo'lsa murojaat qiling",
    phoneTitle: "Telefon",
    emailTitle: "Elektron pochta",
    addressTitle: "Manzil",
    addressValue: "Manzil shu yerda kiritiladi",
    fullNameLabel: "F.I.SH",
    fullNamePlaceholder: "Kiriting",
    phoneLabel: "Telefon raqamingiz",
    messageLabel: "Xabar",
    messagePlaceholder: "Xabaringizni yozing...",
    submit: "Yuborish",
    submitting: "Yuborilmoqda...",
    errFullNameEmpty: "Iltimos, F.I.SH.ingizni kiriting!",
    errFullNameMin: "Iltimos, to'liq ism-familiyangizni kiriting (kamida 3 ta belgi)!",
    errPhoneEmpty: "Iltimos, telefon raqamingizni kiriting!",
    errPhoneMin: (min: number) => `Telefon raqami noto'g'ri! Kamida ${min} ta raqam kiriting (masalan: 99 999 99 99).`,
    errMessageEmpty: "Iltimos, xabaringizni kiriting!",
    errMessageMin: "Xabar juda qisqa! Kamida 5 ta belgi yozing.",
    successMsg: "Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.",
  },
  "Рус": {
    badge: "Контакты",
    title: "Свяжитесь с нами, если у вас есть вопросы",
    phoneTitle: "Телефон",
    emailTitle: "Электронная почта",
    addressTitle: "Адрес",
    addressValue: "Адрес указывается здесь",
    fullNameLabel: "Ф.И.О.",
    fullNamePlaceholder: "Введите",
    phoneLabel: "Ваш номер телефона",
    messageLabel: "Сообщение",
    messagePlaceholder: "Напишите ваше сообщение...",
    submit: "Отправить",
    submitting: "Отправка...",
    errFullNameEmpty: "Пожалуйста, введите ваше Ф.И.О.!",
    errFullNameMin: "Пожалуйста, введите полное имя (минимум 3 символа)!",
    errPhoneEmpty: "Пожалуйста, введите ваш номер телефона!",
    errPhoneMin: (min: number) => `Неверный номер телефона! Введите минимум ${min} цифр.`,
    errMessageEmpty: "Пожалуйста, введите ваше сообщение!",
    errMessageMin: "Сообщение слишком короткое! Напишите минимум 5 символов.",
    successMsg: "Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.",
  },
  "Eng": {
    badge: "Contact Us",
    title: "Feel free to contact us if you have any questions",
    phoneTitle: "Phone",
    emailTitle: "Email address",
    addressTitle: "Address",
    addressValue: "Address is entered here",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter full name",
    phoneLabel: "Your Phone Number",
    messageLabel: "Message",
    messagePlaceholder: "Write your message...",
    submit: "Send Message",
    submitting: "Sending...",
    errFullNameEmpty: "Please enter your full name!",
    errFullNameMin: "Please enter your full name (at least 3 characters)!",
    errPhoneEmpty: "Please enter your phone number!",
    errPhoneMin: (min: number) => `Invalid phone number! Please enter at least ${min} digits.`,
    errMessageEmpty: "Please enter your message!",
    errMessageMin: "Message is too short! Write at least 5 characters.",
    successMsg: "Your message has been sent successfully! We will contact you soon.",
  },
};

export default function ContactPage() {
  const { selectedLang } = useLanguage();
  
  // Default holatda Oq (yorug') rejimda turadi
  const [isDark, setIsDark] = useState(false);

  // Navbarda tanlangan tilga mos matnlarni olish
  const langKey = (selectedLang && contactTranslations[selectedLang as keyof typeof contactTranslations]) 
    ? (selectedLang as keyof typeof contactTranslations) 
    : "O'z";
  const tr = contactTranslations[langKey];

  // Navbardagi Dark Mode tugmasi bosilganda isDark holatini almashtirish
  useEffect(() => {
    const handleDarkToggleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button[aria-label="Toggle dark mode"]');
      if (btn) {
        setIsDark((prev) => !prev);
      }
    };

    document.addEventListener("click", handleDarkToggleClick);
    return () => {
      document.removeEventListener("click", handleDarkToggleClick);
    };
  }, []);

  // isDark o'zgarganda to'liq ilovada va document elementda 'dark' sinfini sinxronlashtirish
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new Event("theme-change"));
  }, [isDark]);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    countryCode: "UZ",
    phone: "",
    message: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  // Harf yozishni taqiqlash va faqat raqamlarni qabul qilish
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, "");
    const truncatedDigits = digitsOnly.slice(0, 12);

    setFormData((prev) => ({ ...prev, phone: truncatedDigits }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSelectCountry = (country: typeof countryOptions[0]) => {
    setSelectedCountry(country);
    setFormData((prev) => ({ ...prev, countryCode: country.code }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. F.I.SH tekshiruvi
    if (!formData.fullName.trim()) {
      setErrorMessage(tr.errFullNameEmpty);
      return;
    }

    if (formData.fullName.trim().length < 3) {
      setErrorMessage(tr.errFullNameMin);
      return;
    }

    // 2. Telefon raqami tekshiruvi
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      setErrorMessage(tr.errPhoneEmpty);
      return;
    }

    if (cleanPhone.length < selectedCountry.minLength) {
      setErrorMessage(tr.errPhoneMin(selectedCountry.minLength));
      return;
    }

    // 3. Xabar tekshiruvi
    if (!formData.message.trim()) {
      setErrorMessage(tr.errMessageEmpty);
      return;
    }

    if (formData.message.trim().length < 5) {
      setErrorMessage(tr.errMessageMin);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Oddiy axios.post(...) o'rniga:
      await baseAPI.post("/comments", {
        fullName: formData.fullName.trim(),
        phone: `${selectedCountry.prefix}${cleanPhone}`,
        message: formData.message.trim(),
      });

      setIsSubmitted(true);
      setFormData({
        fullName: "",
        countryCode: selectedCountry.code,
        phone: "",
        message: "",
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error: any) {
      console.error("Murojaat yuborishda xatolik:", error);
      const serverError = error?.response?.data?.message;
      setErrorMessage(
        Array.isArray(serverError)
          ? serverError.join(", ")
          : serverError || "Xabar yuborishda xatolik yuz berdi. Qayta urinib ko'ring."
      );
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <div
      className={`w-full min-h-screen py-12 md:py-16 transition-colors duration-300 ${
        isDark ? "bg-[#0B0F17] text-white" : "bg-[#F8FAFC] text-[#0F172A]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Info Cards Section */}
        <div>
          <div className="mb-8">
            <span className="text-[#3B81F4] font-medium text-sm block mb-1">
              {tr.badge}
            </span>
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                isDark ? "text-white" : "text-[#0F172A]"
              }`}
            >
              {tr.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone Card */}
            <div
              className={`rounded-2xl p-6 border transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col justify-between cursor-pointer ${
                isDark
                  ? "bg-[#181F2B] border-[#222A3A] shadow-sm hover:border-[#3B81F4]/50 hover:shadow-xl hover:shadow-blue-900/20"
                  : "bg-white border-slate-100/80 shadow-sm hover:shadow-md hover:border-slate-200"
              }`}
            >
              <div> 
                <div className="w-10 h-10 rounded-xl bg-[#3B81F4] flex items-center justify-center text-white mb-4 transition-transform group-hover:scale-105">
                  <Phone className="w-5 h-5" />
                </div>
                <h3
                  className={`font-semibold text-base mb-1 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {tr.phoneTitle}
                </h3>
                <p
                  className={`text-sm font-normal ${
                    isDark ? "text-[#8A99AD]" : "text-slate-500"
                  }`}
                >
                  +99899 999 99 99
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div
              className={`rounded-2xl p-6 border transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col justify-between cursor-pointer ${
                isDark
                  ? "bg-[#181F2B] border-[#222A3A] shadow-sm hover:border-[#3B81F4]/50 hover:shadow-xl hover:shadow-blue-900/20"
                  : "bg-white border-slate-100/80 shadow-sm hover:shadow-md hover:border-slate-200"
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#3B81F4] flex items-center justify-center text-white mb-4 transition-transform group-hover:scale-105">
                  <Mail className="w-5 h-5" />
                </div>
                <h3
                  className={`font-semibold text-base mb-1 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {tr.emailTitle}
                </h3>
                <p
                  className={`text-sm font-normal ${
                    isDark ? "text-[#8A99AD]" : "text-slate-500"
                  }`}
                >
                  info@kebyu.uz
                </p>
              </div>
            </div>

            {/* Address Card */}
            <div
              className={`rounded-2xl p-6 border transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col justify-between cursor-pointer ${
                isDark
                  ? "bg-[#181F2B] border-[#222A3A] shadow-sm hover:border-[#3B81F4]/50 hover:shadow-xl hover:shadow-blue-900/20"
                  : "bg-white border-slate-100/80 shadow-sm hover:shadow-md hover:border-slate-200"
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#3B81F4] flex items-center justify-center text-white mb-4 transition-transform group-hover:scale-105">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3
                  className={`font-semibold text-base mb-1 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {tr.addressTitle}
                </h3>
                <p
                  className={`text-sm font-normal ${
                    isDark ? "text-[#8A99AD]" : "text-slate-500"
                  }`}
                >
                  {tr.addressValue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div
          className={`rounded-2xl border p-6 md:p-12 max-w-3xl mx-auto transition-colors duration-300 ${
            isDark
              ? "bg-[#181F2B] border-[#222A3A] shadow-none"
              : "bg-white border-slate-100/80 shadow-sm"
          }`}
        >
          <div className="text-center mb-8">
            <span className="text-[#3B81F4] font-medium text-sm block mb-1">
              {tr.badge}
            </span>
            <h2
              className={`text-2xl md:text-3xl font-bold ${
                isDark ? "text-white" : "text-[#0F172A]"
              }`}
            >
              {tr.title}
            </h2>
          </div>

          {isSubmitted && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fadeIn ${
                isDark
                  ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <CheckCircle2
                className={`w-5 h-5 shrink-0 ${
                  isDark ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
              <p className="text-sm font-medium">{tr.successMsg}</p>
            </div>
          )}

          {errorMessage && (
            <div
              className={`mb-6 p-4 rounded-xl border text-sm font-medium animate-fadeIn ${
                isDark
                  ? "bg-rose-950/50 border-rose-800 text-rose-300"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* F.I.SH */}
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isDark ? "text-[#8A99AD]" : "text-slate-500"
                }`}
              >
                {tr.fullNameLabel}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={tr.fullNamePlaceholder}
                className={`w-full h-12 px-4 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-[#111621] border-[#222A3A] text-white placeholder-[#56657A] focus:ring-blue-500/40 focus:border-[#3B81F4]"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-[#3B81F4]/20 focus:border-[#3B81F4]"
                }`}
              />
            </div>

            {/* Telefon raqamingiz */}
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isDark ? "text-[#8A99AD]" : "text-slate-500"
                }`}
              >
                {tr.phoneLabel}
              </label>
              <div className="relative flex items-center">
                {/* Country selector dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`h-12 px-3 flex items-center gap-1.5 border border-r-0 rounded-l-xl text-sm font-medium transition-colors cursor-pointer ${
                      isDark
                        ? "border-[#222A3A] bg-[#111621] hover:bg-[#1A212D] text-[#CBD5E1]"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{selectedCountry.code}</span>
                    <ChevronDown
                      className={`w-4 h-4 ${
                        isDark ? "text-[#56657A]" : "text-slate-400"
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div
                      className={`absolute top-full left-0 mt-1 w-44 border rounded-xl shadow-lg z-20 py-1 overflow-hidden ${
                        isDark
                          ? "bg-[#181F2B] border-[#222A3A] text-[#CBD5E1]"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      {countryOptions.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelectCountry(country)}
                          className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors cursor-pointer ${
                            isDark ? "hover:bg-[#222A3A]" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span
                              className={`font-medium ${
                                isDark ? "text-[#CBD5E1]" : "text-slate-700"
                              }`}
                            >
                              {country.code}
                            </span>
                          </span>
                          <span
                            className={`text-xs ${
                              isDark ? "text-[#56657A]" : "text-slate-400"
                            }`}
                          >
                            {country.prefix}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone input */}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={selectedCountry.prefix}
                  className={`w-full h-12 px-4 rounded-r-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-[#111621] border-[#222A3A] text-white placeholder-[#56657A] focus:ring-blue-500/40 focus:border-[#3B81F4]"
                      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-[#3B81F4]/20 focus:border-[#3B81F4]"
                  }`}
                />
              </div>
            </div>

            {/* Xabar */}
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isDark ? "text-[#8A99AD]" : "text-slate-500"
                }`}
              >
                {tr.messageLabel}
              </label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                placeholder={tr.messagePlaceholder}
                className={`w-full p-4 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                  isDark
                    ? "bg-[#111621] border-[#222A3A] text-white placeholder-[#56657A] focus:ring-blue-500/40 focus:border-[#3B81F4]"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-[#3B81F4]/20 focus:border-[#3B81F4]"
                }`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#3B81F4] hover:bg-blue-600 disabled:opacity-70 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tr.submitting}</span>
                </>
              ) : (
                <span>{tr.submit}</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
