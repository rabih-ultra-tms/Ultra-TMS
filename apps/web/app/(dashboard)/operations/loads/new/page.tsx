"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { FormPage } from "@/components/patterns/form-page";
import { LoadFormSections, loadFormSchema, LoadFormValues } from "@/components/tms/loads/load-form";
import { useCreateLoad, useOrder } from "@/lib/hooks/tms/use-loads";

// ---------------------------------------------------------------------------
// NewLoadPage — Create a new load (optionally from an order)
// ---------------------------------------------------------------------------

export default function NewLoadPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") || undefined;

    const { data: order, isLoading: isLoadingOrder, error: orderError } = useOrder(orderId);
    const createLoad = useCreateLoad();

    // Prepare default values
    const defaultValues = React.useMemo((): LoadFormValues => {
        if (!order) {
            // Blank form
            return {
                equipmentType: "",
                stops: [
                    {
                        stopType: "PICKUP",
                        stopSequence: 1,
                        addressLine1: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "US",
                        appointmentRequired: false,
                    },
                    {
                        stopType: "DELIVERY",
                        stopSequence: 2,
                        addressLine1: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "US",
                        appointmentRequired: false,
                    },
                ],
                isHazmat: false,
                accessorials: [],
            };
        }

        // Pre-fill from order
        return {
            orderId: order.id,
            equipmentType: order.equipmentType || "",
            commodity: order.commodity,
            weight: order.weightLbs,
            pieces: order.pieceCount,
            pallets: order.palletCount,
            isHazmat: order.isHazmat || false,
            hazmatClass: order.hazmatClass,
            temperatureMin: order.temperatureMin,
            temperatureMax: order.temperatureMax,
            stops: order.stops.map((stop, index) => ({
                stopType: stop.stopType,
                stopSequence: stop.stopSequence || index + 1,
                facilityName: stop.facilityName,
                addressLine1: stop.addressLine1,
                addressLine2: stop.addressLine2,
                city: stop.city,
                state: stop.state,
                postalCode: stop.postalCode,
                country: stop.country || "US",
                contactName: stop.contactName,
                contactPhone: stop.contactPhone,
                contactEmail: stop.contactEmail,
                appointmentRequired: stop.appointmentRequired || false,
                appointmentDate: stop.appointmentDate,
                appointmentTimeStart: stop.appointmentTimeStart,
                appointmentTimeEnd: stop.appointmentTimeEnd,
                specialInstructions: stop.specialInstructions,
            })),
            accessorials: [],
        };
    }, [order]);

    const handleSubmit = async (values: LoadFormValues) => {
        await createLoad.mutateAsync(values);
    };

    const pageTitle = orderId ? `Build Load from Order ${order?.orderNumber || ""}` : "New Load";
    const pageDescription = orderId
        ? `Creating a load from order #${order?.orderNumber || orderId}`
        : "Create a new load";

    return (
        <FormPage
            title={pageTitle}
            description={pageDescription}
            backPath="/operations/loads"
            schema={loadFormSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isLoadingOrder}
            isSubmitting={createLoad.isPending}
            error={orderError ? new Error("Failed to load order") : null}
            submitLabel="Create Load"
            cancelLabel="Cancel"
        >
            {(form) => (
                <LoadFormSections
                    form={form}
                    customerRate={order?.customerRate}
                    isFromOrder={!!orderId}
                />
            )}
        </FormPage>
    );
}
