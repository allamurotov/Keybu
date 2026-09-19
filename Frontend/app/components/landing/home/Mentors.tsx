"use client";

import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext"; // Path to’g’riligiga ishonch hosil qiling

interface Mentor {
  id: string;
  name: string;
  roleKey: string; // Dynamic i18n uchun
  avatar: string;
  socials: {
    telegram?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function Mentors() {
  const { t } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string>("istamov");

  const mentors: Mentor[] = [
    {
      id: "mentor1",
      name: "Sardor Azimov",
      roleKey: "mentors.roles.frontend",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      socials: { telegram: "#", instagram: "#", facebook: "#", linkedin: "#", github: "#" },
    },
    {
      id: "mentor2",
      name: "Javohir Toshpulatov",
      roleKey: "mentors.roles.backend",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      socials: { telegram: "#", instagram: "#", facebook: "#", linkedin: "#", github: "#" },
    },
    {
      id: "istamov",
      name: "Istamov Xurshid",
      roleKey: "mentors.roles.uiux",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      socials: { telegram: "#", instagram: "#", facebook: "#", linkedin: "#", github: "#" },
    },
    {
      id: "mentor4",
      name: "Elena Smirnova",
      roleKey: "mentors.roles.pm",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      socials: { telegram: "#", instagram: "#", facebook: "#", linkedin: "#", github: "#" },
    },
    {
      id: "mentor5",
      name: "Malika Rahimova",
      roleKey: "mentors.roles.dataScientist",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      socials: { telegram: "#", instagram: "#", facebook: "#", linkedin: "#", github: "#" },
    },
    {
      id: "mentor6",
      name: "Bobur Khasanov",
      roleKey: "mentors.roles.mobile",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      socials: { telegram: "#", instagram: "#", facebook: "#", linkedin: "#", github: "#" },
    },
  ];

  return (
    <section id="mentors" className="py-16 lg:py-20 bg-white dark:bg-[#0A0E17] overflow-hidden transition-colors duration-200">
      <div className="container mb-12">
        {/* Title */}
        <h2 className="text-center text-[#1C232C] dark:text-white font-bold text-[48px] leading-[60px] mb-4 transition-colors duration-200">
          {t("mentors.title")}
        </h2>

        {/* Subtitle */}
        <p className="text-center text-[#636C79] dark:text-[#94A3B8] font-medium text-[20px] leading-[30px] m-0 transition-colors duration-200">
          {t("mentors.subtitle")}
        </p>
      </div>

      {/* Full width horizontal carousel / strip */}
      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div
          className="flex items-center justify-start xl:justify-center"
          style={{ gap: "32px", paddingLeft: "32px", paddingRight: "32px", width: "max-content", margin: "0 auto" }}
        >
          {mentors.map((m) => {
            const isHovered = hoveredId === m.id;
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredId(m.id)}
                className="relative overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 group"
                style={{
                  width: "405px",
                  height: "500px",
                  borderRadius: "4px",
                }}
              >
                {/* Mentor Photo */}
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Gradient Overlay & Data */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                  {/* Name */}
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "20px",
                      lineHeight: "120%",
                      color: "#FFFFFF",
                      marginBottom: "6px",
                    }}
                  >
                    {m.name}
                  </div>

                  {/* Role */}
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0px",
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "16px",
                    }}
                  >
                    {t(m.roleKey)}
                  </div>

                  {/* Social Accounts */}
                  <div className="flex items-center gap-3 text-white/80">
                    {m.socials.telegram && (
                      <a href={m.socials.telegram} className="hover:text-white transition-colors" aria-label="Telegram">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                        </svg>
                      </a>
                    )}
                    {m.socials.instagram && (
                      <a href={m.socials.instagram} className="hover:text-white transition-colors" aria-label="Instagram">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                        </svg>
                      </a>
                    )}
                    {m.socials.facebook && (
                      <a href={m.socials.facebook} className="hover:text-white transition-colors" aria-label="Facebook">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {m.socials.linkedin && (
                      <a href={m.socials.linkedin} className="hover:text-white transition-colors" aria-label="LinkedIn">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
                        </svg>
                      </a>
                    )}
                    {m.socials.github && (
                      <a href={m.socials.github} className="hover:text-white transition-colors" aria-label="GitHub">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}