"use client";

import { use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DetailPage } from "@/components/patterns/detail-page";
import { QuoteStatusBadge } from "@/components/sales/quotes/quote-status-badge";
import { QuoteDetailOverview } from "@/components/sales/quotes/quote-detail-overview";
import { QuoteVersionsSection } from "@/components/sales/quotes/quote-versions-section";
import {
  QuoteTimelineSection,
  QuoteNotesSection,
} from "@/components/sales/quotes/quote-timeline-section";
import { QuoteActionsBar } from "@/components/sales/quotes/quote-actions-bar";
import { useQuote } from "@/lib/hooks/sales/use-quotes";
import {
  LayoutDashboard,
  History,
  Clock,
  MessageSquare,
} from "lucide-react";
import type { DetailTab } from "@/components/patterns/detail-page";

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: quote, isLoading, error, refetch } = useQuote(id);

  const tabs: DetailTab[] = [
    {
      value: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      content: quote ? <QuoteDetailOverview quote={quote} /> : null,
    },
    {
      value: "versions",
      label: "Versions",
      icon: History,
      content: quote ? (
        <QuoteVersionsSection quoteId={id} currentVersion={quote.version} />
      ) : null,
    },
    {
      value: "timeline",
      label: "Timeline",
      icon: Clock,
      content: <QuoteTimelineSection quoteId={id} />,
    },
    {
      value: "notes",
      label: "Notes",
      icon: MessageSquare,
      content: <QuoteNotesSection quoteId={id} />,
    },
  ];

  return (
    <DetailPage
      title={
        <span className="flex items-center gap-3">
          <span className="font-mono">{quote?.quoteNumber ?? "Quote"}</span>
          {quote && <QuoteStatusBadge status={quote.status} size="md" />}
          {quote && (
            <Badge variant="outline" className="text-xs font-normal">
              v{quote.version}
            </Badge>
          )}
        </span>
      }
      subtitle={
        quote && (
          <span>
            {quote.customerName ?? "Unknown Customer"} &mdash;{" "}
            {quote.originCity}, {quote.originState} to {quote.destinationCity},{" "}
            {quote.destinationState}
          </span>
        )
      }
      breadcrumb={
        <div className="flex items-center gap-1.5 text-sm">
          <Link href="/quotes" className="hover:text-foreground transition-colors">
            Quotes
          </Link>
          <span>&gt;</span>
          <span>{quote?.quoteNumber ?? "Detail"}</span>
        </div>
      }
      backLink="/quotes"
      backLabel="Back to Quotes"
      actions={
        quote ? (
          <QuoteActionsBar
            quoteId={id}
            status={quote.status}
            convertedOrderId={quote.convertedOrderId}
          />
        ) : undefined
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error as Error | null}
      onRetry={() => refetch()}
    />
  );
}
