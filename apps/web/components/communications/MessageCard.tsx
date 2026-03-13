'use client';

import type { MockMessage } from '@/lib/mocks/communications';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface MessageCardProps {
  message: MockMessage;
}

export function MessageCard({ message }: MessageCardProps) {
  const typeColors: Record<string, string> = {
    email: 'bg-blue-100 text-blue-800',
    sms: 'bg-green-100 text-green-800',
    'in-app': 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-900">{message.senderName}</p>
            <Badge className={typeColors[message.type]}>{message.type}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {formatDistanceToNow(new Date(message.sentAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      <p className="mt-3 text-slate-700">{message.content}</p>

      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-slate-600">Attachments:</p>
          {message.attachments.map((attachment) => (
            <p key={attachment.id} className="text-xs text-slate-600">
              • {attachment.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
