/* eslint-disable no-undef */
import { useState } from 'react';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UseUploadReturn {
  upload: (files: File[]) => Promise<void>;
  progress: UploadProgress;
  loading: boolean;
  error: null | string;
}

export function useUploadDocument(): UseUploadReturn {
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]) => {
    setLoading(true);
    setError(null);

    try {
      for (const file of files) {
        setProgress({ loaded: 0, total: file.size, percentage: 0 });

        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setProgress({
            loaded: (file.size * i) / 100,
            total: file.size,
            percentage: i,
          });
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLoading(false);
    }
  };

  return { upload, progress, loading, error };
}
