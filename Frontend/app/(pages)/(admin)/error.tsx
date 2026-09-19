"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Xatolik yuz berdi
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Kutilmagan xatolik tufayli ushbu sahifani yuklab bo'lmadi. Iltimos, qaytadan urinib ko'ring yoki birozdan so'ng qayta kiring.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-[#407BFF] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <RefreshCcw size={18} />
        Qaytadan urinish
      </button>
    </div>
  );
}
