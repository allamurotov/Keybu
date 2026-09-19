"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { baseAPI, getToken } from "@/app/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface ChatMessage {
  id: number;
  userId: number;
  text: string;
  date: string;
  fullName: string;
  role: string;
}

interface ChatThread {
  id: number; // parent comment id
  lessonId: number;
  studentId: number;
  studentName: string;
  lastMessage: string;
  date: string;
  status: string;
  color: string;
  isOnline?: boolean;
  isTyping?: boolean;
  messages: ChatMessage[];
}

function QAContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCourseId = searchParams.get('courseId');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | "">(initialCourseId ? Number(initialCourseId) : "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  
  const [chats, setChats] = useState<ChatThread[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  // Fetch courses
  useEffect(() => {
    baseAPI.get("/courses").then((res) => {
      const data = res.data?.data || res.data;
      setCourses(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        if (!initialCourseId) {
          setSelectedCourse(data[0].id);
        }
      }
    }).catch(console.error);
  }, [initialCourseId]);

  // Fetch comments when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    
    baseAPI.get(`/course-comments/${selectedCourse}`).then((res) => {
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        // Group by threads (parent comments)
        const threads = data.map((comment: any) => {
          const mainMessage = {
            id: comment.id,
            userId: comment.user?.id,
            text: comment.text,
            date: new Date(comment.created_at).toLocaleString(),
            fullName: comment.user?.fullName || "Student",
            role: comment.user?.role || "STUDENT"
          };
          
          const replies = (comment.replies || []).map((r: any) => ({
            id: r.id,
            userId: r.user?.id,
            text: r.text,
            date: new Date(r.created_at).toLocaleString(),
            fullName: r.user?.fullName || "User",
            role: r.user?.role || "MENTOR"
          }));

          return {
            id: comment.id,
            lessonId: comment.lessonId,
            studentId: comment.user?.id,
            studentName: comment.user?.fullName || "Student",
            lastMessage: comment.text,
            date: new Date(comment.created_at).toLocaleString(),
            status: replies.length > 0 ? "Javob berilgan" : "Kutilmoqda",
            color: "bg-blue-500", // generate random or static
            messages: [mainMessage, ...replies]
          };
        });
        
        setChats(threads);
      }
    }).catch(console.error);

  }, [selectedCourse]);

  // Setup Socket
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const token = getToken("accessToken");

    const newSocket = io(`${socketUrl}/qa`, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsOnline(true);
    });

    newSocket.on("disconnect", () => {
      setIsOnline(false);
    });

    newSocket.on("new_question", (comment) => {
      // Add new question to threads if it belongs to selected course
      if (comment.courseId === selectedCourse) {
        const newThread = {
          id: comment.id,
          lessonId: comment.lessonId,
          studentId: comment.userId,
          studentName: "Student", // ideally backend sends user details
          lastMessage: comment.text,
          date: new Date().toLocaleString(),
          status: "Kutilmoqda",
          color: "bg-pink-500",
          messages: [{
            id: comment.id,
            userId: comment.userId,
            text: comment.text,
            date: new Date().toLocaleString(),
            fullName: "Student",
            role: "STUDENT"
          }]
        };
        setChats(prev => [newThread, ...prev]);
      }
    });

    newSocket.on("new_reply", (reply) => {
      if (reply.courseId === selectedCourse) {
        setChats(prev => prev.map(chat => {
          if (chat.id === reply.parentId) {
            return {
              ...chat,
              status: "Javob berilgan",
              messages: [...chat.messages, {
                id: reply.id,
                userId: reply.userId,
                text: reply.text,
                date: new Date().toLocaleString(),
                fullName: "Mentor", // ideally from backend
                role: "MENTOR"
              }]
            };
          }
          return chat;
        }));
      }
    });

    newSocket.on("user_joined", ({ userId }) => {
      setChats(prev => prev.map(chat => chat.studentId === userId ? { ...chat, isOnline: true } : chat));
    });

    newSocket.on("user_left", ({ userId }) => {
      setChats(prev => prev.map(chat => chat.studentId === userId ? { ...chat, isOnline: false } : chat));
    });

    newSocket.on("user_typing", ({ userId, isMentor }) => {
      if (!isMentor) {
        setChats(prev => prev.map(chat => chat.studentId === userId ? { ...chat, isTyping: true } : chat));
      }
    });

    newSocket.on("user_stop_typing", ({ userId }) => {
      setChats(prev => prev.map(chat => chat.studentId === userId ? { ...chat, isTyping: false } : chat));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedCourse]);

  const filteredChats = chats.filter(
    (chat) =>
      chat.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChatData = chats.find(c => c.id === selectedChat);

  const handleSendReply = () => {
    if (!replyText.trim() || !activeChatData || !socketRef.current) return;
    
    socketRef.current.emit("send_reply", {
      courseId: selectedCourse,
      lessonId: activeChatData.lessonId,
      parentId: activeChatData.id,
      text: replyText
    });
    
    socketRef.current.emit("stop_typing", {
      courseId: selectedCourse,
      lessonId: activeChatData.lessonId
    });
    
    setReplyText("");
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
    if (!activeChatData || !socketRef.current) return;
    
    if (e.target.value.trim().length > 0) {
      socketRef.current.emit("typing", {
        courseId: selectedCourse,
        lessonId: activeChatData.lessonId,
        isMentor: true
      });
    } else {
      socketRef.current.emit("stop_typing", {
        courseId: selectedCourse,
        lessonId: activeChatData.lessonId
      });
    }
  };

  return (
    <div className="flex-1 overflow-hidden p-6 flex flex-col relative h-full bg-[#f8f9fa]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">Savol-javoblar</h1>
          <div className="text-[14px] text-gray-500 font-medium">
            {courses.find(c => c.id === selectedCourse)?.name || "Kursni tanlang"}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${isOnline ? 'bg-green-50 text-green-600' : 'bg-[#FFF0F0] text-[#FF4D4F]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-[#FF4D4F]'}`}></div>
          {isOnline ? 'online' : 'offline'}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Left Pane - Chat List */}
        <div className="w-full lg:w-[380px] flex flex-col shrink-0">
          
          {/* Dropdown */}
          <div className="mb-4 relative">
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(Number(e.target.value));
                setSelectedChat(null);
              }}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-[14px] rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none shadow-sm cursor-pointer font-semibold"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
              {courses.length === 0 && <option value="">Tanlang</option>}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <ChevronDown size={18} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
            {/* Search */}
            <div className="p-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Izlash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-blue-500 transition-colors bg-[#f8f9fa] font-medium"
                />
              </div>
            </div>

            {/* Chat Items */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 border-b border-gray-50 flex gap-3 cursor-pointer transition-colors ${
                    selectedChat === chat.id ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full text-white flex items-center justify-center font-bold text-[14px] relative ${chat.color}`}>
                    {chat.studentName.charAt(0).toUpperCase()}
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-gray-900 mb-0.5 truncate">
                      {chat.studentName}
                    </h4>
                    <p className="text-[12px] text-gray-500 truncate mb-1">
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                      <span className="text-gray-400">{chat.date}</span>
                      {chat.status === "Javob berilgan" && (
                        <span className="text-[#137333] font-bold">Javob berilgan</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredChats.length === 0 && (
                <div className="p-6 text-center text-gray-500 text-[13px]">
                  Ma'lumot topilmadi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {!activeChatData ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <span className="text-gray-400 text-[14px] font-medium">Chap tomondan savolni tanlang</span>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
                <h2 className="text-[16px] font-bold text-gray-900">{activeChatData.studentName}</h2>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col gap-6">
                {activeChatData.messages.map((msg) => {
                  const isMentor = msg.role !== "STUDENT"; // Assume admin/mentor replies are right-aligned
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMentor ? "justify-end" : "justify-start"}`}>
                      {/* Avatar for Student */}
                      {!isMentor && (
                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[12px] ${activeChatData.color}`}>
                          {msg.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        isMentor 
                          ? "bg-blue-600 text-white rounded-tr-sm" 
                          : "bg-[#F3F4F6] text-[#1a1a1a] rounded-tl-sm"
                      }`}>
                        {/* Text */}
                        <p className={`text-[14px] leading-relaxed mb-1 font-medium`}>
                          {msg.text}
                        </p>
                        
                        {/* Date */}
                        <p className={`text-[11px] font-medium ${
                          isMentor ? "text-blue-200 text-right" : "text-gray-400"
                        }`}>
                          {msg.date}
                        </p>
                      </div>

                      {/* Avatar for Mentor */}
                      {isMentor && (
                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[12px] bg-blue-700`}>
                          {msg.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {activeChatData.isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[12px] ${activeChatData.color}`}>
                      {activeChatData.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div className="bg-[#F3F4F6] text-gray-500 px-4 py-3 rounded-2xl rounded-tl-sm text-[13px] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={replyText}
                    onChange={handleTyping}
                    placeholder="Javobingizni yozing..."
                    className="flex-1 bg-[#F9FAFB] border border-gray-200 rounded-xl p-3 text-[14px] text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none min-h-[50px] max-h-[150px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || !isOnline}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QAPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Yuklanmoqda...</div>}>
      <QAContent />
    </Suspense>
  );
}
