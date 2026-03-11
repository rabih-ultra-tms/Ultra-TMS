"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Load, LoadStatus } from "@/types/loads";
import { ChevronDown, Edit, Printer, Copy, Mail, Send, FileText, Download, Loader2, Truck, Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadStatusBadge } from "./load-status-badge";
import { EmailPreviewDialog, EmailType } from "@/components/tms/emails/email-preview-dialog";
import { useBol } from "@/lib/hooks/tms/use-bol";
import { useTenderLoad, useAcceptTender, useRejectTender, useCarriers, TenderLoadInput } from "@/lib/hooks/tms/use-loads";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LoadDetailHeaderProps {
    load: Load;
}

function getCarrierEmail(load: Load): string {
    return load.carrier?.dispatchEmail || load.carrier?.contactEmail || "";
}

function getCustomerEmail(load: Load): string {
    return load.order?.customer?.contactEmail || load.order?.customer?.email || "";
}

/** Which email actions are available based on load status */
function getAvailableEmails(load: Load): EmailType[] {
    const emails: EmailType[] = [];
    const s = load.status;

    // Rate Confirmation: available once dispatched or later
    if ([LoadStatus.DISPATCHED, LoadStatus.AT_PICKUP, LoadStatus.PICKED_UP, LoadStatus.IN_TRANSIT, LoadStatus.AT_DELIVERY, LoadStatus.DELIVERED, LoadStatus.COMPLETED].includes(s)) {
        emails.push("rate_confirmation");
    }

    // Load Tendered: available when tendered or accepted
    if ([LoadStatus.TENDERED, LoadStatus.ACCEPTED].includes(s)) {
        emails.push("load_tendered");
    }

    // Pickup Reminder: available from tendered through dispatched
    if ([LoadStatus.TENDERED, LoadStatus.ACCEPTED, LoadStatus.DISPATCHED].includes(s)) {
        emails.push("pickup_reminder");
    }

    // Delivery Confirmation: available when delivered or completed
    if ([LoadStatus.DELIVERED, LoadStatus.COMPLETED].includes(s)) {
        emails.push("delivery_confirmation");
    }

    return emails;
}

const EMAIL_LABELS: Record<EmailType, string> = {
    rate_confirmation: "Send Rate Confirmation",
    load_tendered: "Send Tender Notification",
    pickup_reminder: "Send Pickup Reminder",
    delivery_confirmation: "Send Delivery Confirmation",
    invoice_sent: "Send Invoice Email",
};

export function LoadDetailHeader({ load }: LoadDetailHeaderProps) {
    const router = useRouter();
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [activeEmailType, setActiveEmailType] = useState<EmailType>("rate_confirmation");
    const [tenderDialogOpen, setTenderDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [tenderCarrierSearch, setTenderCarrierSearch] = useState("");
    const [selectedCarrierId, setSelectedCarrierId] = useState("");
    const [tenderNotes, setTenderNotes] = useState("");
    const [tenderRate, setTenderRate] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    const { generate: generateBol, download: downloadBol, isGenerating: isBolGenerating, hasGenerated: hasBol } = useBol(load.id);

    const tenderMutation = useTenderLoad(load.id);
    const acceptMutation = useAcceptTender(load.id);
    const rejectMutation = useRejectTender(load.id);

    const { data: carrierData } = useCarriers({
        search: tenderCarrierSearch,
        limit: 10,
    });
    const carriers = carrierData?.data ?? [];

    const canTender = load.status === LoadStatus.PENDING;
    const canAcceptReject = load.status === LoadStatus.TENDERED;

    const handleTender = () => {
        if (!selectedCarrierId) return;
        const input: TenderLoadInput = {
            carrierId: selectedCarrierId,
            ...(tenderNotes ? { notes: tenderNotes } : {}),
            ...(tenderRate ? { rate: parseFloat(tenderRate) } : {}),
        };
        tenderMutation.mutate(input, {
            onSuccess: () => {
                setTenderDialogOpen(false);
                setSelectedCarrierId("");
                setTenderNotes("");
                setTenderRate("");
                setTenderCarrierSearch("");
            },
        });
    };

    const handleAccept = () => {
        acceptMutation.mutate();
    };

    const handleReject = () => {
        rejectMutation.mutate(
            rejectReason ? { reason: rejectReason } : undefined,
            {
                onSuccess: () => {
                    setRejectDialogOpen(false);
                    setRejectReason("");
                },
            },
        );
    };

    const availableEmails = getAvailableEmails(load);

    const openEmailDialog = (type: EmailType) => {
        setActiveEmailType(type);
        setEmailDialogOpen(true);
    };

    const isCarrierEmail = activeEmailType !== "delivery_confirmation";
    const recipientEmail = isCarrierEmail
        ? getCarrierEmail(load)
        : getCustomerEmail(load);
    const recipientName = isCarrierEmail
        ? load.carrier?.legalName
        : load.order?.customer?.name;

    // Rate con PDF attachment if available
    const attachments = activeEmailType === "rate_confirmation"
        ? [{ name: `Rate-Con-${load.loadNumber}.pdf`, url: `/loads/${load.id}/rate-confirmation`, mimeType: "application/pdf" }]
        : undefined;

    return (
        <div className="flex flex-col gap-4 border-b bg-background px-6 py-4 shadow-sm">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/operations/loads" className="hover:text-foreground">Operations</Link>
                <span>/</span>
                <Link href="/operations/loads" className="hover:text-foreground">Loads</Link>
                <span>/</span>
                <span className="text-foreground font-medium">{load.loadNumber}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">{load.loadNumber}</h1>
                    <LoadStatusBadge status={load.status} />

                    {load.carrier ? (
                        <Link href={`/carriers/${load.carrier.id}`} className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                            {load.carrier.legalName}
                        </Link>
                    ) : (
                        <span className="text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded text-sm">Unassigned</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Tender button — visible when load is PENDING */}
                    {canTender && (
                        <Button size="sm" onClick={() => setTenderDialogOpen(true)}>
                            <Truck className="h-4 w-4 mr-2" />
                            Tender to Carrier
                        </Button>
                    )}

                    {/* Accept / Reject buttons — visible when load is TENDERED */}
                    {canAcceptReject && (
                        <>
                            <Button size="sm" variant="default" onClick={handleAccept} disabled={acceptMutation.isPending}>
                                {acceptMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                Accept Tender
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setRejectDialogOpen(true)} disabled={rejectMutation.isPending}>
                                <X className="h-4 w-4 mr-2" />
                                Reject Tender
                            </Button>
                        </>
                    )}

                    <Button variant="outline" size="sm" onClick={() => router.push(`/operations/loads/${load.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Load
                    </Button>

                    {availableEmails.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email <ChevronDown className="h-4 w-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Send Email</DropdownMenuLabel>
                                {availableEmails.map((type) => (
                                    <DropdownMenuItem key={type} onClick={() => openEmailDialog(type)}>
                                        <Send className="h-4 w-4 mr-2" />
                                        {EMAIL_LABELS[type]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Actions <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(load.loadNumber);
                            }}>
                                <Copy className="h-4 w-4 mr-2" /> Copy Load Number
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                                <Printer className="h-4 w-4 mr-2" /> Print Summary
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Documents</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => generateBol({})} disabled={isBolGenerating}>
                                {isBolGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                                {isBolGenerating ? "Generating BOL..." : "Generate BOL"}
                            </DropdownMenuItem>
                            {hasBol && (
                                <DropdownMenuItem onClick={downloadBol}>
                                    <Download className="h-4 w-4 mr-2" /> Download BOL
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" disabled>
                                Delete Load
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <EmailPreviewDialog
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
                emailType={activeEmailType}
                loadId={load.id}
                loadNumber={load.loadNumber}
                recipientEmail={recipientEmail}
                recipientName={recipientName}
                recipientType={isCarrierEmail ? "CARRIER" : "CONTACT"}
                recipientId={isCarrierEmail ? load.carrierId : load.order?.customer?.id}
                attachments={attachments}
                variables={{
                    loadNumber: load.loadNumber,
                    carrierName: load.carrier?.legalName,
                    customerName: load.order?.customer?.name,
                    originCity: load.originCity,
                    originState: load.originState,
                    destinationCity: load.destinationCity,
                    destinationState: load.destinationState,
                    pickupDate: load.pickupDate,
                    deliveryDate: load.deliveryDate,
                }}
            />

            {/* Tender to Carrier Dialog */}
            <Dialog open={tenderDialogOpen} onOpenChange={setTenderDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tender Load to Carrier</DialogTitle>
                        <DialogDescription>
                            Select a carrier to tender load {load.loadNumber} to.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="carrier-search">Search Carriers</Label>
                            <Input
                                id="carrier-search"
                                placeholder="Search by name, MC#..."
                                value={tenderCarrierSearch}
                                onChange={(e) => setTenderCarrierSearch(e.target.value)}
                            />
                            {carriers.length > 0 && (
                                <div className="border rounded-md max-h-48 overflow-y-auto">
                                    {carriers.map((carrier) => (
                                        <button
                                            key={carrier.id}
                                            type="button"
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${selectedCarrierId === carrier.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                                            onClick={() => setSelectedCarrierId(carrier.id)}
                                        >
                                            <div className="font-medium">{carrier.legalName}</div>
                                            <div className="text-muted-foreground text-xs">
                                                MC# {carrier.mcNumber}
                                                {carrier.scorecard ? ` | Score: ${carrier.scorecard.score}` : ""}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {tenderCarrierSearch && carriers.length === 0 && (
                                <p className="text-sm text-muted-foreground py-2">No carriers found</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tender-rate">Rate ($)</Label>
                            <Input
                                id="tender-rate"
                                type="number"
                                step="0.01"
                                placeholder={load.carrierRate ? String(load.carrierRate) : "Enter rate"}
                                value={tenderRate}
                                onChange={(e) => setTenderRate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tender-notes">Notes (optional)</Label>
                            <Textarea
                                id="tender-notes"
                                placeholder="Any notes for the carrier..."
                                value={tenderNotes}
                                onChange={(e) => setTenderNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTenderDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleTender}
                            disabled={!selectedCarrierId || tenderMutation.isPending}
                        >
                            {tenderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Tender Load
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Tender Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Tender</DialogTitle>
                        <DialogDescription>
                            Rejecting the tender will set the load back to Pending and unassign the carrier.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Reason (optional)</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Reason for rejecting..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Reject Tender
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
