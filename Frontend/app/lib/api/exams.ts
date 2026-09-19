import { baseAPI } from "@/app/lib/utils";

export interface Exam {
  id: number;
  lessonId: number;
  questoin: string; // Misspelled in backend schema, mapped here for consistency
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  answer: string; // Enum TestAnswer in backend (variantA, variantB, variantC, variantD)
  created_at: string;
  updated_at: string;
}

export async function getExams(lessonId?: number | string): Promise<Exam[]> {
  const url = lessonId ? `/exam?lessonId=${lessonId}` : "/exam";
  const { data } = await baseAPI.get(url);
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.result) ? data.result : [];
}

export async function getExamById(id: number | string): Promise<Exam> {
  const { data } = await baseAPI.get(`/exam/${id}`);
  return data?.data || data?.result || data;
}

export async function createExam(examData: Record<string, unknown>): Promise<Exam> {
  const { data } = await baseAPI.post("/exam", examData);
  return data?.data || data?.result || data;
}

export async function updateExam(id: number | string, examData: Record<string, unknown>): Promise<Exam> {
  const { data } = await baseAPI.patch(`/exam/${id}`, examData);
  return data?.data || data?.result || data;
}

export async function deleteExam(id: number | string): Promise<void> {
  await baseAPI.delete(`/exam/${id}`);
}
