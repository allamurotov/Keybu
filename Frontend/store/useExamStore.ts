import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/app/lib/utils";

export interface ExamState {
  socket: Socket | null;
  connectSocket: () => void;
  startExam: (attemptId: number, lessonId: number) => void;
  emitExamTick: (attemptId: number, timeRemaining: number, currentQuestion: number) => void;
  submitExam: (attemptId: number, score: number) => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  socket: null,

  connectSocket: () => {
    const { socket } = get();
    if (socket) return;

    const token = getToken("accessToken");
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const newSocket = io(`${socketUrl}/exam`, {
      transports: ["websocket"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to exam socket");
    });

    set({ socket: newSocket });
  },

  startExam: (attemptId, lessonId) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit("start_exam", { attemptId, lessonId });
    }
  },

  emitExamTick: (attemptId, timeRemaining, currentQuestion) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit("exam_tick", { attemptId, timeRemaining, currentQuestion });
    }
  },

  submitExam: (attemptId, score) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit("submit_exam", { attemptId, score });
    }
  },
}));
