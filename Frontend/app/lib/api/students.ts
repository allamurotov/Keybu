import { baseAPI } from "@/app/lib/utils";
import axios from "axios";
import { Status } from "./status";

export interface Student {
  id: number;
  fullName: string;
  phone: string;
  file?: string;
  role: string;
  status: Status;
  created_at: string;
  updated_at: string;
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

export async function getStudents(
  status: Status = "ACTIVE",
): Promise<Student[]> {
  const { data } = await baseAPI.get("/students", { params: { status } });
  return unwrapList<Student>(data);
}

export async function createStudent(formData: FormData) {
  console.log("createAdmin FormData:");
  for (const [key, value] of formData.entries()) {
    console.log(" ", key, "=", value);
  }

  try {
    const { data } = await baseAPI.post("/students", formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function updateStudent(id: number, formData: FormData) {
  try {
    const { data } = await baseAPI.patch(`/students/${id}`, formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function archiveStudent(id: number) {
  const { data } = await baseAPI.patch(`/students/${id}/archive`);
  return data;
}

export async function restoreStudent(id: number) {
  const { data } = await baseAPI.patch(`/students/${id}/restore`);
  return data;
}

export async function deleteStudent(id: number) {
  const { data } = await baseAPI.delete(`/students/${id}`);
  return data;
}

export async function getStudentCourseDetails(
  courseId: number | string,
): Promise<any> {
  const { data } = await baseAPI.get(`/students/my-courses/${courseId}`);
  return data;
}

export async function postCourseComment(
  courseId: number,
  text: string,
  parentId?: number,
): Promise<any> {
  const { data } = await baseAPI.post("/course-comments", {
    courseId,
    text,
    parentId,
  });
  return data;
}
