"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { FormPage } from "@/components/patterns/form-page";
import { LoadFormSections, loadFormSchema, LoadFormValues } from "@/components/tms/loads/load-form";
import { useLoad, useUpdateLoad } from "@/lib/hooks/tms/use-loads";

export default function EditLoadPage() {
    const params = useParams();
    const loadId = params.id as string;

    const { data: loadData, isLoading, error } = useLoad(loadId);
    const updateLoad = useUpdateLoad(loadId);

    // Prepare default values from load data
    const defaultValues = React.useMemo((): LoadFormValues => {
        if (!loadData || !loadData.stops) {
            // Fallback blank form
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

        // Pre-fill from existing load
        return {
            orderId: loadData.orderId,
            equipmentType: loadData.equipmentType || "",
            commodity: loadData.commodity,
            weight: loadData.weight,
            pieces: undefined,
            pallets: undefined,
            isHazmat: false,
            hazmatClass: undefined,
            temperatureMin: undefined,
            temperatureMax: loadData.temperature,
            specialHandling: undefined,
            stops: loadData.stops.map(stop => ({
                stopType: stop.stopType,
                stopSequence: stop.stopSequence,
                facilityName: stop.facilityName,
                addressLine1: stop.address || "",
                addressLine2: undefined,
                city: stop.city,
                state: stop.state,
                postalCode: stop.zip || "",
                country: "US",
                contactName: stop.contactName,
                contactPhone: stop.contactPhone,
                contactEmail: undefined,
                appointmentRequired: !!stop.appointmentDate,
                appointmentDate: stop.appointmentDate,
                appointmentTimeStart: stop.appointmentTime,
                appointmentTimeEnd: undefined,
                specialInstructions: stop.notes,
            })),
            carrierId: loadData.carrierId,
            driverName: loadData.driverName,
            driverPhone: loadData.driverPhone,
            truckNumber: loadData.truckNumber,
            trailerNumber: loadData.trailerNumber,
            carrierRate: loadData.carrierRate,
            accessorials: loadData.accessorials || [],
            fuelSurcharge: loadData.fuelSurcharge,
            carrierPaymentTerms: undefined,
            dispatchNotes: loadData.dispatchNotes,
        };
    }, [loadData]);

    const handleSubmit = React.useCallback(async (values: LoadFormValues) => {
        await updateLoad.mutateAsync(values);
    }, [updateLoad]);

    const pageTitle = `Edit Load ${loadData?.loadNumber || ""}`;
    const pageDescription = loadData
        ? `${loadData.loadNumber} • ${loadData.order.customer.name}`
        : "Loading...";

    return (
        <FormPage<LoadFormValues>
            title={pageTitle}
            description={pageDescription}
            schema={loadFormSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            submitLabel="Save Changes"
            cancelLabel="Cancel"
            onCancel={() => window.location.href = `/operations/loads/${loadId}`}
        >
            {(form) => (
                <LoadFormSections
                    form={form}
                    customerRate={undefined}
                    isFromOrder={false}
                    mode="edit"
                    loadStatus={loadData?.status}
                />
            )}
        </FormPage>
    );
}
