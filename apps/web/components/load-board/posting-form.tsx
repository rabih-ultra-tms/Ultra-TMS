"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { useCreatePosting } from "@/lib/hooks/load-board";

const EQUIPMENT_TYPES = [
    "Dry Van",
    "Flatbed",
    "Reefer",
    "Step Deck",
    "Lowboy",
    "Tanker",
    "Power Only",
    "Conestoga",
    "Hotshot",
] as const;

const postingSchema = z.object({
    loadId: z.string().min(1, "Load ID is required"),
    postingType: z.enum(["INTERNAL", "EXTERNAL", "BOTH"]),
    originCity: z.string().min(1, "Origin city is required"),
    originState: z
        .string()
        .min(2, "State required")
        .max(2, "Use 2-letter code"),
    destCity: z.string().min(1, "Destination city is required"),
    destState: z
        .string()
        .min(2, "State required")
        .max(2, "Use 2-letter code"),
    equipmentType: z.string().min(1, "Equipment type is required"),
    weight: z.coerce.number().positive().optional(),
    commodity: z.string().optional(),
    pickupDate: z.string().min(1, "Pickup date is required"),
    deliveryDate: z.string().optional(),
    rateType: z.enum(["ALL_IN", "PER_MILE"]),
    postedRate: z.coerce.number().positive("Rate must be positive").optional(),
    rateMax: z.coerce.number().positive().optional(),
    specialInstructions: z.string().optional(),
    visibility: z.enum(["ALL_CARRIERS", "PREFERRED_ONLY", "SPECIFIC_CARRIERS"]),
});

type PostingFormValues = z.infer<typeof postingSchema>;

export function PostingForm() {
    const router = useRouter();
    const createPosting = useCreatePosting();

    const form = useForm({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(postingSchema) as any,
        defaultValues: {
            loadId: "",
            postingType: "BOTH" as "INTERNAL" | "EXTERNAL" | "BOTH",
            originCity: "",
            originState: "",
            destCity: "",
            destState: "",
            equipmentType: "",
            weight: undefined as number | undefined,
            commodity: "",
            pickupDate: "",
            deliveryDate: "",
            rateType: "ALL_IN" as "ALL_IN" | "PER_MILE",
            postedRate: undefined as number | undefined,
            rateMax: undefined as number | undefined,
            specialInstructions: "",
            visibility: "ALL_CARRIERS" as "ALL_CARRIERS" | "PREFERRED_ONLY" | "SPECIFIC_CARRIERS",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    async function onSubmit(values: Record<string, unknown>) {
        const v = values as PostingFormValues;
        const result = await createPosting.mutateAsync({
            loadId: v.loadId,
            postingType: v.postingType,
            visibility: v.visibility,
            rateType: v.rateType,
            postedRate: v.postedRate,
            rateMax: v.rateMax,
            showRate: v.postedRate != null,
        });
        router.push(`/load-board/postings/${result.id}`);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Origin / Destination */}
            <Card>
                <CardHeader>
                    <CardTitle>Route</CardTitle>
                    <CardDescription>
                        Origin and destination for this posting
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="originCity">Origin City</Label>
                        <Input
                            id="originCity"
                            placeholder="Chicago"
                            {...register("originCity")}
                        />
                        {errors.originCity && (
                            <p className="text-sm text-destructive">
                                {errors.originCity.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="originState">Origin State</Label>
                        <Input
                            id="originState"
                            placeholder="IL"
                            maxLength={2}
                            className="uppercase"
                            {...register("originState")}
                        />
                        {errors.originState && (
                            <p className="text-sm text-destructive">
                                {errors.originState.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destCity">Destination City</Label>
                        <Input
                            id="destCity"
                            placeholder="New York"
                            {...register("destCity")}
                        />
                        {errors.destCity && (
                            <p className="text-sm text-destructive">
                                {errors.destCity.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destState">Destination State</Label>
                        <Input
                            id="destState"
                            placeholder="NY"
                            maxLength={2}
                            className="uppercase"
                            {...register("destState")}
                        />
                        {errors.destState && (
                            <p className="text-sm text-destructive">
                                {errors.destState.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Load Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Load Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="loadId">Load ID</Label>
                        <Input
                            id="loadId"
                            placeholder="Load reference..."
                            {...register("loadId")}
                        />
                        {errors.loadId && (
                            <p className="text-sm text-destructive">
                                {errors.loadId.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="equipmentType">Equipment Type</Label>
                        <Select
                            value={watch("equipmentType")}
                            onValueChange={(v) =>
                                setValue("equipmentType", v, {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <SelectTrigger id="equipmentType">
                                <SelectValue placeholder="Select equipment" />
                            </SelectTrigger>
                            <SelectContent>
                                {EQUIPMENT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.equipmentType && (
                            <p className="text-sm text-destructive">
                                {errors.equipmentType.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                            id="weight"
                            type="number"
                            placeholder="40000"
                            {...register("weight")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="commodity">Commodity</Label>
                        <Input
                            id="commodity"
                            placeholder="General freight"
                            {...register("commodity")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="pickupDate">Pickup Date</Label>
                        <Input
                            id="pickupDate"
                            type="date"
                            {...register("pickupDate")}
                        />
                        {errors.pickupDate && (
                            <p className="text-sm text-destructive">
                                {errors.pickupDate.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deliveryDate">Delivery Date</Label>
                        <Input
                            id="deliveryDate"
                            type="date"
                            {...register("deliveryDate")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Rate */}
            <Card>
                <CardHeader>
                    <CardTitle>Rate Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="rateType">Rate Type</Label>
                        <Select
                            value={watch("rateType")}
                            onValueChange={(v) =>
                                setValue(
                                    "rateType",
                                    v as "ALL_IN" | "PER_MILE",
                                    { shouldValidate: true }
                                )
                            }
                        >
                            <SelectTrigger id="rateType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL_IN">All-In</SelectItem>
                                <SelectItem value="PER_MILE">
                                    Per Mile
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postedRate">Target Rate ($)</Label>
                        <Input
                            id="postedRate"
                            type="number"
                            step="0.01"
                            placeholder="2500"
                            {...register("postedRate")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rateMax">Max Rate ($)</Label>
                        <Input
                            id="rateMax"
                            type="number"
                            step="0.01"
                            placeholder="3000"
                            {...register("rateMax")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Posting Options */}
            <Card>
                <CardHeader>
                    <CardTitle>Posting Options</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="postingType">Posting Type</Label>
                        <Select
                            value={watch("postingType")}
                            onValueChange={(v) =>
                                setValue(
                                    "postingType",
                                    v as "INTERNAL" | "EXTERNAL" | "BOTH",
                                    { shouldValidate: true }
                                )
                            }
                        >
                            <SelectTrigger id="postingType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INTERNAL">
                                    Internal Only
                                </SelectItem>
                                <SelectItem value="EXTERNAL">
                                    External Only
                                </SelectItem>
                                <SelectItem value="BOTH">
                                    Internal + External
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="visibility">Visibility</Label>
                        <Select
                            value={watch("visibility")}
                            onValueChange={(v) =>
                                setValue(
                                    "visibility",
                                    v as
                                        | "ALL_CARRIERS"
                                        | "PREFERRED_ONLY"
                                        | "SPECIFIC_CARRIERS",
                                    { shouldValidate: true }
                                )
                            }
                        >
                            <SelectTrigger id="visibility">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL_CARRIERS">
                                    All Carriers
                                </SelectItem>
                                <SelectItem value="PREFERRED_ONLY">
                                    Preferred Only
                                </SelectItem>
                                <SelectItem value="SPECIFIC_CARRIERS">
                                    Specific Carriers
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="specialInstructions">
                            Special Instructions
                        </Label>
                        <Textarea
                            id="specialInstructions"
                            placeholder="Any special handling or requirements..."
                            {...register("specialInstructions")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || createPosting.isPending}
                >
                    {createPosting.isPending
                        ? "Creating..."
                        : "Create Posting"}
                </Button>
            </div>
        </form>
    );
}
