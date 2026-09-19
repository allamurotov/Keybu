import { create } from "zustand";

export type ToastType = "error" | "success" | "warning" | "info";

interface ToastOptions {
  title?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastState {
  // Toast state
  isOpen: boolean;
  message: string;
  title?: string;
  type: ToastType;
  

  // Actions
  showToast: (message: string, options?: ToastOptions) => void;
  hideToast: () => void;
  
}

export const useToastStore = create<ToastState>((set) => ({
  // Initial Toast state
  isOpen: false,
  message: "",
  title: "",
  type: "error",


  showToast: (message, options) => {
    set({
      isOpen: true,
      message,
      title: options?.title || "",
      type: options?.type || "error",
    });

    // Avtomatik yopilish (default 4 soniya)
    setTimeout(() => {
      set({ isOpen: false });
    }, options?.duration || 4000);
  },

  hideToast: () => set({ isOpen: false }),

}));

// Yordamchi tezkor helper function (Toast uchun)
export const showToast = (message: string, options?: ToastOptions) => {
  useToastStore.getState().showToast(message, options);
};