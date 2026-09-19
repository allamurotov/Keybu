import { baseAPI } from "@/app/lib/utils";

export interface Material {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  file: string[];
  created_at: string;
  updated_at: string;
}

export async function getMaterials(): Promise<Material[]> {
  const { data } = await baseAPI.get("/materials");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.result) ? data.result : [];
}

export async function getMaterialById(id: number | string): Promise<Material> {
  const { data } = await baseAPI.get(`/materials/${id}`);
  return data;
}

export async function createMaterial(materialData: FormData | Record<string, unknown>): Promise<Material> {
  const { data } = await baseAPI.post("/materials", materialData);
  return data;
}

export async function updateMaterial(id: number | string, materialData: FormData | Record<string, unknown>): Promise<Material> {
  const { data } = await baseAPI.patch(`/materials/${id}`, materialData);
  return data;
}

export async function deleteMaterial(id: number | string): Promise<void> {
  await baseAPI.delete(`/materials/${id}`);
}
