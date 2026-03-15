'use client';

import { useMemo } from 'react';
import { ClaimDetailResponse } from '@/lib/api/claims/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface InvestigationTimelineProps {
  claim: ClaimDetailResponse;
}

interface TimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  createdBy?: string;
}

export function InvestigationTimeline({ claim }: InvestigationTimelineProps) {
  // Memoize timeline entry computation to avoid unnecessary recalculation
  const sortedEntries = useMemo(() => {
    const entries: TimelineEntry[] = [];

    // Add investigation notes entry if present
    if (claim.investigationNotes) {
      entries.push({
        id: 'investigation-notes',
        timestamp: claim.updatedAt,
        title: 'Investigation Findings',
        content: claim.investigationNotes,
        createdBy: 'System',
      });
    }

    // Add root cause entry if present
    if (claim.rootCause) {
      entries.push({
        id: 'root-cause',
        timestamp: claim.updatedAt,
        title: 'Root Cause Analysis',
        content: claim.rootCause,
        createdBy: 'System',
      });
    }

    // Add notes from claim notes if available
    if (claim.notes && claim.notes.length > 0) {
      claim.notes.forEach((note) => {
        entries.push({
          id: `note-${note.id}`,
          timestamp: note.createdAt,
          title: 'Internal Note',
          content: note.content,
          createdBy: note.createdBy,
        });
      });
    }

    // Sort by timestamp (newest first for display)
    return [...entries].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [claim.investigationNotes, claim.rootCause, claim.notes, claim.updatedAt]);

  if (sortedEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigation History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No investigation history recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg" id="investigation-timeline">
          Investigation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="space-y-6"
          role="list"
          aria-labelledby="investigation-timeline"
        >
          {sortedEntries.map((entry, index) => (
            <div key={entry.id} className="flex gap-4" role="listitem">
              {/* Timeline line and icon */}
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
                {index < sortedEntries.length - 1 && (
                  <div className="h-12 w-0.5 bg-muted" />
                )}
              </div>

              {/* Entry content */}
              <div className="flex-1 pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      {entry.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  {entry.createdBy && (
                    <p className="text-xs text-muted-foreground">
                      By {entry.createdBy}
                    </p>
                  )}
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
