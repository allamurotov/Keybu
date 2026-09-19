import { create } from "zustand";
import { baseAPI, clearAppCache } from "@/app/lib/utils";

export interface Category {
  id: number;
  name: string;
}

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  addCategory: (data: { name: string }) => Promise<void>;
  updateCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,

  // ==========================================
  // GET ALL CATEGORIES
  // GET /api/v1/categories
  // ==========================================
  fetchCategories: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await baseAPI.get("/categories");

      console.log("GET CATEGORIES RESPONSE:", response.data);

      set({
        categories: response.data.data,
        loading: false,
      });
    } catch (error: any) {
      console.error("GET CATEGORIES ERROR:", error);

      set({
        loading: false,
        error:
          error?.response?.data?.message ||
          "Kategoriyalarni olishda xatolik yuz berdi",
      });

      throw error;
    }
  },

  // ==========================================
  // CREATE CATEGORY
  // POST /api/v1/categories
  // ==========================================
  addCategory: async (data) => {
    try {
      console.log("CREATE CATEGORY BODY:", data);

      const response = await baseAPI.post("/categories", data);

      console.log("CREATE CATEGORY RESPONSE:", response.data);

      const newCategory = response.data.data;

      set((state) => ({
        categories: [...state.categories, newCategory],
      }));

      // courses/categories cache tozalash
      clearAppCache();
    } catch (error: any) {
      console.error("CREATE CATEGORY ERROR:", error);

      throw error;
    }
  },

  // ==========================================
  // UPDATE CATEGORY
  // PATCH /api/v1/categories/:id
  // ==========================================
  updateCategory: async (id, name) => {
    try {
      console.log("UPDATE CATEGORY ID:", id);
      console.log("UPDATE CATEGORY BODY:", { name });

      const response = await baseAPI.patch(`/categories/${id}`, {
        name,
      });

      console.log("UPDATE CATEGORY RESPONSE:", response.data);

      const updatedCategory = response.data.data;

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category
        ),
      }));

      // cache tozalash
      clearAppCache();
    } catch (error: any) {
      console.error("UPDATE CATEGORY ERROR:", error);

      throw error;
    }
  },

  // ==========================================
  // DELETE CATEGORY
  // DELETE /api/v1/categories/:id
  // ==========================================
  deleteCategory: async (id) => {
    try {
      console.log("DELETE CATEGORY ID:", id);

      const response = await baseAPI.delete(`/categories/${id}`);

      console.log("DELETE CATEGORY RESPONSE:", response.data);

      set((state) => ({
        categories: state.categories.filter(
          (category) => category.id !== id
        ),
      }));

      // cache tozalash
      clearAppCache();
    } catch (error: any) {
      console.error("DELETE CATEGORY ERROR:", error);

      throw error;
    }
  },
}));