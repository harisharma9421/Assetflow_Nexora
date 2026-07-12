/**
 * Notification Store (Zustand)
 * Manages in-app notifications and unread count
 */
"use client";

import { create } from "zustand";
import type { UUID, ISODateString } from "@/types/common.types";

export type NotificationType =
  | "ALLOCATION"
  | "RETURN"
  | "MAINTENANCE"
  | "TRANSFER"
  | "BOOKING"
  | "AUDIT"
  | "SYSTEM";

export interface AppNotification {
  id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  entityId: UUID | null;
  entityType: string | null;
  createdAt: ISODateString;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: UUID) => void;
  markAllAsRead: () => void;
  removeNotification: (id: UUID) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead
        ? state.unreadCount
        : state.unreadCount + 1,
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(
        0,
        state.unreadCount -
          (state.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0)
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount:
          notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
