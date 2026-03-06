"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FormPage } from "@/components/patterns/form-page";
import { LoadFormSections, loadFormSchema, LoadFormValues } from "@/components/tms/loads/load-form";
import { useLoad, useUpdateLoad } from "@/lib/hooks/tms/use-loads";

export default function EditLoadPage() {
    const params = useParams();
    const router = useRouter();
    const loadId = params.id as string;

    const { data: loadData, isLoading, error } = useLoad(loadId);
    const updateLoad = useUpdateLoad(loadId);

    // Helper: Prisma Decimal fields serialize as {} — safely convert to number
    const toNum = (v: unknown): number | undefined => {
        if (v === null || v === undefined) return undefined;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') { const n = Number(v); return isNaN(n) ? undefined : n; }
        // Prisma Decimal serializes as {} or {s:1, e:0, d:[...]}
        if (typeof v === 'object') {
            const str = String(v);
            if (str === '[object Object]') return undefined;
            const n = Number(str);
            return isNaN(n) ? undefined : n;
        }
        return undefined;
    };

    // Prepare default values from load data
    const defaultValues = React.useMemo((): LoadFormValues => {
        const emptyStops = [
            { stopType: "PICKUP" as const, stopSequence: 1, addressLine1: "", city: "", state: "", postalCode: "", country: "US", appointmentRequired: false },
            { stopType: "DELIVERY" as const, stopSequence: 2, addressLine1: "", city: "", state: "", postalCode: "", country: "US", appointmentRequired: false },
        ];

        if (!loadData) {
            return { equipmentType: "", stops: emptyStops, isHazmat: false, accessorials: [] };
        }

        // Stops: prefer load.stops, fall back to order.stops (order stops use different field names)
        const rawLoadStops = loadData.stops ?? [];
        const rawOrderStops = loadData.order?.stops ?? [];
        const hasLoadStops = rawLoadStops.length > 0;
        const sourceStops = hasLoadStops ? rawLoadStops : rawOrderStops;

        const mappedStops = sourceStops.length > 0
            ? sourceStops.map(stop => ({
                stopType: (stop.stopType === 'PICKUP' ? 'PICKUP' : 'DELIVERY') as 'PICKUP' | 'DELIVERY',
                stopSequence: stop.stopSequence,
                facilityName: stop.facilityName,
                // Load stops use "address"/"zip", order stops use "addressLine1"/"postalCode"
                addressLine1: ('addressLine1' in stop ? stop.addressLine1 : (stop as Record<string, unknown>).address as string) || "",
                addressLine2: ('addressLine2' in stop ? (stop.addressLine2 ?? undefined) : undefined),
                city: stop.city,
                state: stop.state,
                postalCode: ('postalCode' in stop ? stop.postalCode : (stop as Record<string, unknown>).zip as string) || "",
                country: "US",
                contactName: stop.contactName,
                contactPhone: stop.contactPhone,
                contactEmail: ('contactEmail' in stop ? (stop.contactEmail ?? undefined) : undefined),
                appointmentRequired: !!stop.appointmentDate || ('appointmentRequired' in stop ? !!stop.appointmentRequired : false),
                appointmentDate: stop.appointmentDate,
                appointmentTimeStart: ('appointmentTimeStart' in stop ? stop.appointmentTimeStart : (stop as Record<string, unknown>).appointmentTime as string | undefined),
                appointmentTimeEnd: ('appointmentTimeEnd' in stop ? (stop.appointmentTimeEnd ?? undefined) : undefined),
                specialInstructions: ('specialInstructions' in stop ? (stop.specialInstructions ?? undefined) : (stop as Record<string, unknown>).notes as string | undefined),
            }))
            : emptyStops;

        return {
            orderId: loadData.orderId,
            equipmentType: loadData.equipmentType || "",
            commodity: loadData.commodity ?? undefined,
            weight: toNum(loadData.weight),
            pieces: undefined,
            pallets: undefined,
            isHazmat: false,
            hazmatClass: undefined,
            temperatureMin: undefined,
            temperatureMax: toNum(loadData.temperature),
            specialHandling: undefined,
            stops: mappedStops,
            carrierId: loadData.carrierId ?? undefined,
            driverName: loadData.driverName ?? undefined,
            driverPhone: loadData.driverPhone ?? undefined,
            truckNumber: loadData.truckNumber ?? undefined,
            trailerNumber: loadData.trailerNumber ?? undefined,
            carrierRate: toNum(loadData.carrierRate),
            accessorials: loadData.accessorials || [],
            fuelSurcharge: toNum(loadData.fuelSurcharge),
            carrierPaymentTerms: undefined,
            dispatchNotes: loadData.dispatchNotes ?? undefined,
        };
    }, [loadData]);

    const handleSubmit = React.useCallback(async (values: LoadFormValues) => {
        await updateLoad.mutateAsync(values);
    }, [updateLoad]);

    // Extract carrier info for the form
    const initialCarrier = React.useMemo(() => {
        if (!loadData?.carrier) return undefined;
        return {
            id: loadData.carrier.id,
            companyName: loadData.carrier.legalName,
            mcNumber: loadData.carrier.mcNumber,
        };
    }, [loadData?.carrier]);

    // Extract order info for the form
    const orderInfo = React.useMemo(() => {
        if (!loadData?.order) return undefined;
        return {
            id: loadData.order.id,
            orderNumber: loadData.order.orderNumber,
            customerName: loadData.order.customer.name,
        };
    }, [loadData?.order]);

    // Customer rate from order (if available)
    const customerRate = React.useMemo(() => {
        const loadRecord = loadData as typeof loadData & { order?: { customerRate?: number } };
        return Number(loadRecord?.order?.customerRate) || undefined;
    }, [loadData]);

    const pageTitle = `Edit Load ${loadData?.loadNumber || ""}`;
    const pageDescription = loadData
        ? `${loadData.loadNumber} • ${loadData.order.customer.name}`
        : "Loading...";

    return (
        <FormPage<LoadFormValues>
            key={isLoading ? 'loading' : 'loaded'}
            title={pageTitle}
            description={pageDescription}
            schema={loadFormSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            submitLabel="Save Changes"
            cancelLabel="Cancel"
            onCancel={() => router.push(`/operations/loads/${loadId}`)}
        >
            {(form) => (
                <LoadFormSections
                    form={form}
                    customerRate={customerRate}
                    isFromOrder={!!loadData?.orderId}
                    mode="edit"
                    loadStatus={loadData?.status}
                    initialCarrier={initialCarrier}
                    orderInfo={orderInfo}
                />
            )}
        </FormPage>
    );
}
