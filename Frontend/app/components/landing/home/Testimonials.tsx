"use client";

import { useLanguage } from "../../../context/LanguageContext"; // Path to’g’riligiga ishonch hosil qiling

interface Testimonial {
  id: string;
  name: string;
  roleKey: string;
  commentKey: string;
}

export default function Testimonials() {
  const { t } = useLanguage();

  const reviews: Testimonial[] = [
    {
      id: "1",
      name: "Xurshid Istamov",
      roleKey: "testimonials.items.1.role",
      commentKey: "testimonials.items.1.comment",
    },
    {
      id: "2",
      name: "Xurshid Istamov",
      roleKey: "testimonials.items.2.role",
      commentKey: "testimonials.items.2.comment",
    },
    {
      id: "3",
      name: "Xurshid Istamov",
      roleKey: "testimonials.items.3.role",
      commentKey: "testimonials.items.3.comment",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-[#0A0E17] transition-colors duration-200">
      <div className="container">

        {/* Title */}
        <h2 className="text-center font-bold text-[48px] leading-[60px] tracking-normal text-[#0F172A] dark:text-white mb-3">
          {t("testimonials.title")}
        </h2>

        {/* Subtitle */}
        <p className="text-center font-medium text-[20px] leading-[30px] tracking-normal text-[#636C79] dark:text-[#94A3B8] mb-[48px]">
          {t("testimonials.subtitle")}
        </p>

        {/* 3 Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#151C28] border border-slate-200 dark:border-[#1E293B] p-8 rounded-[16px] flex flex-col justify-between min-h-[320px] transition-colors duration-200"
            >
              <div>
                {/* Orange Double Quote SVG Icon */}
                <div className="mb-5">
                  <svg
                    width="44"
                    height="32"
                    viewBox="0 0 44 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 32V18.2857C0 12.5714 1.84615 7.61905 5.53846 3.42857C9.38462 0.761905 13.6923 -0.380952 18.4615 0.000001V7.61905C15.2308 7.61905 12.6923 8.66667 10.8462 10.7619C9 12.8571 8.07692 15.3651 8.07692 18.2857H18.4615V32H0ZM25.5385 32V18.2857C25.5385 12.5714 27.3846 7.61905 31.0769 3.42857C34.9231 0.761905 39.2308 -0.380952 44 0.000001V7.61905C40.7692 7.61905 38.2308 8.66667 36.3846 10.7619C34.5385 12.8571 33.6154 15.3651 33.6154 18.2857H44V32H25.5385Z"
                      fill="#FF5722"
                    />
                  </svg>
                </div>

                {/* Comment Text */}
                <p className="font-medium text-[15px] leading-6 text-[#1E293B] dark:text-slate-200 m-0">
                  {t(rev.commentKey)}
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-8">
                <div className="font-bold text-[16px] leading-snug text-[#0F172A] dark:text-white">
                  {rev.name}
                </div>
                <div className="font-medium text-[13px] leading-snug text-[#94A3B8] mt-1">
                  {t(rev.roleKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}