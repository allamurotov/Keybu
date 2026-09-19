import { baseAPI } from "@/app/lib/utils";
import { Status } from "./status";
import axios from "axios";

export interface Mentor {
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

export async function getMentors(status: Status = "ACTIVE"): Promise<Mentor[]> {
  const { data } = await baseAPI.get("/mentors", { params: { status } });
  return unwrapList<Mentor>(data);
}

export async function getMentorById(id: number | string): Promise<Mentor> {
  const { data } = await baseAPI.get(`/mentors/${id}`);
  return data.data || data;
}

export async function createMentor(formData: FormData) {
  console.log("createAdmin FormData:");
  for (const [key, value] of formData.entries()) {
    console.log(" ", key, "=", value);
  }

  try {
    const { data } = await baseAPI.post("/mentors", formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function updateMentor(id: number, formData: FormData) {
  try {
    const { data } = await baseAPI.patch(`/mentors/${id}`, formData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function archiveMentor(id: number) {
  const { data } = await baseAPI.patch(`/mentors/${id}/archive`);
  return data;
}

export async function restoreMentor(id: number) {
  const { data } = await baseAPI.patch(`/mentors/${id}/restore`);
  return data;
}

export async function deleteMentor(id: number) {
  const { data } = await baseAPI.delete(`/mentors/${id}`);
  return data;
}
