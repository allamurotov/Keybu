import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { baseAPI, getToken } from "@/app/lib/utils";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,

  fetchNotifications: async () => {
    try {
      const res = await baseAPI.get("/notifications/unread");
      const data = res.data;
      set({ notifications: data, unreadCount: data.length });
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  },

  markAsRead: async (id: number) => {
    try {
      await baseAPI.patch(`/notifications/${id}/read`);
      
      set((state) => {
        const newNotifications = state.notifications.filter(n => n.id !== id);
        return { notifications: newNotifications, unreadCount: newNotifications.length };
      });
    } catch (error) {
      console.error("Error marking as read", error);
    }
  },

  connectSocket: () => {
    const { socket } = get();
    if (socket) return; // Already initialized

    const token = getToken("accessToken");
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to notifications socket");
      newSocket.emit("join_notifications");
    });

    newSocket.on("newNotification", (notification: Notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
