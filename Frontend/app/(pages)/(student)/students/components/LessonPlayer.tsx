"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import { usePresenceStore } from "@/store/usePresenceStore";
import { useExamStore } from "@/store/useExamStore";

type TabId = "qa" | "materials" | "tasks" | "exams";

export type Reply = {
  id: string;
  name: string;
  role?: string;
  text: string;
  date: string;
  avatarColor: string;
  nameColor: string;
};

export type Question = {
  id: string;
  name: string;
  text: string;
  date: string;
  avatarColor: string;
  nameColor: string;
  replies?: Reply[];
};

export type Material = {
  id: string;
  name: string;
  type: "pdf" | "video" | "doc";
};

export type Task = {
  id: string;
  title: string;
  description: string;
  fileName?: string;
  uploadInstructions?: string;
};

export type ExamQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
};

export type Exam = {
  id: string;
  title: string;
  level: string;
  difficulty: string;
  totalQuestions: number;
  currentQuestion: number;
  questions: ExamQuestion[];
  result?: string;
  explanation?: string;
  nextSteps?: string;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "qa", label: "Q&A" },
  { id: "materials", label: "Materiallar" },
  { id: "tasks", label: "Vazifalar" },
  { id: "exams", label: "Imtihonlar" },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function LessonPlayer({
  lessonId,
  title,
  thumbnail,
  totalQuestions,
  totalAnswers,
  questions = [],
  materials = [],
  tasks = [],
  exams = [],
  examsLoading = false,
  onNextLesson,
  videoUrl,
  onSubmitQuestion,
  onSubmitReply,
  onTyping,
  hasNextLesson,
}: {
  lessonId?: string;
  title: string;
  thumbnail?: StaticImageData;
  totalQuestions?: number;
  totalAnswers?: number;
  questions?: Question[];
  materials?: Material[];
  tasks?: Task[];
  exams?: Exam[];
  examsLoading?: boolean;
  hasNextLesson?: boolean;
  onNextLesson?: () => void;
  videoUrl?: string;
  onSubmitQuestion?: (text: string) => Promise<void>;
  onSubmitReply?: (parentId: string, text: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("qa");
  const [rating, setRating] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set<string>());
  const [dislikedQuestions, setDislikedQuestions] = useState<Set<string>>(new Set<string>());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState("auto");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Scroll to the comment if hash is present
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1); // remove '#'
      if (id.startsWith('comment-')) {
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            element.classList.add('bg-blue-50', 'transition-colors', 'duration-500', 'p-4', 'rounded-lg');
            setTimeout(() => {
              element.classList.remove('bg-blue-50');
            }, 3000);
          }
        }, 500); // Give it time to render
      }
    }
  }, [questions]);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questionsCount = totalQuestions ?? questions.length;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const { connectSocket: connectPresence, emitVideoProgress } = usePresenceStore();
  const { connectSocket: connectExam, startExam, emitExamTick } = useExamStore();

  useEffect(() => {
    connectPresence();
    connectExam();
  }, [connectPresence, connectExam]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && lessonId) {
      interval = setInterval(() => {
        emitVideoProgress(Number(lessonId), progress, currentTime);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress, currentTime, lessonId, emitVideoProgress]);

  // Exam tick heartbeat
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "exams" && exams.length > 0) {
      startExam(1, Number(lessonId) || 0); // Mock attemptId
      interval = setInterval(() => {
        emitExamTick(1, 1500, exams[0].currentQuestion || 1); // Mock data
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, exams, lessonId, startExam, emitExamTick]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNextLesson) {
        onNextLesson();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [onNextLesson]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Video play failed:", error);
            setIsPlaying(false);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(false);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeed(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleLikeQuestion = (questionId: string) => {
    setLikedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
        // Agar dislike bosilgan bo'lsa, uni olib tashlaymiz
        setDislikedQuestions((prevDisliked) => {
          const newDisliked = new Set(prevDisliked);
          newDisliked.delete(questionId);
          return newDisliked;
        });
      }
      return newSet;
    });
  };

  const handleDislikeQuestion = (questionId: string) => {
    setDislikedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
        // Agar like bosilgan bo'lsa, uni olib tashlaymiz
        setLikedQuestions((prevLiked) => {
          const newLiked = new Set(prevLiked);
          newLiked.delete(questionId);
          return newLiked;
        });
      }
      return newSet;
    });
  };


  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 min-w-0">
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-base font-bold text-[#1a1a1a]">{title}</h2>
        <button 
          onClick={onNextLesson}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg"
        >
          Keyingi dars
        </button>
      </div>

      {/* Video qismi */}
      <div 
        ref={videoContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative w-full rounded-xl overflow-hidden bg-[#000] mb-6 group"
        style={{ aspectRatio: '16/9', maxHeight: '500px' }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onClick={togglePlay}
          />
        ) : (
          <>
            {thumbnail ? (
              <Image src={thumbnail} alt={title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" />
            )}
          </>
        )}

        {/* Play button overlay */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pauza" : "Ijro etish"}
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
          }`}
        >
          <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1a1a1a" className="ml-0.5">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1a1a1a" className="ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </span>
        </button>

        {/* Video boshqaruv paneli */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress bar */}
          <div className="px-4 pt-6 pb-2">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
                }}
              />
            </div>
          </div>

          {/* Boshqaruv tugmalari */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button 
                onClick={togglePlay} 
                className="text-white hover:text-gray-200 transition-colors"
                aria-label={isPlaying ? "Pauza" : "Ijro etish"}
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <button 
                onClick={toggleMute}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              >
                {isMuted || volume === 0 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 010 7.07" />
                  </svg>
                )}
              </button>

              {/* Vaqt */}
              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeed(!showSpeed)}
                  className="text-white text-sm font-semibold hover:text-gray-200 transition-colors px-2 py-1"
                  aria-label="Tezlikni tanlash"
                >
                  {playbackSpeed}x
                </button>
                {showSpeed && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg overflow-hidden min-w-[80px] backdrop-blur-sm">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`w-full text-center px-3 py-2 text-sm text-white hover:bg-white/20 transition-colors ${
                          playbackSpeed === speed ? "bg-white/10" : ""
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality selector */}
              <div className="relative">
                <button
                  onClick={() => setShowQuality(!showQuality)}
                  className="text-white text-sm font-semibold hover:text-gray-200 transition-colors px-2 py-1 flex items-center gap-1"
                  aria-label="Sifatni tanlash"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
                  </svg>
                  {quality}
                </button>
                {showQuality && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg overflow-hidden min-w-[120px] backdrop-blur-sm">
                    {[
                      { value: "auto", label: "Avtomatik" },
                      { value: "1080p", label: "1080p" },
                      { value: "720p", label: "720p" },
                      { value: "480p", label: "480p" },
                      { value: "360p", label: "360p" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setQuality(option.value);
                          setShowQuality(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors ${
                          quality === option.value ? "bg-white/10" : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-200 transition-colors ml-1"
                aria-label="To'liq ekran"
              >
                {isFullscreen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Baholash */}
      <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b border-gray-100">
        <p className="text-sm font-medium text-[#1a1a1a]">Darsni baholashni istaysizmi?</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => setRating(star)} 
              aria-label={`${star} yulduz`}
              className="transition-transform hover:scale-110"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={star <= rating ? "#FFC107" : "none"}
                stroke={star <= rating ? "#FFC107" : "#E0E0E0"}
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Tablar */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-[#64748B] hover:text-[#1a1a1a] hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Q&A Tab */}
      {activeTab === "qa" && (
        <div>
          <div className="flex items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-base font-bold text-[#1a1a1a] mb-1">Savol va javoblar</h3>
              <p className="text-sm text-[#64748B]">
                Savollar: {questionsCount} ta • Javoblar: {totalAnswers ?? 9} ta
              </p>
            </div>
            <button 
              onClick={() => setIsQuestionModalOpen(true)}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg"
            >
              Savol so'rash
            </button>
          </div>

          <h4 className="text-sm font-semibold text-[#1a1a1a] mb-6">Barcha savollar</h4>

          <div className="flex flex-col gap-6">
            {questions.map((q) => {
              return (
                <div key={q.id} id={`comment-${q.id}`} className="flex flex-col gap-4">
                  {/* Question */}
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg ${q.avatarColor}`}>
                        {q.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold mb-1 ${q.nameColor}`}>{q.name}</p>
                      <p className="text-sm text-[#1a1a1a] leading-relaxed mb-1">{q.text}</p>
                      <p className="text-xs text-gray-400 font-medium mb-2">{q.date}</p>
                      <button 
                        onClick={() => setReplyingTo(replyingTo === q.id ? null : q.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Javob berish
                      </button>
                    </div>
                  </div>
                  
                  {/* Reply Input Box */}
                  {replyingTo === q.id && (
                    <div className="ml-14 flex gap-3 items-start">
                      <textarea 
                        value={replyText}
                        onChange={(e) => {
                    setReplyText(e.target.value);
                    if (onTyping) {
                      onTyping(e.target.value.trim().length > 0);
                    }
                  }}
                        placeholder="Javobingizni yozing..."
                        className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none min-h-[60px]"
                      />
                      <button 
                        disabled={isSubmitting || !replyText.trim()}
                        onClick={async () => {
                          if (onSubmitReply) {
                            setIsSubmitting(true);
                            await onSubmitReply(q.id, replyText);
                            setIsSubmitting(false);
                            setReplyText("");
                            setReplyingTo(null);
                          }
                        }}
                        className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Yuborish
                      </button>
                    </div>
                  )}

                  {/* Replies */}
                  {q.replies && q.replies.length > 0 && (
                    <div className="ml-14 flex flex-col gap-4">
                      {q.replies.map((reply) => (
                        <div key={reply.id} className="bg-[#F8FAFC] rounded-lg p-4 border border-gray-100 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs ${reply.avatarColor}`}>
                              {reply.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-bold">
                              <span className={reply.nameColor}>{reply.name}</span>
                              {reply.role && <span className="text-gray-400 font-normal ml-1">({reply.role})</span>}
                            </p>
                          </div>
                          <p className="text-sm text-[#1a1a1a] leading-relaxed">{reply.text}</p>
                          <p className="text-xs text-gray-400 font-medium">{reply.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === "materials" && (
        <div>
          <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Materiallar</h3>
          <div className="flex flex-col gap-3">
            {materials.map((material) => (
              <div 
                key={material.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444">
                      <path d="M7 18h10V6H7v12zm2-10h6v8H9V8z"/>
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#1a1a1a]">{material.name}</span>
                </div>
                <button 
                  className="text-[#64748B] hover:text-[#1a1a1a] transition-colors"
                  aria-label="Yuklab olish"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <TasksTab tasks={tasks} />
      )}

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <ExamsTab exams={exams} loading={examsLoading} />
      )}

      {/* Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1a1a1a]">Savol so'rash</h2>
              <button 
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Savol matni</label>
              <textarea 
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  if (onTyping) {
                    onTyping(e.target.value.trim().length > 0);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                placeholder="Kiriting"
              />
            </div>

            <button className="flex items-center gap-2 text-sm text-[#1a1a1a] border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors mb-6">
              Fayl biriktirish (ixtiyoriy)
            </button>

            <button 
              disabled={isSubmitting || !questionText.trim()}
              onClick={async () => {
                if (onSubmitQuestion) {
                  setIsSubmitting(true);
                  await onSubmitQuestion(questionText);
                  setIsSubmitting(false);
                  setQuestionText("");
                  setIsQuestionModalOpen(false);
                }
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors text-white text-sm font-medium px-6 py-2.5 rounded-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Yuborish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vazifalar Tab komponenti ───────────────────────────────────────────────
function TasksTab({ tasks }: { tasks: Task[] }) {
  const [answer, setAnswer] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-5">
      {tasks.map((task) => (
        <div key={task.id} className="flex flex-col gap-4">
          {/* Topshiriq card */}
          <div className="bg-[#F5F5F5] rounded-xl border border-gray-200 p-4">
            <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">Topshiriq</p>
            <p className="text-[14px] text-[#64748B]">{task.description}</p>
          </div>

          {/* Topshirilmagan holat */}
          <p className="text-[14px] text-[#94A3B8]">Hali vazifa topshirilmagan.</p>

          {/* Javob yozish */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#1a1a1a]">Vazifa faylini yuklang</p>
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-[14px] outline-none focus:border-gray-400 transition-colors resize-y bg-white text-[#1a1a1a]"
            />
          </div>

          {/* Fayl yuklash */}
          <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-[13px] font-medium text-[#1a1a1a] hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.34a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              Yuklash
            </button>
            <span className="text-[13px] text-[#94A3B8]">
              {uploadedFile ? uploadedFile.name : "Fayl yuklanmagan"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Yuborish tugmasi */}
          <div>
            <button
              type="button"
              className="bg-[#94A3B8] hover:bg-[#64748B] text-white font-medium px-6 py-2.5 rounded-lg text-[14px] transition-colors"
            >
              Yuborish
            </button>
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <p className="text-[14px] text-[#94A3B8]">Hali vazifalar mavjud emas.</p>
      )}
    </div>
  );
}

// ─── Imtihonlar Tab komponenti ──────────────────────────────────────────────
function ExamsTab({ exams, loading }: { exams: Exam[]; loading?: boolean }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Yangi exam kelganda reset
  const examId = exams[0]?.id;
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsSubmitted(false);
    setScore(0);
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-[#64748B]">Yuklanmoqda...</span>
      </div>
    );
  }

  if (!exams.length || !exams[0].questions.length) {
    return (
      <div className="py-10 text-center text-sm text-[#64748B]">
        Bu dars uchun hali imtihon savollari qo&apos;shilmagan.
      </div>
    );
  }

  const exam = exams[0];
  const questions = exam.questions;
  const total = questions.length;
  const current = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / total) * 100;

  const handleSelectAnswer = (answerIndex: number) => {
    if (isSubmitted) return;
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestionIndex < total - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (q.correctAnswer !== undefined && selectedAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsSubmitted(false);
    setScore(0);
  };

  // Natija ekrani
  if (isSubmitted) {
    const percent = Math.round((score / total) * 100);
    const passed = percent >= 60;
    return (
      <div className="py-8 flex flex-col items-center text-center gap-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${passed ? "bg-green-50" : "bg-red-50"}`}>
          {passed ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-1">
            {passed ? "Tabriklaymiz!" : "Afsuski, o'tmadingiz"}
          </h3>
          <p className="text-sm text-[#64748B]">
            {score} / {total} ta to&apos;g&apos;ri javob ({percent}%)
          </p>
        </div>

        {/* Har bir savol natijasi */}
        <div className="w-full mt-4 flex flex-col gap-3 text-left">
          {questions.map((q, i) => {
            const userAnswer = selectedAnswers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <p className="text-sm font-semibold text-[#1a1a1a] mb-2">
                  {i + 1}. {q.question}
                </p>
                <p className={`text-sm ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                  Sizning javobingiz:{" "}
                  <strong>
                    {userAnswer !== null && userAnswer !== undefined
                      ? `${String.fromCharCode(65 + userAnswer)}) ${q.options[userAnswer]}`
                      : "Javob berilmagan"}
                  </strong>
                </p>
                {!isCorrect && q.correctAnswer !== undefined && (
                  <p className="text-sm text-green-700 mt-1">
                    To&apos;g&apos;ri javob:{" "}
                    <strong>{String.fromCharCode(65 + q.correctAnswer)}) {q.options[q.correctAnswer]}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRetry}
          className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  // Test yechish ekrani
  return (
    <div className="flex flex-col gap-5">
      {/* Sarlavha va progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-[#1a1a1a]">{exam.title}</p>
          <p className="text-sm text-[#64748B]">
            {currentQuestionIndex + 1} / {total}
          </p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Savol */}
      <div>
        <p className="text-base font-bold text-[#1a1a1a] mb-4">
          {currentQuestionIndex + 1}. {current.question}
        </p>

        <div className="flex flex-col gap-3">
          {current.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === index;
            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#1a1a1a]">
                    {String.fromCharCode(65 + index)}) {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigatsiya tugmalari */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2.5 text-sm font-medium text-[#64748B] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          Oldingi
        </button>

        {currentQuestionIndex < total - 1 ? (
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined || selectedAnswers[currentQuestionIndex] === null}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            Keyingi
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers[currentQuestionIndex] === undefined || selectedAnswers[currentQuestionIndex] === null}
            className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40"
          >
            Yakunlash
          </button>
        )}
      </div>

      {/* Savol navigatsiyasi (tugmachalar) */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestionIndex(i)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              i === currentQuestionIndex
                ? "bg-blue-600 text-white"
                : selectedAnswers[i] !== undefined && selectedAnswers[i] !== null
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
