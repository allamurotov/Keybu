"use client";

import { useToastStore } from "@/store/useToastStore";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function ToastAndModal() {
    const {
        isOpen,
        message,
        title,
        type,
        hideToast,
    } = useToastStore();

    if (!isOpen) return null;

    const config = {
        error: {
            bg: "bg-red-500",
            lightBg: "bg-red-50",
            borderColor: "border-red-200",
            textColor: "text-red-800",
            btnBg: "bg-red-600 hover:bg-red-700",
            icon: <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />,
            toastIcon: <AlertCircle className="w-5 h-5 text-white shrink-0" />,
        },
        success: {
            bg: "bg-emerald-500",
            lightBg: "bg-emerald-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-800",
            btnBg: "bg-emerald-600 hover:bg-emerald-700",
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />,
            toastIcon: <CheckCircle2 className="w-5 h-5 text-white shrink-0" />,
        },
        warning: {
            bg: "bg-amber-500",
            lightBg: "bg-amber-50",
            borderColor: "border-amber-200",
            textColor: "text-amber-800",
            btnBg: "bg-amber-600 hover:bg-amber-700",
            icon: <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />,
            toastIcon: <AlertTriangle className="w-5 h-5 text-white shrink-0" />,
        },
        info: {
            bg: "bg-blue-500",
            lightBg: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-800",
            btnBg: "bg-blue-600 hover:bg-blue-700",
            icon: <Info className="w-6 h-6 text-blue-500 shrink-0" />,
            toastIcon: <Info className="w-5 h-5 text-white shrink-0" />,
        },
    };

    return (
        <>
            {/* 1. TOAST (O’ng yuqori burchakda qalqib chiquvchi xabar) */}
            {isOpen && (
                <div className="fixed top-5 right-5 z-[9999] transition-all duration-300 animate-in fade-in slide-in-from-top-5">
                    <div
                        className={`flex items-start gap-3 p-4 rounded-xl shadow-lg text-white max-w-sm w-full ${config[type].bg}`}
                    >
                        {config[type].toastIcon}
                        <div className="flex-1 text-sm">
                            {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
                            <p className="text-white/90 leading-tight">{message}</p>
                        </div>
                        <button
                            onClick={hideToast}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}