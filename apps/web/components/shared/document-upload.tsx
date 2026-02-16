"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/lib/hooks/documents/use-documents";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
];

const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.tiff,.tif";

const UNIQUE_DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "POD", label: "Proof of Delivery (POD)" },
  { value: "BOL", label: "Bill of Lading (BOL)" },
  { value: "RATE_CONFIRM", label: "Rate Confirmation" },
  { value: "INVOICE", label: "Invoice" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "OTHER", label: "Other" },
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

interface PendingFile {
  file: File;
  documentType: DocumentType;
  preview?: string;
}

interface DocumentUploadProps {
  onUpload: (file: File, documentType: DocumentType, name: string) => Promise<void>;
  isUploading?: boolean;
}

export function DocumentUpload({ onUpload, isUploading }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 25MB.`;
    }
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|tiff|tif)$/i)) {
      return "Unsupported file type. Accepted: PDF, JPG, PNG, TIFF.";
    }
    return null;
  }, []);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const file = files[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;

      setPendingFile({
        file,
        documentType: "POD",
        preview,
      });
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleUpload = useCallback(async () => {
    if (!pendingFile) return;
    setError(null);
    setUploadProgress(10);

    try {
      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 85));
      }, 200);

      await onUpload(
        pendingFile.file,
        pendingFile.documentType,
        pendingFile.file.name
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clean up preview URL
      if (pendingFile.preview) {
        URL.revokeObjectURL(pendingFile.preview);
      }

      // Reset after brief success display
      setTimeout(() => {
        setPendingFile(null);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setUploadProgress(0);
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    }
  }, [pendingFile, onUpload]);

  const handleCancelPending = useCallback(() => {
    if (pendingFile?.preview) {
      URL.revokeObjectURL(pendingFile.preview);
    }
    setPendingFile(null);
    setError(null);
    setUploadProgress(0);
  }, [pendingFile]);

  // Pending file review state
  if (pendingFile) {
    return (
      <div className="border rounded-lg p-4 space-y-4 bg-card">
        <div className="flex items-start gap-3">
          {pendingFile.preview ? (
            <img
              src={pendingFile.preview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded border"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded border bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{pendingFile.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(pendingFile.file.size / 1024).toFixed(0)} KB
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCancelPending}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Document Type</label>
          <Select
            value={pendingFile.documentType}
            onValueChange={(value: DocumentType) =>
              setPendingFile((prev) =>
                prev ? { ...prev, documentType: value } : null
              )
            }
            disabled={isUploading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIQUE_DOC_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {uploadProgress > 0 && (
          <Progress value={uploadProgress} className="h-2" />
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelPending}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Dropzone state
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/30"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
        />

        <Upload
          className={cn(
            "w-10 h-10 mx-auto mb-3",
            isDragging ? "text-primary" : "text-muted-foreground"
          )}
        />

        <p className="text-sm font-medium">
          {isDragging ? "Drop file here" : "Drop a file here or click to browse"}
        </p>

        <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> PDF
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> JPG / PNG
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> TIFF
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-1">Max 25MB</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
