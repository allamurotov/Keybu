"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import axios from "axios";

export async function createComment(courseId: string, formData: FormData) {
  const content = formData.get("commentContent") as string;

  if (!content || content.trim().length === 0) {
    return { error: "Fikringizni yozing..." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return { error: "Tizimga kirmagansiz." };
    }

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/course-comments`,
      {
        courseId: parseInt(courseId),
        text: content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    revalidatePath(`/courses/${courseId}`);

    return { success: true };
  } catch (error) {
    console.error("Error creating comment", error);
    return { error: "Xatolik yuz berdi. Qaytadan urinib ko’ring." };
  }
}
