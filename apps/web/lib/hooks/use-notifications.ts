'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import {
  WS_BASE_URL,
  SOCKET_NAMESPACES,
  SOCKET_CONFIG,
} from '@/lib/socket/socket-config';
import type { NotificationEvent } from '@/lib/socket/socket-config';

interface Notification extends NotificationEvent {
  createdAt: string;
  read: boolean;
}

const MAX_NOTIFICATIONS = 50;

async function fetchNotificationsFromAPI(): Promise<Notification[]> {
  try {
    const response = await fetch('/api/v1/communication/notifications', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const notifications = Array.isArray(data.data) ? data.data : [];
    return notifications.map((n: any) => ({
      ...n,
      createdAt: n.createdAt ?? new Date().toISOString(),
    })) as Notification[];
  } catch (error) {
    console.warn('Failed to fetch notifications:', error);
    return [];
  }
}

async function markNotificationAsReadAPI(id: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/v1/communication/notifications/${id}/read`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.ok;
  } catch (error) {
    console.warn('Failed to mark notification as read:', error);
    return false;
  }
}

async function markAllNotificationsAsReadAPI(): Promise<boolean> {
  try {
    const response = await fetch(
      '/api/v1/communication/notifications/read-all',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.ok;
  } catch (error) {
    console.warn('Failed to mark all notifications as read:', error);
    return false;
  }
}

/**
 * Hook for real-time notifications via the /notifications WebSocket namespace.
 * Manages its own socket connection separate from the main SocketProvider.
 */
export function useNotifications() {
  const { data: user, isLoading } = useCurrentUser();
  const userId = user?.id;
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get access token from cookie
  const getAccessToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find((c) =>
      c.trim().startsWith('accessToken=')
    );
    if (!tokenCookie) return null;
    return decodeURIComponent(
      tokenCookie.substring(tokenCookie.indexOf('=') + 1).trim()
    );
  }, []);

  // Hydrate existing notifications from REST API on mount
  useEffect(() => {
    if (isLoading || !userId) return;

    (async () => {
      const existingNotifications = await fetchNotificationsFromAPI();
      if (existingNotifications.length > 0) {
        setNotifications((prev) => {
          const merged = [...existingNotifications, ...prev];
          // Deduplicate by ID (keep API version as source of truth)
          const seen = new Set<string>();
          return merged
            .filter((n) => {
              if (seen.has(n.id)) return false;
              seen.add(n.id);
              return true;
            })
            .slice(0, MAX_NOTIFICATIONS);
        });
      }
    })();
  }, [userId, isLoading]);

  useEffect(() => {
    if (isLoading || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${WS_BASE_URL}${SOCKET_NAMESPACES.NOTIFICATIONS}`, {
      ...SOCKET_CONFIG,
      auth: { token },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    // Listen for new notifications
    socket.on('notification:new', (data: NotificationEvent) => {
      setNotifications((prev) => {
        const notification: Notification = {
          ...data,
          createdAt:
            (data as Notification).createdAt ?? new Date().toISOString(),
          read: false,
        };
        return [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
      });
    });

    // Listen for notification read acknowledgement
    socket.on('notification:read', (data: { id: string }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === data.id ? { ...n, read: true } : n))
      );
    });

    socket.connect();
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, isLoading, getAccessToken]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // Persist to backend
    markNotificationAsReadAPI(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Persist to backend
    markAllNotificationsAsReadAPI();
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
