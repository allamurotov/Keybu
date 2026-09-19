import { create } from "zustand";

export interface Course {
  id: number;
  banner: string;
  name: string;
  level: string;
  price: string;
  category: string;
  status: string;
}

interface MentorState {
  courses: Course[];
  addCourse: (course: Course) => void;
  fullName: string;
  profileImage: string | null;
  updateProfile: (name: string, image: string | null) => void;
}

export const useMentorStore = create<MentorState>((set) => ({
  courses: [
    {
      id: 1,
      banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CSS3_logo_and_wordmark.svg/1200px-CSS3_logo_and_wordmark.svg.png",
      name: "CSS",
      level: "ADVANCED",
      price: "1 200 000 so'm",
      category: "Dasturlash",
      status: "Faol",
    },
    {
      id: 2,
      banner: "https://miro.medium.com/v2/resize:fit:1200/1*y6C4nSvy2Woe0m7bWEn4BA.png",
      name: "Full Stack",
      level: "BEGINNER",
      price: "2 000 000 so'm",
      category: "Dasturlash",
      status: "Faol",
    },
  ],
  addCourse: (course) => set((state) => ({ courses: [course, ...state.courses] })),
  
  fullName: "Karl",
  profileImage: null,
  updateProfile: (name, image) => set({ fullName: name, profileImage: image }),
}));
