/**
 * Socket.io Provider
 * Connects to backend WebSocket on dashboard mount, disconnects on unmount
 * Passes JWT auth token on connection
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import {
  WS_BASE_URL,
  SOCKET_NAMESPACES,
  SOCKET_CONFIG,
  type ConnectionStatus,
} from './socket-config';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  status: ConnectionStatus;
  error: string | null;
  latency: number | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  status: 'disconnected',
  error: null,
  latency: null,
});

export interface SocketProviderProps {
  children: React.ReactNode;
  namespace?: string;
}

export function SocketProvider({ children, namespace = SOCKET_NAMESPACES.EVENTS }: SocketProviderProps) {
  const { data: user, isLoading } = useCurrentUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const latencyInterval = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Get access token from cookie
  const getAccessToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find((c) => c.trim().startsWith('accessToken='));
    if (!tokenCookie) return null;
    // Use substring to avoid truncating base64 JWT padding chars
    const tokenValue = tokenCookie.substring(tokenCookie.indexOf('=') + 1).trim();
    if (!tokenValue) return null;
    return decodeURIComponent(tokenValue);
  }, []);

  useEffect(() => {
    if (isLoading || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current) return;

    const token = getAccessToken();
    if (!token) {
      setError('No authentication token found');
      setStatus('error');
      return;
    }

    const socketUrl = `${WS_BASE_URL}${namespace}`;
    const newSocket = io(socketUrl, {
      ...SOCKET_CONFIG,
      auth: { token },
    });

    newSocket.on('connect', () => {
      setConnected(true);
      setStatus('connected');
      setError(null);

      // Start latency monitoring
      latencyInterval.current = setInterval(() => {
        const start = Date.now();
        newSocket.emit('ping', () => {
          setLatency(Date.now() - start);
        });
      }, 5000);
    });

    newSocket.on('disconnect', (reason) => {
      setConnected(false);
      setStatus('disconnected');

      if (latencyInterval.current) {
        clearInterval(latencyInterval.current);
        latencyInterval.current = null;
      }

      if (reason === 'io server disconnect') {
        setError('Server disconnected the connection');
      }
    });

    newSocket.on('connect_error', (err) => {
      setConnected(false);
      setStatus('error');
      setError(err.message || 'Connection error');
    });

    newSocket.io.on('reconnect_attempt', () => {
      setStatus('reconnecting');
      setError(null);
    });

    newSocket.io.on('reconnect', () => {
      setConnected(true);
      setStatus('connected');
      setError(null);
    });

    newSocket.io.on('reconnect_failed', () => {
      setStatus('error');
      setError('Failed to reconnect after 5 attempts');
    });

    newSocket.connect();
    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (latencyInterval.current) {
        clearInterval(latencyInterval.current);
      }
      newSocket.disconnect();
      socketRef.current = null;
    };
    // NOTE: 'socket' intentionally excluded — including it causes infinite reconnect loop
  }, [user, isLoading, namespace, getAccessToken]);

  const contextValue: SocketContextValue = {
    socket,
    connected,
    status,
    error,
    latency,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
