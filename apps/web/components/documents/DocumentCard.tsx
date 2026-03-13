'use client';

import { FileIcon, MoreVertical, Trash2 } from 'lucide-react';
import type { MockDocument } from '@/lib/mocks/documents';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCardProps {
  document: MockDocument;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function DocumentCard({
  document,
  onDelete,
  onView,
}: DocumentCardProps) {
  const sizeInMB = (document.size / 1024 / 1024).toFixed(2);

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
      role="button"
      tabIndex={0}
      onClick={() => onView(document.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onView(document.id);
      }}
    >
      <div className="flex items-center gap-3">
        <FileIcon className="h-8 w-8 text-slate-400" />
        <div className="flex-1">
          <p className="font-medium text-slate-900">{document.name}</p>
          <p className="text-sm text-slate-600">
            {sizeInMB} MB •{' '}
            {formatDistanceToNow(new Date(document.uploadedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(document.id)}>
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(document.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
