import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const baseAPI = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- TOKEN MANAGEMENT ---

export function getToken(name: string = "accessToken"): string | null {
  if (typeof window === "undefined") return null;

  // Only check cookie, backend will manage it
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  const val = match ? decodeURIComponent(match[2]) : null;
  if (val === "undefined" || val === "null" || val === "") return null;
  return val;
}

export function setToken(name: string = "accessToken", value: string | undefined | null) {
  if (typeof window !== "undefined") {
    if (!value || value === "undefined" || value === "null") {
      removeToken(name);
      return;
    }
    // We set the cookie manually on the frontend domain so that Next.js middleware
    // and Axios interceptors can read it, bypassing cross-origin HTTP limitations.
    document.cookie = `${name}=${encodeURIComponent(value as string)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function removeToken(name: string = "accessToken") {
  if (typeof window === "undefined") return;

  // Clear frontend cookie manually in case backend doesn't clear it or for immediate UI update
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// --- AXIOS INTERCEPTORS ---

// Request Interceptor: Avtomatik Bearer Token biriktirish
baseAPI.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: 401 Unauthorized holatida tozalash va landing sahifasiga yo'naltirish
baseAPI.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl.endsWith("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      removeToken("accessToken");
      removeToken("refreshToken");
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/?clear_auth=true";
      }
    }

    return Promise.reject(error);
  },
);

// --- SIMPLE IN-MEMORY CACHING ---

let categoriesCache: any = null;
let categoriesPromise: Promise<any> | null = null;

export const fetchCategoriesCached = async () => {
  if (categoriesCache) return categoriesCache;
  if (categoriesPromise) return categoriesPromise;

  categoriesPromise = baseAPI
    .get("categories")
    .then((res) => {
      categoriesCache = res.data;
      return res.data;
    })
    .catch((err) => {
      categoriesPromise = null;
      throw err;
    });

  return categoriesPromise;
};

let coursesCache: any = null;
let coursesPromise: Promise<any> | null = null;

export const fetchCoursesCached = async () => {
  if (coursesCache) return coursesCache;
  if (coursesPromise) return coursesPromise;

  coursesPromise = baseAPI
    .get("courses")
    .then((res) => {
      coursesCache = res.data;
      return res.data;
    })
    .catch((err) => {
      coursesPromise = null;
      throw err;
    });

  return coursesPromise;
};

// Yangi kurs yoki kategoriya qo'shilganda keshni tozalash funksiyasi
export const clearAppCache = () => {
  categoriesCache = null;
  categoriesPromise = null;
  coursesCache = null;
  coursesPromise = null;
};
