import axios from "axios";
import { baseAPI } from "@/app/lib/utils";
import { Status } from "./status";

export interface Payment {
  id: number;
  userId: number;
  courseId: number;
  amount: number | null;
  status: boolean;
  isActive: Status;
  created_at: string;
  updated_at: string;
  user?: { id: number; fullName: string; phone: string; file?: string | null };
  course?: {
    id: number;
    name: string;
    price: number;
    categoryId: number;
    categories?: { id: number; name: string };
  };
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

export async function getPayments(
  isActive: Status = "ACTIVE",
): Promise<Payment[]> {
  const { data } = await baseAPI.get("/payments", { params: { isActive } });
  return unwrapList<Payment>(data);
}

export async function createPayment(userId: number, courseId: number) {
  try {
    const { data } = await baseAPI.post("/payments", { userId, courseId });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function updatePayment(
  id: number,
  payload: {
    userId?: number;
    courseId?: number;
    status?: boolean;
    isActive?: Status;
  },
) {
  try {
    const { data } = await baseAPI.patch(`/payments/admin/${id}`, payload);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("BACKEND ERROR:", err.response?.status, err.response?.data);
    }
    throw err;
  }
}

export async function archivePayment(id: number) {
  return updatePayment(id, { isActive: "INACTIVE" });
}

export async function restorePayment(id: number) {
  return updatePayment(id, { isActive: "ACTIVE" });
}

export async function deletePayment(id: number) {
  const { data } = await baseAPI.delete(`/payments/admin/${id}`);
  return data;
}
