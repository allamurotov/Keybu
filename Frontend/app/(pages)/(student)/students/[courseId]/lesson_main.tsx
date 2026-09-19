"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useProfileStore } from "@/store/useProfileStore";
import { getToken, baseAPI } from "@/app/lib/utils";
import CourseSidebar, { ModuleItem } from "../components/CourseSidebar";
import LessonPlayer, { Question, Material, Task, Exam } from "../components/LessonPlayer";
import { getCourseById } from "@/app/lib/api/courses";

export default function LessonMain({ courseId }: { courseId?: string }) {
  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";
  
  const [activeLessonId, setActiveLessonId] = useState<string | number>(initialLessonId);
  const [courseData, setCourseData] = useState<any>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { profile } = useProfileStore();

  // Exam state - bizning qo'shimcha
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // URL dan lessonId o'zgarganda
  useEffect(() => {
    const queryLessonId = searchParams.get("lessonId");
    if (queryLessonId) {
      setActiveLessonId(queryLessonId);
    }
  }, [searchParams]);

  // Socket setup (GitHub versiyasi)
  useEffect(() => {
    if (!courseId) return;
    
    // Fetch course details
    getCourseById(courseId).then((data: any) => {
      setCourseData(data);
      
      if (data.sections && Array.isArray(data.sections)) {
        const mappedModules: ModuleItem[] = data.sections.map((sec: any) => ({
          id: sec.id,
          title: sec.name,
          lessons: (sec.lessons || []).map((l: any) => ({
            id: l.id,
            title: l.name,
            duration: l.duration || "Batafsil", // Backend doesn't seem to have duration, fallback
            status: "current", // Assuming current for now, would need progress tracking
          })),
        }));
        setModules(mappedModules);
        
        // Auto-select first lesson if none active
        if (!activeLessonId && data.sections[0]?.lessons?.[0]) {
          setActiveLessonId(data.sections[0].lessons[0].id);
        }
      }
    }).catch(console.error);

    // Fetch comments for Q&A
    baseAPI.get(`/course-comments/${courseId}`).then((res) => {
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        const lessonComments = data.filter((c: any) => c.lessonId === Number(activeLessonId.toString().replace(/\D/g, "") || 0));
        const formattedQuestions: Question[] = lessonComments.map((c: any) => ({
          id: c.id.toString(),
          name: c.user?.fullName || "Student",
          text: c.text,
          date: new Date(c.created_at).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          avatarColor: "bg-blue-600",
          nameColor: "text-[#1a1a1a]",
          replies: (c.replies || []).map((r: any) => ({
            id: r.id.toString(),
            name: r.user?.fullName || "Foydalanuvchi",
            role: r.user?.role === "MENTOR" || r.user?.role === "ADMIN" ? "mentor" : undefined,
            text: r.text,
            date: new Date(r.created_at).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            avatarColor: r.user?.role === "MENTOR" ? "bg-[#1E293B]" : "bg-gray-500",
            nameColor: r.user?.role === "MENTOR" ? "text-blue-600" : "text-[#1a1a1a]",
          }))
        }));
        setQuestions(formattedQuestions);
      }
    }).catch(console.error);
  }, [courseId, activeLessonId]);

  useEffect(() => {
    if (courseData && activeLessonId) {
      let found = null;
      for (const sec of (courseData.sections || [])) {
        const l = (sec.lessons || []).find((x: any) => x.id.toString() === activeLessonId.toString());
        if (l) {
          found = l;
          break;
        }
      }
      setCurrentLesson(found);
    }
  }, [courseData, activeLessonId]);

  useEffect(() => {
    // Setup Socket
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const token = getToken("accessToken");

    const newSocket = io(`${socketUrl}/qa`, {
      transports: ["websocket"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("QA Socket connected");
      if (courseId && activeLessonId) {
        newSocket.emit("join_lesson", {
          courseId: Number(courseId),
          lessonId: Number(activeLessonId.toString().replace(/\D/g, "") || 0)
        });
      }
    });

    newSocket.on("new_question", (newComment: any) => {
      const q: Question = {
        id: newComment.id.toString(),
        name: newComment.user?.fullName || "Student",
        text: newComment.text,
        date: new Date(newComment.created_at).toLocaleString("uz-UZ", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
        avatarColor: "bg-blue-600",
        nameColor: "text-[#1a1a1a]",
        replies: [],
      };
      setQuestions((prev) => [q, ...prev]);
    });

    newSocket.on("new_reply", (newReply: any) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === newReply.parentId?.toString()) {
            return {
              ...q,
              replies: [
                ...(q.replies || []),
                {
                  id: newReply.id.toString(),
                  name: newReply.user?.fullName || "Foydalanuvchi",
                  role:
                    newReply.user?.role === "MENTOR" ||
                    newReply.user?.role === "ADMIN"
                      ? "mentor"
                      : undefined,
                  text: newReply.text,
                  date: new Date(newReply.created_at).toLocaleString("uz-UZ", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  }),
                  avatarColor:
                    newReply.user?.role === "MENTOR" ? "bg-[#1E293B]" : "bg-gray-500",
                  nameColor:
                    newReply.user?.role === "MENTOR"
                      ? "text-blue-600"
                      : "text-[#1a1a1a]",
                },
              ],
            };
          }
          return q;
        })
      );
    });

    newSocket.on("user_typing", ({ userId, isMentor }) => {
      if (isMentor) {
        // Handle mentor typing if needed
      }
    });

    setSocket(newSocket);

    return () => {
      if (courseId && activeLessonId) {
        newSocket.emit("leave_lesson", {
          courseId: Number(courseId),
          lessonId: Number(activeLessonId.toString().replace(/\D/g, "") || 0)
        });
      }
      newSocket.disconnect();
    };
  }, [courseId, activeLessonId]);

  // Imtihonlarni currentLesson dan yuklash
  useEffect(() => {
    if (currentLesson && currentLesson.exams && currentLesson.exams.length > 0) {
      setExamsLoading(true);
      const mapped: Exam[] = [
        {
          id: `exam-${currentLesson.id}`,
          title: `${currentLesson.name} — Imtihon`,
          level: "O'rta",
          difficulty: "Cheksiz",
          totalQuestions: currentLesson.exams.length,
          currentQuestion: 1,
          questions: currentLesson.exams.map((e: any) => ({
            id: String(e.id),
            question: e.questoin,
            options: [e.variantA, e.variantB, e.variantC, e.variantD],
            correctAnswer: [
              "variantA", "variantB", "variantC", "variantD",
            ].indexOf(e.answer),
          })),
        },
      ];
      setExams(mapped);
      setExamsLoading(false);
    } else {
      setExams([]);
      setExamsLoading(false);
    }
  }, [currentLesson]);

  const handleNextLesson = () => {
    let nextId = null;
    let foundCurrent = false;
    
    if (courseData && courseData.sections) {
      for (const sec of courseData.sections) {
        for (const l of (sec.lessons || [])) {
          if (foundCurrent) {
            nextId = l.id;
            break;
          }
          if (l.id.toString() === activeLessonId.toString()) {
            foundCurrent = true;
          }
        }
        if (nextId) break;
      }
    }
    
    if (nextId) {
      setActiveLessonId(nextId);
    }
  };

  const handleQuestionSubmit = async (text: string) => {
    if (socket && courseId) {
      socket.emit("send_question", {
        courseId: Number(courseId),
        lessonId: Number(activeLessonId.toString().replace(/\D/g, "") || 0),
        text,
        userId: profile?.id || 1,
      });
    }
  };

  const handleReplySubmit = async (parentId: string, text: string) => {
    if (socket && courseId) {
      socket.emit("send_reply", {
        courseId: Number(courseId),
        lessonId: Number(activeLessonId.toString().replace(/\D/g, "") || 0),
        parentId: Number(parentId),
        text,
        userId: profile?.id || 1,
      });
      socket.emit("stop_typing", {
        courseId: Number(courseId),
        lessonId: Number(activeLessonId.toString().replace(/\D/g, "") || 0)
      });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && courseId) {
      if (isTyping) {
        socket.emit("typing", {
          courseId: Number(courseId),
          lessonId: Number(activeLessonId.toString().replace(/\D/g, "") || 0),
          isMentor: false
        });
      } else {
        socket.emit("stop_typing", {
          courseId: Number(courseId),
          lessonId: Number(activeLessonId.toString().replace(/\D/g, "") || 0)
        });
      }
    }
  };

  const hasNextLesson = () => {
    let nextId = null;
    let foundCurrent = false;
    if (courseData && courseData.sections) {
      for (const sec of courseData.sections) {
        for (const l of (sec.lessons || [])) {
          if (foundCurrent) {
            nextId = l.id;
            break;
          }
          if (l.id.toString() === activeLessonId.toString()) {
            foundCurrent = true;
          }
        }
        if (nextId) break;
      }
    }
    return !!nextId;
  };

  const materials = (currentLesson?.materials || []).map((m: any) => ({
    id: m.id.toString(),
    name: m.title || "Material",
    type: "pdf"
  }));
  
  const tasks = (currentLesson?.homeworks || []).map((t: any) => ({
    id: t.id.toString(),
    title: t.title || "Uyga vazifa",
    description: t.description || "",
    fileName: t.file?.[0] || "",
    uploadInstructions: "Yuklash"
  }));
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://63.180.181.4:8080";
  let videoUrl = "";
  if (currentLesson?.file) {
    if (currentLesson.file.startsWith('http')) {
      videoUrl = currentLesson.file;
    } else {
      const cleanPath = currentLesson.file.replace(/^\/+/, '');
      videoUrl = cleanPath.startsWith('uploads/') 
        ? `${apiUrl}/${cleanPath}` 
        : `${apiUrl}/uploads/${cleanPath}`;
    }
  }

  return (
    <div className="flex gap-5 items-start h-full max-w-[1600px] mx-auto">
      <CourseSidebar 
        courseTitle={courseData?.name || "Yuklanmoqda..."} 
        modules={modules}
        activeLessonId={activeLessonId}
        onLessonChange={setActiveLessonId}
      />
      <div className="flex-1 overflow-y-auto h-full relative">
        <LessonPlayer
          lessonId={activeLessonId.toString().replace(/\D/g, "") || "0"}
          title={currentLesson?.name || "Dars yuklanmoqda..."}
          totalQuestions={questions.length}
          totalAnswers={questions.reduce(
            (acc, q) => acc + (q.replies?.length || 0), 0
          )}
          questions={questions}
          materials={materials}
          tasks={tasks}
          exams={exams}
          examsLoading={examsLoading}
          onNextLesson={handleNextLesson}
          hasNextLesson={hasNextLesson()}
          videoUrl={videoUrl}
          onSubmitQuestion={handleQuestionSubmit}
          onSubmitReply={handleReplySubmit}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
}
