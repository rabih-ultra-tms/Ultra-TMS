"use client";

import { Suspense } from "react";
import { OrderForm } from "@/components/tms/orders/order-form";
import { FormPageSkeleton } from "@/components/shared/form-page-skeleton";

export default function NewOrderPage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <OrderForm />
    </Suspense>
  );
}
