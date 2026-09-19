import { LanguageProvider } from "@/app/context/LanguageContext";
import Footer from "@/app/components/landing/home/Footer";
import Navbar from "@/app/components/landing/home/Navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </LanguageProvider>
  );
}