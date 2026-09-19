import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/app/lib/utils";

export interface PresenceState {
  socket: Socket | null;
  connectSocket: () => void;
  emitVideoProgress: (lessonId: number, progressPercentage: number, currentTime: number) => void;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  socket: null,

  connectSocket: () => {
    const { socket } = get();
    if (socket) return;

    const token = getToken("accessToken");
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const newSocket = io(`${socketUrl}/presence`, {
      transports: ["websocket"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to presence socket");
      newSocket.emit("im_online");
    });

    set({ socket: newSocket });
  },

  emitVideoProgress: (lessonId, progressPercentage, currentTime) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit("video_progress", { lessonId, progressPercentage, currentTime });
    }
  },
}));
