import CTASection from "../../components/landing/home/CTASection";
import Hero from "../../components/landing/home/Hero";
import JoinSection from "../../components/landing/home/JoinSection";
import Mentors from "../../components/landing/home/Mentors";
import PopularCourses from "../../components/landing/home/PopularCourses";
import Testimonials from "../../components/landing/home/Testimonials";

export default function Home() {
  return (
    <main className="bg-white dark:bg-[#0A0E17] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white relative transition-colors duration-200">
      <Hero />
      <PopularCourses />
      <JoinSection />
      <CTASection />
      <Mentors />
      <Testimonials />
    </main>
  );
}