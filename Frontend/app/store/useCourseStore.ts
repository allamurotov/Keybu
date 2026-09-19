import { create } from 'zustand';

export interface Course {
  id: number;
  title: string;
  desc: string;
  price: number;
  level: string;
  categoryId: number; // mapped to useCategoryStore
  status: 'active' | 'inactive';
  cover?: string; // a class like "bg-gradient-to-br from-blue-400 to-indigo-500"
  studentsCount?: number;
  rating?: number;
  duration?: string;
  mentor?: string;
  assistant?: string;
  createdAt: string;
}

interface CourseState {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  updateCourse: (id: number, course: Partial<Course>) => void;
  deleteCourse: (id: number) => void;
  toggleCourseStatus: (ids: number[], status: 'active' | 'inactive') => void;
  assignAssistant: (id: number, assistant: string) => void;
  removeAssistant: (id: number) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [
    {
      id: 1,
      title: "Frontend dasturlash",
      desc: "SMM sohasini 0 dan o’rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
      price: 250000,
      level: "beginner",
      categoryId: 1, // Frontend dasturlash
      status: "active",
      cover: "bg-gradient-to-br from-blue-400 to-indigo-500",
      studentsCount: 113,
      rating: 4.6,
      duration: "20 soat 56 daqiqa",
      mentor: "Safarov Oybek",
      createdAt: "24.04.2024 14:01:25",
    },
    {
      id: 2,
      title: "Backend dasturlash",
      desc: "Bu kursda siz noldan boshlab backend dasturlashni o’rganasiz...",
      price: 500000,
      level: "advanced",
      categoryId: 3, // Web Dasturlash
      status: "inactive",
      cover: "bg-gradient-to-br from-orange-400 to-red-500",
      studentsCount: 89,
      rating: 4.2,
      duration: "24 soat 40 daqiqa",
      mentor: "Safarov Oybek",
      createdAt: "22.04.2024 10:15:00",
    }
  ],
  addCourse: (course) =>
    set((state) => ({
      courses: [
        {
          id: state.courses.length > 0 ? Math.max(...state.courses.map(c => c.id)) + 1 : 1,
          createdAt: new Date().toLocaleString('en-GB').replace(',', ''), // format DD/MM/YYYY HH:mm:ss
          ...course,
        },
        ...state.courses,
      ],
    })),
  updateCourse: (id, updatedFields) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === id ? { ...course, ...updatedFields } : course
      ),
    })),
  deleteCourse: (id) =>
    set((state) => ({
      courses: state.courses.filter((course) => course.id !== id),
    })),
  toggleCourseStatus: (ids, status) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        ids.includes(course.id) ? { ...course, status } : course
      ),
    })),
  assignAssistant: (id, assistant) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === id ? { ...course, assistant } : course
      ),
    })),
  removeAssistant: (id) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === id ? { ...course, assistant: undefined } : course
      ),
    })),
}));
