import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FileQuestion size={40} className="text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Sahifa topilmadi
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
      </p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 bg-[#407BFF] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
