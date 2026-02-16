"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  useQuoteTimeline,
  useQuoteNotes,
  useAddQuoteNote,
} from "@/lib/hooks/sales/use-quotes";
import {
  Plus,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  Edit,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuoteTimelineEvent, QuoteNote } from "@/types/quotes";

// --- Timeline Tab ---

interface QuoteTimelineSectionProps {
  quoteId: string;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  created: Plus,
  edited: Edit,
  sent: Send,
  viewed: Eye,
  accepted: CheckCircle,
  rejected: XCircle,
  expired: Clock,
  converted: ArrowRightLeft,
  note: MessageSquare,
  version: FileText,
};

const EVENT_COLORS: Record<string, string> = {
  created: "bg-gray-400",
  edited: "bg-gray-400",
  sent: "bg-blue-500",
  viewed: "bg-purple-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-amber-500",
  converted: "bg-emerald-500",
  note: "bg-gray-400",
  version: "bg-gray-400",
};

function formatTimelineDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function QuoteTimelineSection({ quoteId }: QuoteTimelineSectionProps) {
  const { data: events, isLoading } = useQuoteTimeline(quoteId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            Loading timeline...
          </div>
        </CardContent>
      </Card>
    );
  }

  const eventList = events ?? [];

  if (eventList.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-sm text-muted-foreground">
            No activity yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

          {eventList.map((event: QuoteTimelineEvent, index: number) => {
            const Icon = EVENT_ICONS[event.type] ?? FileText;
            const dotColor = EVENT_COLORS[event.type] ?? "bg-gray-400";

            return (
              <div
                key={event.id}
                className={cn("relative pl-4", index < eventList.length - 1 ? "pb-5" : "")}
              >
                {/* Dot */}
                <div className={cn(
                  "absolute -left-6 top-0.5 flex items-center justify-center h-4 w-4 rounded-full",
                  dotColor
                )}>
                  <Icon className="h-2.5 w-2.5 text-white" />
                </div>

                {/* Content */}
                <div className="text-xs text-muted-foreground mb-0.5">
                  {formatTimelineDate(event.createdAt)}
                  {event.createdBy && <span> — {event.createdBy}</span>}
                </div>
                <div className="text-sm font-medium">{event.description}</div>
                {event.details && (
                  <div className="text-xs text-muted-foreground mt-0.5">{event.details}</div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Notes Tab ---

interface QuoteNotesSectionProps {
  quoteId: string;
}

export function QuoteNotesSection({ quoteId }: QuoteNotesSectionProps) {
  const { data: notes, isLoading } = useQuoteNotes(quoteId);
  const addNoteMutation = useAddQuoteNote();
  const [noteContent, setNoteContent] = useState("");

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addNoteMutation.mutate(
      { id: quoteId, content: noteContent.trim() },
      { onSuccess: () => setNoteContent("") }
    );
  };

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <Card>
        <CardContent className="pt-4">
          <Textarea
            placeholder="Add a note..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={3}
            className="mb-3"
          />
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!noteContent.trim() || addNoteMutation.isPending}
          >
            {addNoteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Notes list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Notes {notes ? `(${notes.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Loading notes...
            </div>
          ) : !notes || notes.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No notes yet. Add a note to keep track of conversations and decisions.
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note: QuoteNote, index: number) => (
                <div key={note.id}>
                  {index > 0 && <Separator className="mb-3" />}
                  <div className="text-xs text-muted-foreground mb-1">
                    {note.createdBy} — {formatTimelineDate(note.createdAt)}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
