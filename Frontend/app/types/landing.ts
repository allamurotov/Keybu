export interface Course {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  image: string;
  mentor: {
    name: string;
    avatar: string;
  };
  rating: number;
  ratingCount: string;
  price: string;
  description: string;
  category: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  socials: {
    telegram?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
}
