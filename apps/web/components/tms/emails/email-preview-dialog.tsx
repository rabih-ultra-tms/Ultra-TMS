"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Loader2, Paperclip, Mail } from "lucide-react";
import { useSendEmail, SendEmailPayload } from "@/lib/hooks/communication/use-send-email";

export type EmailType =
  | "rate_confirmation"
  | "load_tendered"
  | "pickup_reminder"
  | "delivery_confirmation"
  | "invoice_sent";

interface EmailPreset {
  templateCode: string;
  defaultSubject: string;
  defaultBody: string;
  recipientLabel: string;
}

const EMAIL_PRESETS: Record<EmailType, EmailPreset> = {
  rate_confirmation: {
    templateCode: "RATE_CONFIRMATION",
    defaultSubject: "Rate Confirmation - Load {{loadNumber}}",
    defaultBody:
      "Please find attached the rate confirmation for Load {{loadNumber}}. Review and sign at your earliest convenience.",
    recipientLabel: "Carrier Contact",
  },
  load_tendered: {
    templateCode: "LOAD_ASSIGNED",
    defaultSubject: "Load Tender - {{loadNumber}}",
    defaultBody:
      "You have been tendered Load {{loadNumber}}. Please review the details and accept or reject this load.",
    recipientLabel: "Carrier Contact",
  },
  pickup_reminder: {
    templateCode: "LOAD_STATUS_UPDATE",
    defaultSubject: "Pickup Reminder - Load {{loadNumber}}",
    defaultBody:
      "This is a reminder that Load {{loadNumber}} is scheduled for pickup. Please confirm your driver is en route.",
    recipientLabel: "Carrier Contact",
  },
  delivery_confirmation: {
    templateCode: "DOCUMENT_RECEIVED",
    defaultSubject: "Delivery Confirmation - Load {{loadNumber}}",
    defaultBody:
      "Load {{loadNumber}} has been delivered and proof of delivery has been received. Thank you for your business.",
    recipientLabel: "Customer Contact",
  },
  invoice_sent: {
    templateCode: "INVOICE_CREATED",
    defaultSubject: "Invoice - Load {{loadNumber}}",
    defaultBody:
      "Please find attached the invoice for Load {{loadNumber}}. Payment is due per the agreed terms.",
    recipientLabel: "Customer Contact",
  },
};

const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  rate_confirmation: "Rate Confirmation",
  load_tendered: "Load Tender Notification",
  pickup_reminder: "Pickup Reminder",
  delivery_confirmation: "Delivery Confirmation",
  invoice_sent: "Invoice Email",
};

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailType: EmailType;
  loadId: string;
  loadNumber: string;
  recipientEmail: string;
  recipientName?: string;
  recipientType?: "CARRIER" | "CONTACT";
  recipientId?: string;
  attachments?: Array<{ name: string; url: string; mimeType?: string }>;
  variables?: Record<string, unknown>;
}

export function EmailPreviewDialog({
  open,
  onOpenChange,
  emailType,
  loadId,
  loadNumber,
  recipientEmail: initialRecipientEmail,
  recipientName: initialRecipientName,
  recipientType,
  recipientId,
  attachments,
  variables: extraVariables,
}: EmailPreviewDialogProps) {
  const preset = EMAIL_PRESETS[emailType];
  const sendEmail = useSendEmail();

  const [recipientEmail, setRecipientEmail] = useState(initialRecipientEmail);
  const [subject, setSubject] = useState(
    preset.defaultSubject.replace("{{loadNumber}}", loadNumber)
  );
  const [body, setBody] = useState(
    preset.defaultBody.replace(/\{\{loadNumber\}\}/g, loadNumber)
  );

  const handleSend = () => {
    const payload: SendEmailPayload = {
      templateCode: preset.templateCode,
      subject,
      body,
      recipientEmail,
      recipientName: initialRecipientName,
      recipientType: recipientType ?? "CARRIER",
      recipientId,
      entityType: "LOAD",
      entityId: loadId,
      variables: {
        loadNumber,
        ...extraVariables,
      },
      attachments,
    };

    sendEmail.mutate(payload, {
      onSuccess: (data) => {
        if (data.success) {
          onOpenChange(false);
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {EMAIL_TYPE_LABELS[emailType]}
          </DialogTitle>
          <DialogDescription>
            Preview and send this email. You can edit the content before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="recipient">To ({preset.recipientLabel})</Label>
            <Input
              id="recipient"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {attachments && attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Attachments
                </Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att) => (
                    <Badge key={att.name} variant="secondary" className="gap-1">
                      <Paperclip className="h-3 w-3" />
                      {att.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sendEmail.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendEmail.isPending || !recipientEmail}
          >
            {sendEmail.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
