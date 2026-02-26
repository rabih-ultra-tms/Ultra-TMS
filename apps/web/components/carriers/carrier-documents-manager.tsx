"use client";

import { useRef, useState } from "react";
import {
    useCarrierDocuments,
    useCreateCarrierDocument,
    useDeleteCarrierDocument,
} from "@/lib/hooks/operations";
import {
    OperationsCarrierDocument,
    DOCUMENT_TYPES,
    DOCUMENT_TYPE_LABELS,
    DOCUMENT_STATUS_LABELS,
} from "@/types/carriers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Trash2, Loader2, FileText, Paperclip, Download } from "lucide-react";
import { toast } from "sonner";

const DOC_STORAGE_PREFIX = "carrier-doc-file:";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
};

interface DocumentFormData {
    documentType: string;
    name: string;
    description: string;
    expiryDate: string;
    file: File | null;
}

const EMPTY_FORM: DocumentFormData = {
    documentType: "",
    name: "",
    description: "",
    expiryDate: "",
    file: null,
};

interface CarrierDocumentsManagerProps {
    carrierId: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function getStoredFile(docId: string): string | null {
    try {
        return localStorage.getItem(DOC_STORAGE_PREFIX + docId);
    } catch {
        return null;
    }
}

function removeStoredFile(docId: string) {
    try {
        localStorage.removeItem(DOC_STORAGE_PREFIX + docId);
    } catch { /* ignore */ }
}

export function CarrierDocumentsManager({ carrierId }: CarrierDocumentsManagerProps) {
    const { data: rawDocs, isLoading } = useCarrierDocuments(carrierId);
    const documents: OperationsCarrierDocument[] = Array.isArray(rawDocs) ? rawDocs : [];

    const createDocument = useCreateCarrierDocument(carrierId);
    const deleteDocument = useDeleteCarrierDocument(carrierId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [form, setForm] = useState<DocumentFormData>(EMPTY_FORM);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const set = (field: keyof Omit<DocumentFormData, "file">) => (value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleTypeChange = (type: string) => {
        setForm((prev) => ({
            ...prev,
            documentType: type,
            name: prev.name || DOCUMENT_TYPE_LABELS[type] || "",
        }));
    };

    const handleSave = async () => {
        if (!form.documentType) {
            toast.error("Document type is required");
            return;
        }
        if (!form.name.trim()) {
            toast.error("Document name is required");
            return;
        }

        try {
            const doc = await createDocument.mutateAsync({
                documentType: form.documentType,
                name: form.name.trim(),
                description: form.description || undefined,
                expiryDate: form.expiryDate || undefined,
            });

            // Save file to localStorage if one was selected
            if (form.file && doc) {
                const id = (doc as unknown as { data?: { id?: string }; id?: string })?.data?.id
                    ?? (doc as unknown as { id?: string })?.id;
                if (id) {
                    try {
                        const dataUrl = await readFileAsDataUrl(form.file);
                        localStorage.setItem(DOC_STORAGE_PREFIX + id, JSON.stringify({
                            name: form.file.name,
                            type: form.file.type,
                            data: dataUrl,
                        }));
                    } catch {
                        toast.warning("Document saved but file could not be stored locally");
                    }
                }
            }

            setDialogOpen(false);
            setForm(EMPTY_FORM);
        } catch {
            // Handled by mutation onError
        }
    };

    const handleDelete = async () => {
        if (!deletingDocId) return;
        await deleteDocument.mutateAsync(deletingDocId);
        removeStoredFile(deletingDocId);
        setDeletingDocId(null);
    };

    const handleDownload = (doc: OperationsCarrierDocument) => {
        const stored = getStoredFile(doc.id);
        if (!stored) {
            toast.info("No file stored for this document");
            return;
        }
        try {
            const { name, data } = JSON.parse(stored) as { name: string; type: string; data: string };
            const a = document.createElement("a");
            a.href = data;
            a.download = name;
            a.click();
        } catch {
            toast.error("Could not retrieve file");
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documents
                            {documents.length > 0 && (
                                <Badge variant="secondary">{documents.length}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Carrier documents and compliance records.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Document
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading documents...
                        </div>
                    ) : documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No documents added yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-4 font-medium">Type</th>
                                        <th className="pb-2 pr-4 font-medium">Name</th>
                                        <th className="pb-2 pr-4 font-medium">Expires</th>
                                        <th className="pb-2 pr-4 font-medium">Status</th>
                                        <th className="pb-2 pr-4 font-medium">File</th>
                                        <th className="pb-2 font-medium" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => {
                                        const hasFile = !!getStoredFile(doc.id);
                                        return (
                                            <tr key={doc.id} className="border-b last:border-0">
                                                <td className="py-2 pr-4">
                                                    <Badge variant="outline">
                                                        {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 pr-4 font-medium">{doc.name}</td>
                                                <td className="py-2 pr-4 text-muted-foreground">
                                                    {doc.expiryDate
                                                        ? String(doc.expiryDate).slice(0, 10)
                                                        : "—"}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <Badge variant={STATUS_COLORS[doc.status] ?? "secondary"}>
                                                        {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {hasFile ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 gap-1 text-xs"
                                                            onClick={() => handleDownload(doc)}
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            Download
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="py-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => setDeletingDocId(doc.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Document Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Document</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-1">
                            <Label>Document Type *</Label>
                            <Select value={form.documentType} onValueChange={handleTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {DOCUMENT_TYPE_LABELS[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="doc-name">Document Name *</Label>
                            <Input
                                id="doc-name"
                                value={form.name}
                                onChange={(e) => set("name")(e.target.value)}
                                placeholder="e.g. W-9 2026"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="doc-expiry">Expiry Date</Label>
                            <Input
                                id="doc-expiry"
                                type="date"
                                value={form.expiryDate}
                                onChange={(e) => set("expiryDate")(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Upload File</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    {form.file ? "Change File" : "Choose File"}
                                </Button>
                                {form.file ? (
                                    <span className="text-sm text-muted-foreground truncate max-w-[180px]" title={form.file.name}>
                                        {form.file.name}
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">No file selected</span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setForm((prev) => ({ ...prev, file }));
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                PDF, Word, Excel, or images. Stored locally in browser.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createDocument.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={createDocument.isPending}>
                            {createDocument.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <ConfirmDialog
                open={!!deletingDocId}
                title="Delete Document"
                description="Are you sure you want to delete this document record? This cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
                onCancel={() => setDeletingDocId(null)}
            />
        </>
    );
}
