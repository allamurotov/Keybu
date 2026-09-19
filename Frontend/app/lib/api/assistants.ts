import axios from "axios";
import { baseAPI } from "@/app/lib/utils";
import { Status } from "./status";

export interface Assistant {
  id: number;
  fullName: string;
  phone: string;
  file?: string | null;
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

export async function getAssistants(status: Status = "ACTIVE"): Promise<Assistant[]> {
  const { data } = await baseAPI.get("/user/assistant", { params: { status } });
  return unwrapList<Assistant>(data);
}

export async function createAssistant(formData: FormData) {
  try {
    const { data } = await baseAPI.post("/user/assistant", formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function updateAssistant(id: number, formData: FormData) {
  try {
    const { data } = await baseAPI.patch(`/user/assistant/${id}`, formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function archiveAssistant(id: number) {
  const { data } = await baseAPI.patch(`/user/assistant/${id}/archive`);
  return data;
}
 
export async function restoreAssistant(id: number) {
  const { data } = await baseAPI.patch(`/user/assistant/${id}/restore`);
  return data;
}
 
export async function deleteAssistant(id: number) {
  const { data } = await baseAPI.delete(`/user/assistant/${id}`);
  return data;
}
