import axios from "axios";
import { baseAPI } from "@/app/lib/utils";
import { Status } from "./status";

export interface CourseAssistantUser {
  id: number;
  fullName: string;
  phone: string;
  file?: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CourseAssistantLink {
  id: number;
  courseId: number;
  userId: number;
  status: Status;
  created_at: string;
  updated_at: string;
  user: CourseAssistantUser;
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

export async function getCourseAssistants(
  status: Status = "ACTIVE",
): Promise<CourseAssistantLink[]> {
  const { data } = await baseAPI.get("/course-assistant", {
    params: { status },
  });
  return unwrapList<CourseAssistantLink>(data);
}

export async function createCourseAssistant(courseId: number, userId: number) {
  try {
    const { data } = await baseAPI.post("/course-assistant", {
      courseId,
      userId,
    });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function updateCourseAssistant(
  id: number,
  payload: { courseId?: number; userId?: number; status?: Status },
) {
  try {
    const { data } = await baseAPI.patch(`/course-assistant/${id}`, payload);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function deleteCourseAssistant(id: number) {
  const { data } = await baseAPI.delete(`/course-assistant/${id}`);
  return data;
}

export async function archiveCourseAssistant(id: number) {
  return updateCourseAssistant(id, { status: "INACTIVE" });
}

export async function restoreCourseAssistant(id: number) {
  return updateCourseAssistant(id, { status: "ACTIVE" });
}
