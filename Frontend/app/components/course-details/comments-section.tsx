"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { CommentForm } from "./comment-form";
import { useLanguage } from "@/app/context/LanguageContext";
import axios from "axios";

export function CommentsSection({ courseId }: { courseId: string }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/course-comments/${courseId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Error fetching comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        {t("courseDetail.discussionsCount")} {comments.length}
      </h3>

      <CommentForm courseId={courseId} onSuccess={fetchComments} />

      <div className="space-y-5 pt-2">
        {loading ? (
          <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">Hali hech qanday fikr bildirilmagan.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start group">
              <div className="w-9 h-9 bg-amber-500 dark:bg-amber-600 rounded-full shrink-0 text-white flex items-center justify-center font-semibold text-sm">
                {comment.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {comment.user?.fullName || "Student"}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  {comment.text}
                </p>

                <div className="flex items-center gap-4 pt-1 text-xs text-gray-400 dark:text-gray-500">
                  <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>0</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t("courseDetail.replyButton")}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
