import { create } from 'zustand';

export type Category = {
  id: number;
  name: string;
};

interface CategoryState {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: number, name: string) => void;
  deleteCategory: (id: number) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [
    { id: 1, name: "Frontend dasturlash" },
    { id: 2, name: "Sun'iy intellekt" },
    { id: 3, name: "Web Dasturlash" },
  ],
  addCategory: (category) =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          id: state.categories.length > 0 ? Math.max(...state.categories.map((c) => c.id)) + 1 : 1,
          ...category,
        },
      ],
    })),
  updateCategory: (id, name) =>
    set((state) => ({
      categories: state.categories.map((cat) => (cat.id === id ? { ...cat, name } : cat)),
    })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    })),
}));
