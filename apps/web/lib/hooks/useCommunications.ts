import { useState, useEffect } from 'react';
import { MOCK_MESSAGES } from '../mocks/communications';

export interface UseCommunicationsReturn {
  messages: typeof MOCK_MESSAGES;
  threads: Array<{ id: string; lastMessage: string; unread: number }>;
  loading: boolean;
  searchMessages: (query: string) => typeof MOCK_MESSAGES;
}

export function useCommunications(): UseCommunicationsReturn {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const threads = Array.from(new Set(MOCK_MESSAGES.map((m) => m.threadId))).map(
    (threadId) => ({
      id: threadId,
      lastMessage:
        MOCK_MESSAGES.find((m) => m.threadId === threadId)?.content || '',
      unread: Math.floor(Math.random() * 3),
    })
  );

  const searchMessages = (query: string) =>
    MOCK_MESSAGES.filter((msg) =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );

  return {
    messages: MOCK_MESSAGES,
    threads,
    loading,
    searchMessages,
  };
}
