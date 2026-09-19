import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
interface CourseCardProps {
  id: number;
  title: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  progress: number;
  category?: string;
  isLiked?: boolean;
  onLike?: () => void;
}

export default function CourseCard({
  id,
  title,
  instructor,
  instructorAvatar,
  thumbnail,
  progress,
  category = "UI/UX Dizayn",
  isLiked = false,
  onLike,
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Course thumbnail */}
      <Link href={`/students/${id}`} className="block relative aspect-video overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          unoptimized
          className="object-cover hover:scale-105 transition-transform duration-300"
          style={{ objectPosition: 'center 20%' }}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-[#10B981] text-white text-xs font-semibold rounded-full shadow-lg">
            {category}
          </span>
        </div>
      </Link>

      {/* Course info */}
      <div className="p-4">
        {/* Instructor */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {instructorAvatar ? (
              <Image
                src={instructorAvatar}
                alt={instructor}
                width={25}
                height={25}
                unoptimized
                className="rounded-full object-cover h-[25px] w-[25px]"
              />
            ) : (
              <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-400">
                <User size={14} />
              </div>
            )}
            <span className="text-xs font-medium text-[#64748B]">{instructor}</span>
          </div>
          <button
            onClick={onLike}
            className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="Like"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isLiked ? "#EF4444" : "none"}
              stroke={isLiked ? "#EF4444" : "#94A3B8"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        </div>

        {/* Course title */}
        <Link href={`/students/${id}`}>
          <h3 className="text-base font-bold text-[#1a1a1a] mb-3 hover:text-[#4F7FFF] transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>



        {/* Continue button */}
        <Link
          href={`/students/${id}`}
          className="w-full block text-center bg-[#4F7FFF] hover:bg-[#3D6EEE] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Ko&apos;rishni boshlash
        </Link>
      </div>
    </div>
  );
}
