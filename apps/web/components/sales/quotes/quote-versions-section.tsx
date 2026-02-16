"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteStatusBadge } from "./quote-status-badge";
import { useQuoteVersions } from "@/lib/hooks/sales/use-quotes";
import type { QuoteVersion } from "@/types/quotes";

interface QuoteVersionsSectionProps {
  quoteId: string;
  currentVersion: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function QuoteVersionsSection({ quoteId, currentVersion }: QuoteVersionsSectionProps) {
  const { data: versions, isLoading } = useQuoteVersions(quoteId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            Loading versions...
          </div>
        </CardContent>
      </Card>
    );
  }

  const versionList = versions ?? [];

  if (versionList.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-sm text-muted-foreground">
            No version history available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Version History ({versionList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versionList
            .sort((a: QuoteVersion, b: QuoteVersion) => b.version - a.version)
            .map((version: QuoteVersion) => (
              <VersionRow
                key={version.id}
                version={version}
                isCurrent={version.version === currentVersion}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VersionRow({ version, isCurrent }: { version: QuoteVersion; isCurrent: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">v{version.version}</span>
          {isCurrent && (
            <Badge variant="default" className="text-[10px]">
              Current
            </Badge>
          )}
        </div>
        <QuoteStatusBadge status={version.status} size="sm" />
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span className="font-mono font-medium text-foreground">
          {formatCurrency(version.totalAmount)}
        </span>
        {version.createdBy && <span>{version.createdBy}</span>}
        <span>{formatDate(version.createdAt)}</span>
      </div>
    </div>
  );
}
