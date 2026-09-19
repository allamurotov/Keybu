import axios from "axios";
import { baseAPI } from "@/app/lib/utils";
import { Status } from "./status";

export interface Admin {
  id: number;
  file?: string;
  fullName: string;
  phone: string;
  created_at: string;
  role: string;
  status: Status;
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

export async function getAdmins(status: Status = "ACTIVE"): Promise<Admin[]> {
  const { data } = await baseAPI.get("/user/admin", { params: { status } });
  return unwrapList<Admin>(data);
}

export async function createAdmin(formData: FormData) {
  console.log("createAdmin FormData:");
  for (const [key, value] of formData.entries()) {
    console.log(" ", key, "=", value);
  }

  try {
    const { data } = await baseAPI.post("/user/admin", formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function updateAdmin(id: number, formData: FormData) {
  try {
    const { data } = await baseAPI.patch(`/user/admin/${id}`, formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function archiveAdmin(id: number) {
  const { data } = await baseAPI.patch(`/user/admin/${id}/archive`);
  return data;
}

export async function restoreAdmin(id: number) {
  const { data } = await baseAPI.patch(`/user/admin/${id}/restore`);
  return data;
}

export async function deleteAdmin(id: number) {
  const { data } = await baseAPI.delete(`/user/admin/${id}`);
  return data;
}

export interface DashboardStats {
  dashboard: {
    ADMIN: number;
    MENTOR: number;
    ASSISTANT: number;
    STUDENT: number;
    totalCourses: number;
    [key: string]: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await baseAPI.get("/user/dashboard");
  return data;
}
