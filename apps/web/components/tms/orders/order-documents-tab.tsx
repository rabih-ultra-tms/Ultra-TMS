"use client";

import { useOrderDocuments } from "@/lib/hooks/tms/use-orders";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDocumentsTabProps {
    orderId: string;
}

export function OrderDocumentsTab({ orderId }: OrderDocumentsTabProps) {
    const { data: documents, isLoading, error } = useOrderDocuments(orderId);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    if (error || !documents || documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Documents</h3>
                <p className="text-sm text-muted-foreground">
                    No documents have been uploaded for this order yet.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {documents.map((doc) => (
                <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                                {doc.documentType} &middot; {(doc.fileSize / 1024).toFixed(1)} KB
                                {doc.uploadedByName && ` &middot; ${doc.uploadedByName}`}
                            </p>
                        </div>
                    </div>
                    {doc.url && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
