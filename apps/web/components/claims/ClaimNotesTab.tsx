'use client';

import { useState } from 'react';
import { ClaimNote, CreateClaimNoteDTO } from '@/lib/api/claims/types';
import { claimNotesClient } from '@/lib/api/claims';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface ClaimNotesTabProps {
  claimId: string;
  notes: ClaimNote[];
  onNotesChange: () => void;
}

export function ClaimNotesTab({
  claimId,
  notes,
  onNotesChange,
}: ClaimNotesTabProps) {
  const [noteContent, setNoteContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setIsSubmitting(true);
      const data: CreateClaimNoteDTO = {
        content: noteContent.trim(),
      };
      await claimNotesClient.addNote(claimId, data);
      toast.success('Note added successfully');
      setNoteContent('');
      onNotesChange();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add note';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirmId) return;
    try {
      setIsSubmitting(true);
      await claimNotesClient.deleteNote(claimId, deleteConfirmId);
      toast.success('Note deleted successfully');
      setDeleteConfirmId(null);
      onNotesChange();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete note';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort notes by newest first
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-lg">Add a Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add an internal note about this claim..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            disabled={isSubmitting}
            className="min-h-24"
          />
          <Button
            onClick={handleAddNote}
            disabled={isSubmitting || !noteContent.trim()}
            className="w-full sm:w-auto"
          >
            <Send className="mr-2 size-4" />
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </Button>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedNotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notes yet. Add one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border p-4 space-y-2 hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {note.createdBy}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(note.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
