"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/lib/hooks/tms/use-orders";
import { OrderForm } from "@/components/tms/orders/order-form";
import type { OrderFormValues, StopFormValues } from "@/components/tms/orders/order-form-schema";
import type { OrderDetailResponse } from "@/types/orders";

function mapOrderToFormValues(order: OrderDetailResponse): Partial<OrderFormValues> {
  return {
    // Step 1: Customer & Reference
    customerId: order.customerId,
    customerName: order.customer?.companyName || "",
    customerReferenceNumber: order.customerReference || "",
    poNumber: order.poNumber || "",
    bolNumber: order.bolNumber || "",
    salesRepId: order.salesRepId || "",
    priority: "MEDIUM" as const,
    internalNotes: order.internalNotes || "",

    // Step 2: Cargo Details
    commodity: order.commodity || "",
    weight: order.weightLbs || 0,
    pieces: order.pieceCount || null,
    pallets: order.palletCount || null,
    equipmentType: (order.equipmentType || "DRY_VAN") as OrderFormValues["equipmentType"],
    isHazmat: order.isHazmat || false,
    hazmatUnNumber: "",
    hazmatClass: order.hazmatClass || "",
    hazmatPlacard: "",
    tempMin: order.temperatureMin || null,
    tempMax: order.temperatureMax || null,
    specialHandling: [],
    dimensionLength: null,
    dimensionWidth: null,
    dimensionHeight: null,

    // Step 3: Stops
    stops: order.stops.map((stop, index): StopFormValues => ({
      id: stop.id,
      type: stop.stopType,
      facilityName: stop.facilityName || "",
      address: stop.addressLine1,
      city: stop.city,
      state: stop.state,
      zipCode: stop.postalCode,
      contactName: stop.contactName || "",
      contactPhone: stop.contactPhone || "",
      appointmentDate: stop.appointmentDate || "",
      appointmentTimeFrom: stop.appointmentTimeStart || "",
      appointmentTimeTo: stop.appointmentTimeEnd || "",
      weight: null,
      pieces: null,
      pallets: null,
      commodity: "",
      instructions: stop.specialInstructions || "",
      referenceNumber: "",
      sequence: index,
    })),

    // Step 4: Rate & Billing
    customerRate: order.customerRate || null,
    fuelSurcharge: order.fuelSurcharge || null,
    accessorials: [],
    estimatedCarrierRate: null,
    paymentTerms: "NET_30",
    billingContactId: "",
    billingNotes: "",
  };
}

export default function EditOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: order, isLoading, error, refetch } = useOrder(params.id);

  const initialData = React.useMemo(() => {
    if (!order) return undefined;
    return mapOrderToFormValues(order);
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col gap-3">
              <p className="font-semibold">Failed to load order</p>
              <p className="text-sm">
                {(error as Error)?.message || "An error occurred while loading the order."}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/operations/orders")}
                >
                  Back to Orders
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col gap-3">
              <p className="font-semibold">Order not found</p>
              <p className="text-sm">The requested order could not be found.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/operations/orders")}
              >
                Back to Orders
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <OrderForm
      mode="edit"
      orderId={params.id}
      initialData={initialData}
      orderStatus={order.status}
    />
  );
}
