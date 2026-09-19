import { baseAPI } from "@/app/lib/utils";

export interface Category {
  id: number;
  name: string;
}

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
  }
  return [];
}

let categoriesCache: Category[] | null = null;
let categoriesPromise: Promise<Category[]> | null = null;

export async function getCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;
  if (categoriesPromise) return categoriesPromise;

  categoriesPromise = baseAPI
    .get("/categories")
    .then((res) => {
      const data = unwrapList<Category>(res.data);
      categoriesCache = data;
      return data;
    })
    .catch((err) => {
      categoriesPromise = null;
      throw err;
    });

  return categoriesPromise;
}

export function clearCategoriesCache() {
  categoriesCache = null;
  categoriesPromise = null;
}
