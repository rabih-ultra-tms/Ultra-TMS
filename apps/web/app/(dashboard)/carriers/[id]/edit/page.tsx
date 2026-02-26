"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useCarrier, useUpdateCarrier } from "@/lib/hooks/operations";
import { CarrierForm } from "@/components/carriers/carrier-form";
import { CarrierDriversManager } from "@/components/carriers/carrier-drivers-manager";
import { CarrierTrucksManager } from "@/components/carriers/carrier-trucks-manager";
import { CarrierDocumentsManager } from "@/components/carriers/carrier-documents-manager";
import { FormPageSkeleton } from "@/components/shared/form-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CarrierFormValues } from "@/lib/validations/carriers";

export default function EditCarrierPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: carrier, isLoading, error, refetch } = useCarrier(id);
    const updateMutation = useUpdateCarrier();

    const handleSubmit = async (values: CarrierFormValues) => {
        try {
            await updateMutation.mutateAsync({ id, ...values });
            router.push(`/carriers/${id}`);
            router.refresh();
        } catch (e) {
            // Error handled by mutation toast usually
            console.error(e);
        }
    };

    if (isLoading) {
        return <FormPageSkeleton />;
    }

    if (error || !carrier) {
        return (
            <div className="p-6">
                <ErrorState
                    title="Failed to load carrier"
                    message={error?.message || "Carrier not found"}
                    retry={() => refetch()}
                    backButton={
                        <Button variant="outline" asChild>
                            <Link href="/carriers">Back to Carriers</Link>
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <CarrierForm
            carrierId={id}
            initialData={carrier}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
            extraSections={(isCompany) => (
                <div className="space-y-6">
                    {isCompany && <CarrierDriversManager carrierId={id} />}
                    <CarrierTrucksManager carrierId={id} showDriverAssignment={isCompany} />
                    <CarrierDocumentsManager carrierId={id} />
                </div>
            )}
        />
    );
}
