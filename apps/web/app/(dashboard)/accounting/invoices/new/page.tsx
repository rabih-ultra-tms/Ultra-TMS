"use client";

import { Suspense } from "react";
import { InvoiceForm } from "@/components/accounting/invoice-form";
import { FormPageSkeleton } from "@/components/shared/form-page-skeleton";

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <InvoiceForm />
    </Suspense>
  );
}
