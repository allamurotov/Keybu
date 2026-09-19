"use client";

import { useLanguage } from "../../../context/LanguageContext";

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "214px",
  height: "48px",
  minHeight: "48px",
  maxHeight: "48px",
  borderRadius: "8px",
  paddingTop: "20px",
  paddingBottom: "20px",
  paddingLeft: "24px",
  paddingRight: "24px",
  gap: "10px",
  color: "#FFFFFF",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: "15px",
  lineHeight: "100%",
  letterSpacing: 0,
  textDecoration: "none",
  cursor: "pointer",
  boxSizing: "border-box",
  flexShrink: 0,
};

export default function JoinSection() {
  const { t } = useLanguage();

  return (
    <section id="join-us" className="bg-[#FAFAFA] dark:bg-[#0B0F19] py-[60px] transition-colors duration-200">
      <div className="container">

        {/* Section Header */}
        <h2 className="font-bold text-[32px] leading-none tracking-normal text-[#0F172A] dark:text-white mb-[23px]">
          {t("join.title")}
        </h2>

        {/* Subtitle */}
        <p className="font-medium text-[15px] leading-none tracking-normal text-[#636C79] dark:text-[#94A3B8] mb-[23px]">
          {t("join.subtitle")}
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[23px]">

          {/* Card 1: Student */}
          <div className="bg-white dark:bg-[#151C28] p-5 rounded-lg border border-slate-200 dark:border-[#1E293B] flex flex-col gap-4 transition-colors duration-200">
            <h3 className="font-bold text-[24px] leading-none tracking-normal text-[#0F172A] dark:text-white m-0">
              {t("join.studentTitle")}
            </h3>

            <p className="font-medium text-[15px] leading-6 tracking-normal text-[#636C79] dark:text-[#94A3B8] m-0">
              {t("join.studentDesc")}
            </p>

            <a href="#courses" style={btnStyle} className="bg-blue-600 hover:bg-blue-700 transition-colors">
              {t("join.studentBtn")}
            </a>
          </div>

          {/* Card 2: Mentor */}
          <div className="bg-white dark:bg-[#151C28] p-5 rounded-lg border border-slate-200 dark:border-[#1E293B] flex flex-col gap-4 transition-colors duration-200">
            <h3 className="font-bold text-[24px] leading-none tracking-normal text-[#0F172A] dark:text-white m-0">
              {t("join.mentorTitle")}
            </h3>

            <p className="font-medium text-[15px] leading-6 tracking-normal text-[#636C79] dark:text-[#94A3B8] m-0">
              {t("join.mentorDesc")}
            </p>

            <a href="#mentor-apply" style={btnStyle} className="bg-blue-600 hover:bg-blue-700 transition-colors">
              {t("join.mentorBtn")}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}