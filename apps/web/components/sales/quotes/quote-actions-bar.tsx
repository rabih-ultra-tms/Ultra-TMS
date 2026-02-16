"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Pencil,
  Copy,
  Send,
  ArrowRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  useCloneQuote,
  useSendQuote,
  useConvertQuote,
  useDeleteQuote,
  useAcceptQuote,
  useRejectQuote,
  useCreateQuoteVersion,
} from "@/lib/hooks/sales/use-quotes";
import type { QuoteStatus } from "@/types/quotes";

interface QuoteActionsBarProps {
  quoteId: string;
  status: QuoteStatus;
  convertedOrderId?: string;
}

// Actions available per status (from design spec)
const STATUS_PRIMARY_ACTIONS: Record<QuoteStatus, string[]> = {
  DRAFT: ["edit", "send", "clone"],
  SENT: ["clone"],
  VIEWED: ["accept", "clone"],
  ACCEPTED: ["convert", "clone"],
  CONVERTED: ["clone"],
  REJECTED: ["clone"],
  EXPIRED: ["clone"],
};

const STATUS_SECONDARY_ACTIONS: Record<QuoteStatus, string[]> = {
  DRAFT: ["delete"],
  SENT: ["revise"],
  VIEWED: ["reject", "revise"],
  ACCEPTED: [],
  CONVERTED: ["viewOrder"],
  REJECTED: ["revise"],
  EXPIRED: ["revise"],
};

export function QuoteActionsBar({ quoteId, status, convertedOrderId }: QuoteActionsBarProps) {
  const router = useRouter();

  const cloneMutation = useCloneQuote();
  const sendMutation = useSendQuote();
  const convertMutation = useConvertQuote();
  const deleteMutation = useDeleteQuote();
  const acceptMutation = useAcceptQuote();
  const rejectMutation = useRejectQuote();
  const revisionMutation = useCreateQuoteVersion();

  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const primaryActions = STATUS_PRIMARY_ACTIONS[status] ?? [];
  const secondaryActions = STATUS_SECONDARY_ACTIONS[status] ?? [];

  const handleClone = () => {
    cloneMutation.mutate(quoteId, {
      onSuccess: (data) => {
        if (data?.id) router.push(`/quotes/${data.id}`);
      },
    });
  };

  const handleSend = () => {
    sendMutation.mutate(quoteId, {
      onSuccess: () => setShowSendConfirm(false),
    });
  };

  const handleConvert = () => {
    convertMutation.mutate(quoteId, {
      onSuccess: (data) => {
        setShowConvertConfirm(false);
        if (data?.orderId) router.push(`/operations/orders/${data.orderId}`);
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(quoteId, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        router.push("/quotes");
      },
    });
  };

  const handleAccept = () => {
    acceptMutation.mutate(quoteId);
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { id: quoteId, reason: "Rejected by agent" },
      { onSuccess: () => setShowRejectConfirm(false) }
    );
  };

  const handleRevise = () => {
    revisionMutation.mutate(quoteId, {
      onSuccess: (data) => {
        if (data?.id) router.push(`/quotes/${data.id}/edit`);
      },
    });
  };

  const isActing =
    cloneMutation.isPending ||
    sendMutation.isPending ||
    convertMutation.isPending ||
    deleteMutation.isPending ||
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    revisionMutation.isPending;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Primary action buttons */}
        {primaryActions.includes("edit") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/quotes/${quoteId}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}

        {primaryActions.includes("send") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSendConfirm(true)}
            disabled={isActing}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        )}

        {primaryActions.includes("accept") && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAccept}
            disabled={isActing}
          >
            {acceptMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Accept
          </Button>
        )}

        {primaryActions.includes("convert") && (
          <Button
            size="sm"
            onClick={() => setShowConvertConfirm(true)}
            disabled={isActing}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Convert to Order
          </Button>
        )}

        {primaryActions.includes("clone") && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClone}
            disabled={isActing}
          >
            {cloneMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Clone
          </Button>
        )}

        {/* Secondary actions dropdown */}
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {secondaryActions.includes("revise") && (
                <DropdownMenuItem onClick={handleRevise} disabled={isActing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Revise Quote
                </DropdownMenuItem>
              )}

              {secondaryActions.includes("reject") && (
                <DropdownMenuItem onClick={() => setShowRejectConfirm(true)} disabled={isActing}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Rejected
                </DropdownMenuItem>
              )}

              {secondaryActions.includes("viewOrder") && convertedOrderId && (
                <DropdownMenuItem onClick={() => router.push(`/operations/orders/${convertedOrderId}`)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Order
                </DropdownMenuItem>
              )}

              {secondaryActions.includes("delete") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive focus:text-destructive"
                    disabled={isActing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Confirmation dialogs */}
      <ConfirmDialog
        open={showSendConfirm}
        title="Send Quote"
        description="Are you sure you want to send this quote to the customer?"
        confirmLabel="Send"
        isLoading={sendMutation.isPending}
        onConfirm={handleSend}
        onCancel={() => setShowSendConfirm(false)}
      />

      <ConfirmDialog
        open={showConvertConfirm}
        title="Convert to Order"
        description="This will create a new TMS order from this quote. The quote status will be updated to Converted."
        confirmLabel="Convert"
        isLoading={convertMutation.isPending}
        onConfirm={handleConvert}
        onCancel={() => setShowConvertConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Quote"
        description="Are you sure you want to delete this draft quote? This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={showRejectConfirm}
        title="Reject Quote"
        description="Mark this quote as rejected? You can create a new revision later."
        confirmLabel="Reject"
        variant="destructive"
        isLoading={rejectMutation.isPending}
        onConfirm={handleReject}
        onCancel={() => setShowRejectConfirm(false)}
      />
    </>
  );
}
