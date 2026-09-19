import { baseAPI } from "@/app/lib/utils";

// Types
export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  user?: {
    fullName: string;
    file?: string;
  };
  teacher?: {
    fullName: string;
    file?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  courseId: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  sectionId: string;
  order: number;
  videoUrl?: string;
  duration?: number;
  materials?: Material[];
}

export interface Material {
  id: string;
  title: string;
  fileUrl: string;
  lessonId: string;
}

export interface MyCourse {
  course: Course;
  progress: number;
  lastAccessedAt: string;
}

// Student Service
export const studentService = {
  // Get my courses
  async getMyCourses(): Promise<MyCourse[]> {
    const response = await baseAPI.get("/students/my-courses");
    // Backend qaytaradi array sifatida, to'g'ridan-to'g'ri qaytaramiz
    return Array.isArray(response.data) ? response.data : [];
  },

  // Get course details with sections and lessons
  async getCourseDetails(courseId: string) {
    const response = await baseAPI.get(`/students/courses/${courseId}`);
    return response.data;
  },

  // Get lesson details
  async getLessonDetails(lessonId: string) {
    const response = await baseAPI.get(`/students/lessons/${lessonId}`);
    return response.data;
  },

  // Mark lesson as completed
  async markLessonCompleted(lessonId: string) {
    const response = await baseAPI.post(`/students/lessons/${lessonId}/complete`);
    return response.data;
  },

  // Update lesson progress
  async updateLessonProgress(lessonId: string, progress: number) {
    const response = await baseAPI.patch(`/students/lessons/${lessonId}/progress`, {
      progress,
    });
    return response.data;
  },
};
