"use client";

import { useQuery } from "@tanstack/react-query";
import { useLoadDocuments } from "@/lib/hooks/tms/use-loads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadDocumentsTabProps {
    loadId: string;
}

export function LoadDocumentsTab({ loadId }: LoadDocumentsTabProps) {
    const { data: documents, isLoading } = useLoadDocuments(loadId);

    if (isLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>;
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 dashed border-muted-foreground/30">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No documents yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Upload BOLs, PODs, or Rate Confirmations.</p>
                <Button>
                    <Upload className="h-4 w-4 mr-2" /> Upload Document
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Documents ({documents.length})</h3>
                <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {documents.map((doc: any) => (
                    <Card key={doc.id} className="hover:bg-muted/5 transition-colors">
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded text-blue-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div className="font-medium truncate" title={doc.name}>{doc.name}</div>
                                    <Badge variant={doc.status === 'signed' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                                        {doc.status}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {doc.type} • {new Date(doc.date).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button variant="ghost" size="xs" className="h-6 px-2">
                                        <Eye className="h-3 w-3 mr-1" /> View
                                    </Button>
                                    <Button variant="ghost" size="xs" className="h-6 px-2">
                                        <Download className="h-3 w-3 mr-1" /> Download
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
