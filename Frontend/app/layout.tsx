import ToastAndModal from "@/components/toast";
import ThemeRegistry from "@/app/components/ThemeRegistry";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Kebyu LMS — Zamonaviy IT Kasblar Maktabi",
  description:
    "Dasturlash, UI/UX Dizayn, Kiberxavfsizlik va Data Science bo'yicha amaliy IT kurslar va karyera markazi.",
  keywords: [
    "Kebyu LMS",
    "Dasturlash kursi",
    "Frontend",
    "Backend",
    "UI/UX Dizayn",
    "Toshkent IT maktab",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="scroll-smooth min-h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen antialiased flex flex-col selection:bg-blue-600 selection:text-white bg-white dark:bg-[#0A0E17] transition-colors duration-200`}
      >
        <ThemeRegistry>
          {children}
          <ToastAndModal />
        </ThemeRegistry>
      </body>
    </html>
  );
}
