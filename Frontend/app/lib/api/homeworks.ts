import { baseAPI } from "@/app/lib/utils";

export interface Homework {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  file: string[];
  created_at: string;
  updated_at: string;
}

export async function getHomeworks(): Promise<Homework[]> {
  const { data } = await baseAPI.get("/homeworks/mine");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.result) ? data.result : [];
}

export async function getHomeworkById(id: number | string): Promise<Homework> {
  const { data } = await baseAPI.get(`/homeworks/${id}`);
  return data?.data || data?.result || data;
}

export async function createHomework(homeworkData: FormData | Record<string, unknown>): Promise<Homework> {
  const { data } = await baseAPI.post("/homeworks", homeworkData);
  return data?.data || data?.result || data;
}

export async function updateHomework(id: number | string, homeworkData: FormData | Record<string, unknown>): Promise<Homework> {
  const { data } = await baseAPI.patch(`/homeworks/${id}`, homeworkData);
  return data?.data || data?.result || data;
}

export async function deleteHomework(id: number | string): Promise<void> {
  await baseAPI.delete(`/homeworks/${id}`);
}
