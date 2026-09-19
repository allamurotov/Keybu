import { notFound } from "next/navigation";
import { CourseHero } from "@/app/components/course-details/course-hero";
import { CourseSidebar } from "@/app/components/course-details/course-sidebar";
import { AccordionList } from "@/app/components/course-details/accordion-list";
import { CommentsSection } from "@/app/components/course-details/comments-section";

const API_URL = process.env.BACKEND_URL || "http://63.180.181.4:8080";

interface PageProps {
  params: Promise<{ id?: string[] }>;
}

async function getCourseData(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/courses/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();

    let lessons: { id: number; sectionId: number; name: string; description?: string }[] = [];
    try {
      const lessonsRes = await fetch(`${API_URL}/api/v1/lessons`, { cache: "no-store" });
      if (lessonsRes.ok) {
        lessons = await lessonsRes.json();
      }
    } catch (e) {
      console.error("Failed to fetch lessons", e);
    }

    const mappedSections = (data.sections || []).map((section: { id: number; name: string }) => ({
      id: section.id,
      name: section.name,
      lessons: lessons
        .filter((l) => l.sectionId === section.id)
        .map((l) => ({
          id: l.id,
          title: l.name,
          description: l.description,
          duration: "10:00",
          isFree: false, // qulf turadi
        })),
    }));

    return {
      title: data.name,
      description: data.description,
      price: parseInt(data.price.toString().replace(/\s/g, ""), 10) || parseInt(data.price, 10) || 0,
      duration: "10 soat",
      studentsCount: 0,
      level: data.level || "Beginner",
      category: data.categories?.name,
      updatedAt: data.updated_at,
      cover: "bg-gradient-to-br from-indigo-600 to-violet-700",
      coverImg: data.banner ? `${API_URL}${data.banner.startsWith('/') ? '' : '/'}${data.banner}` : undefined,
      introVideo: data.introVideo ? `${API_URL}${data.introVideo.startsWith('/') ? '' : '/'}${data.introVideo}` : undefined,
      sections: mappedSections,
    };
  } catch (error) {
    console.error("Failed to fetch course details:", error);
    return null;
  }
}

export default async function CoursePage({ params }: PageProps) {
  const resolvedParams = await params;

  const courseId =
    Array.isArray(resolvedParams.id) && resolvedParams.id.length > 0
      ? resolvedParams.id[0]
      : "1";

  const course = await getCourseData(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0A0E17] pb-12 transition-colors duration-200">
      <CourseHero
        title={course.title}
        description={course.description}
        duration={course.duration}
        studentsCount={course.studentsCount}
        level={course.level}
        category={course.category}
        updatedAt={course.updatedAt}
        introVideo={course.introVideo}
      />

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:col-span-1">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-[#151C28] p-6 rounded-2xl shadow-sm border border-transparent dark:border-[#1E293B] transition-colors duration-200">
            <AccordionList sections={course.sections} />
          </section>

          <section className="bg-white dark:bg-[#151C28] p-6 rounded-2xl shadow-sm border border-transparent dark:border-[#1E293B] transition-colors duration-200">
            <CommentsSection courseId={courseId} />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="-mt-64 relative z-10">
            <CourseSidebar
              id={Number(courseId)}
              price={course.price}
              cover={course.cover}
              coverImg={course.coverImg}
              introVideo={course.introVideo}
              title={course.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}