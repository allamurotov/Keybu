export interface Course {
  id: number;
  tag: string;
  tagColor: string;
  cover?: string;
  coverImg?: string;
  title: string;
  desc: string;
  rating: number;
  price: string;
  duration?: string;
  studentsCount?: number;
  level?: string;
}

export const coursesData: Course[] = [
  {
    id: 1,
    tag: "UI/UX Dizayn",
    tagColor: "bg-emerald-500",
    cover: "bg-gradient-to-br from-indigo-600 to-violet-700",
    title: "UI/UX Dizayn",
    desc: "SMM sohasini 0 dan o’rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000",
    duration: "18 soat 15 daqiqa",
    studentsCount: 142,
    level: "Beginner",
  },
  {
    id: 2,
    tag: "Frontend",
    tagColor: "bg-orange-500",
    coverImg:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    title: "Frontend dasturlash",
    desc: "SMM sohasini 0 dan o’rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.6,
    price: "750 000",
    duration: "20 soat 56 daqiqa",
    studentsCount: 255,
    level: "Middle",
  },
  {
    id: 3,
    tag: "Backend",
    tagColor: "bg-indigo-500",
    coverImg:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
    title: "Backend dasturlash",
    desc: "SMM sohasini 0 dan o’rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.2,
    price: "500 000",
    duration: "24 soat 40 daqiqa",
    studentsCount: 198,
    level: "Advanced",
  },
  {
    id: 4,
    tag: "Mobil",
    tagColor: "bg-blue-500",
    coverImg:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=600&q=80",
    title: "Mobil dasturlash",
    desc: "SMM sohasini 0 dan o’rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.8,
    price: "600 000",
    duration: "16 soat 20 daqiqa",
    studentsCount: 89,
    level: "Middle",
  },
  {
    id: 5,
    tag: "SMM",
    tagColor: "bg-purple-500",
    coverImg:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80",
    title: "SMM Dizayn",
    desc: "SMM sohasini 0 dan o’rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.0,
    price: "150 000",
    duration: "12 soat 05 daqiqa",
    studentsCount: 312,
    level: "Beginner",
  },
  {
    id: 6,
    tag: "Grafik dizayn",
    tagColor: "bg-pink-500",
    coverImg:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80",
    title: "Grafik Dizayn",
    desc: "SMM sohasini 0 dan o’rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "300 000",
    duration: "14 soat 50 daqiqa",
    studentsCount: 167,
    level: "Beginner",
  },
];
