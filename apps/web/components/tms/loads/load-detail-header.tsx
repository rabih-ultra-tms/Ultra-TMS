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
import { ChevronDown, Edit, Printer, Copy, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadStatusBadge } from "./load-status-badge";
import { EmailPreviewDialog, EmailType } from "@/components/tms/emails/email-preview-dialog";

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
                            <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" /> Copy Load Number
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" /> Print Summary
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
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
        </div>
    );
}
