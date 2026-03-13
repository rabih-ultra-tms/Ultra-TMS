'use client';

import { MessageCard } from './MessageCard';
import type { MockMessage } from '@/lib/mocks/communications';
import { Loader2 } from 'lucide-react';

interface MessageThreadProps {
  messages: MockMessage[];
  threadId: string;
  loading?: boolean;
}

export function MessageThread({
  messages,
  threadId,
  loading,
}: MessageThreadProps) {
  const threadMessages = messages.filter((msg) => msg.threadId === threadId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (threadMessages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
        <p className="text-slate-600">No messages in this thread</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threadMessages
        .sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        )
        .map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
    </div>
  );
}
