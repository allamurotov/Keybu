import { baseAPI } from "@/app/lib/utils";

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  fullName: string;
}

export interface Course {
  id: number;
  teacherId: number | null;
  banner: string;
  introVideo?: string | null;
  name: string;
  description: string;
  level: string;
  price: number | string;
  categoryId: number;
  created_at: string;
  updated_at: string;
  categories?: Category;
  user?: User | null;
  sections?: unknown[];
  
  // Fields that might be added by backend based on dashboard requirements
  status?: string;
  studentsCount?: number;
  assistant?: string;
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

let coursesCache: Course[] | null = null;
let coursesPromise: Promise<Course[]> | null = null;

export async function getCourses(): Promise<Course[]> {
  if (coursesCache) return coursesCache;
  if (coursesPromise) return coursesPromise;

  coursesPromise = baseAPI
    .get("/courses")
    .then((res) => {
      const data = unwrapList<Course>(res.data);
      coursesCache = data;
      return data;
    })
    .catch((err) => {
      coursesPromise = null;
      throw err;
    });

  return coursesPromise;
}

export function clearCoursesCache() {
  coursesCache = null;
  coursesPromise = null;
}

export async function getCourseById(id: number | string): Promise<Course> {
  const { data } = await baseAPI.get(`/courses/${id}`);
  return data.data || data;
}

export async function createCourse(courseData: FormData | Record<string, unknown>): Promise<Course> {
  const { data } = await baseAPI.post("/courses", courseData);
  return data.data || data;
}

export async function updateCourse(id: number | string, courseData: FormData | Record<string, unknown>): Promise<Course> {
  const { data } = await baseAPI.patch(`/courses/${id}`, courseData);
  return data.data || data;
}

export async function deleteCourse(id: number | string): Promise<void> {
  await baseAPI.delete(`/courses/${id}`);
}