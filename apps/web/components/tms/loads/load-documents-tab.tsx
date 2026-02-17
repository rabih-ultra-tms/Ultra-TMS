"use client";

import { useState, useCallback } from "react";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type Document,
  type DocumentType,
} from "@/lib/hooks/documents/use-documents";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Trash2,
  Upload,
  ImageIcon,
  ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentUpload } from "@/components/shared/document-upload";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAutoEmail, loadToEmailData } from "@/lib/hooks/communication/use-auto-email";
import { LoadStatus, type Load } from "@/types/loads";

interface LoadDocumentsTabProps {
  loadId: string;
  load?: Load;
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  POD: "POD",
  BOL: "BOL",
  RATE_CONFIRM: "Rate Confirmation",
  INVOICE: "Invoice",
  INSURANCE: "Insurance",
  CONTRACT: "Contract",
  W9: "W-9",
  CARRIER_AGREEMENT: "Carrier Agreement",
  OTHER: "Other",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  verified: "default",
  received: "secondary",
  pending: "outline",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LoadDocumentsTab({ loadId, load }: LoadDocumentsTabProps) {
  const { data: documents, isLoading } = useDocuments("LOAD", loadId);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const { triggerEmail } = useAutoEmail();

  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  const handleUpload = useCallback(
    async (file: File, documentType: DocumentType, name: string) => {
      await uploadMutation.mutateAsync({
        file,
        name,
        documentType,
        entityType: "LOAD",
        entityId: loadId,
      });
      setShowUpload(false);

      // Auto-trigger delivery confirmation email when POD is uploaded on a delivered load
      if (
        documentType === "POD" &&
        load &&
        [LoadStatus.DELIVERED, LoadStatus.COMPLETED].includes(load.status)
      ) {
        triggerEmail("delivery_confirmation", loadToEmailData(load));
      }
    },
    [uploadMutation, loadId, load, triggerEmail]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync({
      documentId: deleteTarget.id,
      entityType: "LOAD",
      entityId: loadId,
    });
    setDeleteTarget(null);
  }, [deleteMutation, deleteTarget, loadId]);

  const handleDownload = useCallback(
    async (doc: Document) => {
      try {
        const response = await apiClient.get<{
          downloadUrl: string;
        }>(`/documents/${doc.id}/download`);
        window.open(response.downloadUrl, "_blank");
      } catch {
        // Fallback: open in new tab via API URL
        const url = apiClient.getFullUrl(`/documents/${doc.id}/download`);
        window.open(url, "_blank");
      }
    },
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const hasDocuments = documents && documents.length > 0;

  return (
    <div className="space-y-4">
      {/* Header with upload toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Documents{hasDocuments ? ` (${documents.length})` : ""}
        </h3>
        <Button
          size="sm"
          variant={showUpload ? "outline" : "default"}
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" /> Hide Upload
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" /> Upload
            </>
          )}
        </Button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <DocumentUpload
          onUpload={handleUpload}
          isUploading={uploadMutation.isPending}
        />
      )}

      {/* Empty state */}
      {!hasDocuments && !showUpload && (
        <div className="flex flex-col items-center justify-center h-52 border-2 border-dashed rounded-lg bg-muted/10 border-muted-foreground/25">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <h4 className="text-base font-medium">No documents yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upload BOLs, PODs, or Rate Confirmations.
          </p>
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload Document
          </Button>
        </div>
      )}

      {/* Document list */}
      {hasDocuments && (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="hover:bg-muted/5 transition-colors"
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded bg-primary/10 text-primary shrink-0">
                  {doc.mimeType?.startsWith("image/") ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-sm truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <Badge
                      variant={STATUS_VARIANTS[doc.status ?? "pending"] ?? "outline"}
                      className="text-[10px] uppercase shrink-0"
                    >
                      {doc.status ?? "pending"}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                    {" \u00B7 "}
                    {formatFileSize(doc.fileSize)}
                    {" \u00B7 "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                    {doc.createdByUser &&
                      ` \u00B7 ${doc.createdByUser.firstName} ${doc.createdByUser.lastName}`}
                  </div>

                  <div className="flex gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
