"use client";

import { useRef, useActionState } from "react";
import { Send } from "lucide-react";
import { createComment } from "./actions";
import { useLanguage } from "@/app/context/LanguageContext";

export function CommentForm({ courseId, onSuccess }: { courseId: string; onSuccess?: () => void }) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await createComment(courseId, formData);
      if (result.success) {
        formRef.current?.reset();
        if (onSuccess) onSuccess();
      }
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="relative flex items-center border-b border-gray-200 dark:border-[#1E293B] py-3 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all">
        <div className="w-9 h-9 bg-blue-600 dark:bg-blue-500 rounded-full shrink-0 text-white flex items-center justify-center text-xs font-bold mr-3">
          U
        </div>

        <input
          type="text"
          name="commentContent"
          placeholder={t("commentForm.placeholder")}
          disabled={isPending}
          className="w-full bg-transparent text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none pr-10 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isPending}
          className="absolute right-4 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
        >
          <Send
            className={`w-4 h-4 ${isPending ? "animate-pulse text-blue-400" : ""}`}
          />
        </button>
      </div>

      {state?.error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1">{state.error}</p>
      )}
    </form>
  );
}
