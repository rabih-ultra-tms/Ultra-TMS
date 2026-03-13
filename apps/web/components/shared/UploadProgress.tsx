'use client';

import type { UploadProgress } from '@/lib/hooks/useUploadDocument';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface UploadProgressProps {
  progress: UploadProgress;
  loading: boolean;
  error: string | null;
}

export function UploadProgressComponent({
  progress,
  loading,
  error,
}: UploadProgressProps) {
  if (!loading && progress.percentage === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {error ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : progress.percentage === 100 ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">Upload complete</p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Uploading... {progress.percentage}%
            </p>
          )}
        </div>
      </div>

      <Progress value={progress.percentage} className="mt-3" />
    </div>
  );
}
