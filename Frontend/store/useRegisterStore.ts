import { create } from "zustand";

interface RegisterFormData {
  fullName: string;
  phone: string;
  password?: string;
}

interface RegisterState {
  formData: RegisterFormData;
  setFormData: (data: Partial<RegisterFormData>) => void;
  resetFormData: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
  formData: {
    fullName: "",
    phone: "",
    password: "",
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetFormData: () =>
    set({ formData: { fullName: "", phone: "", password: "" } }),
}));