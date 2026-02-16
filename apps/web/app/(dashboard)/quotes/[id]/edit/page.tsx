"use client";

import { use } from "react";
import { QuoteFormV2 } from "@/components/sales/quotes/quote-form-v2";
import { useQuote } from "@/lib/hooks/sales/use-quotes";
import { FormPageSkeleton } from "@/components/shared/form-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: quote, isLoading, error } = useQuote(id);

  if (isLoading) {
    return (
      <div className="p-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-6">
        <ErrorState
          title="Quote not found"
          message={error?.message ?? "The quote could not be loaded."}
          backButton={
            <Button variant="outline" asChild>
              <Link href="/quotes">Back to Quotes</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <QuoteFormV2 initialData={quote} quoteId={id} />;
}
