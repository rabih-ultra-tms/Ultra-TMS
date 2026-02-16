"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Calculator, Plus, Trash2, MapPin } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CarrierSelector } from "./carrier-selector";
import { CarrierWithScore } from "@/lib/hooks/tms/use-loads";

// ---------------------------------------------------------------------------
// Load Form Schema
// ---------------------------------------------------------------------------

export const loadFormSchema = z.object({
    // Order Link
    orderId: z.string().optional(),

    // Equipment & Freight
    equipmentType: z.string().min(1, "Equipment type is required"),
    commodity: z.string().optional(),
    weight: z.coerce.number().min(1, "Weight must be at least 1 lb").max(80000, "Weight cannot exceed 80,000 lbs").optional(),
    pieces: z.coerce.number().min(0).optional(),
    pallets: z.coerce.number().min(0).optional(),
    isHazmat: z.boolean().default(false),
    hazmatClass: z.string().optional(),
    temperatureMin: z.coerce.number().optional(),
    temperatureMax: z.coerce.number().optional(),
    specialHandling: z.array(z.string()).optional(),

    // Stops
    stops: z.array(z.object({
        stopType: z.enum(['PICKUP', 'DELIVERY']),
        stopSequence: z.number(),
        facilityName: z.string().optional(),
        addressLine1: z.string().min(1, "Address is required"),
        addressLine2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(2, "State is required"),
        postalCode: z.string().min(5, "Postal code is required"),
        country: z.string().default("US"),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().email().optional().or(z.literal("")),
        appointmentRequired: z.boolean().default(false),
        appointmentDate: z.string().optional(),
        appointmentTimeStart: z.string().optional(),
        appointmentTimeEnd: z.string().optional(),
        specialInstructions: z.string().optional(),
    })).min(2, "At least one pickup and one delivery stop required"),

    // Carrier
    carrierId: z.string().optional(),
    driverName: z.string().optional(),
    driverPhone: z.string().optional(),
    truckNumber: z.string().optional(),
    trailerNumber: z.string().optional(),

    // Rate
    carrierRate: z.coerce.number().min(0).optional(),
    accessorials: z.array(z.object({
        type: z.string(),
        amount: z.coerce.number(),
    })).optional(),
    fuelSurcharge: z.coerce.number().min(0).optional(),
    carrierPaymentTerms: z.string().optional(),

    // Notes
    dispatchNotes: z.string().optional(),
}).refine((data) => {
    // If carrier is selected, require carrier rate
    if (data.carrierId && !data.carrierRate) {
        return false;
    }
    return true;
}, {
    message: "Carrier rate is required when a carrier is selected",
    path: ["carrierRate"],
}).refine((data) => {
    // If hazmat, require hazmat class
    if (data.isHazmat && !data.hazmatClass) {
        return false;
    }
    return true;
}, {
    message: "Hazmat class is required for hazardous materials",
    path: ["hazmatClass"],
}).refine((data) => {
    // Ensure at least one pickup and one delivery
    const pickups = data.stops.filter(s => s.stopType === 'PICKUP');
    const deliveries = data.stops.filter(s => s.stopType === 'DELIVERY');
    return pickups.length >= 1 && deliveries.length >= 1;
}, {
    message: "Load must have at least one pickup and one delivery stop",
    path: ["stops"],
});

export type LoadFormValues = z.infer<typeof loadFormSchema>;

// ---------------------------------------------------------------------------
// LoadFormSections — Organized form sections
// ---------------------------------------------------------------------------

interface LoadFormSectionsProps {
    form: UseFormReturn<LoadFormValues>;
    customerRate?: number;
    isFromOrder?: boolean;
    mode?: 'create' | 'edit';
    loadStatus?: string;
}

export function LoadFormSections({ form, customerRate, isFromOrder, mode = 'create', loadStatus }: LoadFormSectionsProps) {
    const [showCarrierSelector, setShowCarrierSelector] = React.useState(false);
    const [selectedCarrier, setSelectedCarrier] = React.useState<CarrierWithScore | null>(null);

    const equipmentType = form.watch("equipmentType");
    const stops = form.watch("stops") || [];
    const carrierRate = form.watch("carrierRate") || 0;
    const accessorials = form.watch("accessorials") || [];
    const fuelSurcharge = form.watch("fuelSurcharge") || 0;

    // Calculate totals
    const accessorialTotal = accessorials.reduce((sum, acc) => sum + (acc.amount || 0), 0);
    const totalCarrierCost = carrierRate + accessorialTotal + fuelSurcharge;
    const margin = customerRate ? customerRate - totalCarrierCost : 0;
    const marginPercent = customerRate && customerRate > 0 ? (margin / customerRate) * 100 : 0;

    // Get origin and destination for carrier search
    const originStop = stops.find(s => s.stopType === 'PICKUP');
    const destStop = stops.find(s => s.stopType === 'DELIVERY');

    // Carrier field is read-only after PICKED_UP status
    const carrierReadOnly = mode === 'edit' && loadStatus && [
        'PICKED_UP', 'IN_TRANSIT', 'AT_DELIVERY', 'DELIVERED', 'COMPLETED'
    ].includes(loadStatus);

    const handleCarrierSelect = (carrier: CarrierWithScore) => {
        setSelectedCarrier(carrier);
        form.setValue("carrierId", carrier.id);

        // Pre-fill carrier rate if available
        if (carrier.laneRate) {
            form.setValue("carrierRate", carrier.laneRate);
        }

        // Pre-fill payment terms
        if (carrier.paymentTermsDays) {
            form.setValue("carrierPaymentTerms", `Net ${carrier.paymentTermsDays}`);
        }

        setShowCarrierSelector(false);
    };

    const handleCarrierSkip = () => {
        setShowCarrierSelector(false);
    };

    return (
        <div className="space-y-6">
            {/* Equipment & Freight Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Equipment & Freight</CardTitle>
                    <CardDescription>
                        {isFromOrder ? "Pre-filled from order" : "Specify equipment and freight details"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Equipment Type */}
                        <FormField
                            control={form.control}
                            name="equipmentType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equipment Type *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select equipment" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DRY_VAN">Dry Van</SelectItem>
                                            <SelectItem value="REEFER">Reefer</SelectItem>
                                            <SelectItem value="FLATBED">Flatbed</SelectItem>
                                            <SelectItem value="STEP_DECK">Step Deck</SelectItem>
                                            <SelectItem value="POWER_ONLY">Power Only</SelectItem>
                                            <SelectItem value="HOTSHOT">Hotshot</SelectItem>
                                            <SelectItem value="CONTAINER">Container</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Commodity */}
                        <FormField
                            control={form.control}
                            name="commodity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commodity</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Electronics, Food, Steel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Weight */}
                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weight (lbs)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Pieces */}
                        <FormField
                            control={form.control}
                            name="pieces"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pieces</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Pallets */}
                        <FormField
                            control={form.control}
                            name="pallets"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pallets</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Hazmat Toggle */}
                    <FormField
                        control={form.control}
                        name="isHazmat"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Hazardous Materials</FormLabel>
                                    <FormDescription className="text-xs">
                                        Is this load hazmat?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Hazmat Class (conditional) */}
                    {form.watch("isHazmat") && (
                        <FormField
                            control={form.control}
                            name="hazmatClass"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hazmat Class *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Class 3, UN1203" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Temperature (conditional for Reefer) */}
                    {equipmentType === "REEFER" && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="temperatureMin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Temperature (°F)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="32" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="temperatureMax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Temperature (°F)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="38" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stops Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Stops</CardTitle>
                    <CardDescription>
                        {isFromOrder ? "Stops pre-filled from order" : "Add pickup and delivery stops"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StopsBuilder form={form} />
                </CardContent>
            </Card>

            {/* Carrier Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Carrier Assignment</CardTitle>
                    <CardDescription>
                        {carrierReadOnly
                            ? "Carrier cannot be changed after pickup"
                            : "Select a carrier for this load (optional — can be assigned later)"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {carrierReadOnly && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                            ⚠️ Carrier assignment is locked after pickup. Contact operations manager to reassign.
                        </div>
                    )}

                    {!showCarrierSelector && !selectedCarrier && !carrierReadOnly && (
                        <Button onClick={() => setShowCarrierSelector(true)} variant="outline" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Select Carrier
                        </Button>
                    )}

                    {!showCarrierSelector && selectedCarrier && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div>
                                    <div className="font-medium">{selectedCarrier.companyName}</div>
                                    <div className="text-sm text-muted-foreground">{selectedCarrier.mcNumber}</div>
                                </div>
                                {!carrierReadOnly && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCarrier(null);
                                            form.setValue("carrierId", undefined);
                                            setShowCarrierSelector(true);
                                        }}
                                    >
                                        Change
                                    </Button>
                                )}
                            </div>

                            {/* Driver Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="driverName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driverPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(555) 123-4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="truckNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Truck Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="T-1234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="trailerNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trailer Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="TR-5678" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {showCarrierSelector && (
                        <CarrierSelector
                            equipmentType={equipmentType}
                            originState={originStop?.state}
                            destState={destStop?.state}
                            onSelectCarrier={handleCarrierSelect}
                            onSkip={handleCarrierSkip}
                            selectedCarrierId={form.watch("carrierId")}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Rate Section (conditional on carrier) */}
            {selectedCarrier && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rate & Margin</CardTitle>
                        <CardDescription>Enter carrier rate and accessorial charges</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Customer Rate Display */}
                        {customerRate && (
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Customer Rate</div>
                                <div className="text-2xl font-bold">${customerRate.toLocaleString()}</div>
                            </div>
                        )}

                        {/* Carrier Rate */}
                        <FormField
                            control={form.control}
                            name="carrierRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Carrier Rate *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                $
                                            </span>
                                            <Input type="number" step="0.01" placeholder="0.00" className="pl-6" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Accessorials */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FormLabel>Accessorial Charges</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const current = form.getValues("accessorials") || [];
                                        form.setValue("accessorials", [...current, { type: "", amount: 0 }]);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                            {accessorials.map((_, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="Type (e.g., Detention)"
                                        value={accessorials[index]?.type || ""}
                                        onChange={(e) => {
                                            const current = form.getValues("accessorials") || [];
                                            current[index] = { type: e.target.value, amount: current[index]?.amount || 0 };
                                            form.setValue("accessorials", current);
                                        }}
                                        className="flex-1"
                                    />
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            $
                                        </span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-6"
                                            value={accessorials[index]?.amount || ""}
                                            onChange={(e) => {
                                                const current = form.getValues("accessorials") || [];
                                                current[index] = { type: current[index]?.type || "", amount: parseFloat(e.target.value) || 0 };
                                                form.setValue("accessorials", current);
                                            }}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const current = form.getValues("accessorials") || [];
                                            current.splice(index, 1);
                                            form.setValue("accessorials", current);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Fuel Surcharge */}
                        <FormField
                            control={form.control}
                            name="fuelSurcharge"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fuel Surcharge</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                $
                                            </span>
                                            <Input type="number" step="0.01" placeholder="0.00" className="pl-6" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Margin Calculator */}
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                                <Calculator className="h-4 w-4" />
                                Margin Calculator
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Total Carrier Cost</div>
                                    <div className="font-semibold text-lg">${totalCarrierCost.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Margin</div>
                                    <div
                                        className={cn(
                                            "font-semibold text-lg",
                                            marginPercent >= 15 && "text-green-600",
                                            marginPercent >= 10 && marginPercent < 15 && "text-amber-600",
                                            marginPercent < 10 && "text-red-600"
                                        )}
                                    >
                                        ${margin.toLocaleString()} ({marginPercent.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                            {marginPercent < 10 && customerRate && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                    ⚠️ Warning: Margin is below the 10% company minimum
                                </div>
                            )}
                        </div>

                        {/* Payment Terms */}
                        <FormField
                            control={form.control}
                            name="carrierPaymentTerms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Terms</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment terms" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Quick Pay">Quick Pay</SelectItem>
                                            <SelectItem value="Net 15">Net 15</SelectItem>
                                            <SelectItem value="Net 30">Net 30</SelectItem>
                                            <SelectItem value="Net 45">Net 45</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Dispatch Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Dispatch Notes</CardTitle>
                    <CardDescription>Internal notes for operations team</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="dispatchNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="Add any special instructions or notes..."
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

// ---------------------------------------------------------------------------
// StopsBuilder — Manage pickup and delivery stops
// ---------------------------------------------------------------------------

interface StopsBuilderProps {
    form: UseFormReturn<LoadFormValues>;
}

function StopsBuilder({ form }: StopsBuilderProps) {
    const stops = form.watch("stops") || [];

    const addStop = (type: 'PICKUP' | 'DELIVERY') => {
        const newStop = {
            stopType: type,
            stopSequence: stops.length + 1,
            addressLine1: "",
            city: "",
            state: "",
            postalCode: "",
            country: "US",
            appointmentRequired: false,
        };
        form.setValue("stops", [...stops, newStop]);
    };

    const removeStop = (index: number) => {
        const updated = stops.filter((_, i) => i !== index);
        // Re-sequence
        updated.forEach((stop, i) => {
            stop.stopSequence = i + 1;
        });
        form.setValue("stops", updated);
    };

    return (
        <div className="space-y-4">
            {stops.map((stop, index) => (
                <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <CardTitle className="text-base">
                                    {stop.stopType === 'PICKUP' ? '📦 Pickup' : '🎯 Delivery'} Stop #{stop.stopSequence}
                                </CardTitle>
                            </div>
                            {stops.length > 2 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStop(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input
                            placeholder="Facility Name"
                            value={stop.facilityName || ""}
                            onChange={(e) => {
                                const updated = [...stops];
                                if (updated[index]) {
                                    updated[index].facilityName = e.target.value;
                                    form.setValue("stops", updated);
                                }
                            }}
                        />
                        <Input
                            placeholder="Address *"
                            value={stop.addressLine1}
                            onChange={(e) => {
                                const updated = [...stops];
                                if (updated[index]) {
                                    updated[index].addressLine1 = e.target.value;
                                    form.setValue("stops", updated);
                                }
                            }}
                        />
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                placeholder="City *"
                                value={stop.city}
                                onChange={(e) => {
                                    const updated = [...stops];
                                    if (updated[index]) {
                                        updated[index].city = e.target.value;
                                        form.setValue("stops", updated);
                                    }
                                }}
                            />
                            <Input
                                placeholder="State *"
                                value={stop.state}
                                onChange={(e) => {
                                    const updated = [...stops];
                                    if (updated[index]) {
                                        updated[index].state = e.target.value;
                                        form.setValue("stops", updated);
                                    }
                                }}
                                maxLength={2}
                            />
                            <Input
                                placeholder="ZIP *"
                                value={stop.postalCode}
                                onChange={(e) => {
                                    const updated = [...stops];
                                    if (updated[index]) {
                                        updated[index].postalCode = e.target.value;
                                        form.setValue("stops", updated);
                                    }
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                placeholder="Contact Name"
                                value={stop.contactName || ""}
                                onChange={(e) => {
                                    const updated = [...stops];
                                    if (updated[index]) {
                                        updated[index].contactName = e.target.value;
                                        form.setValue("stops", updated);
                                    }
                                }}
                            />
                            <Input
                                placeholder="Contact Phone"
                                value={stop.contactPhone || ""}
                                onChange={(e) => {
                                    const updated = [...stops];
                                    if (updated[index]) {
                                        updated[index].contactPhone = e.target.value;
                                        form.setValue("stops", updated);
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => addStop('PICKUP')} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pickup Stop
                </Button>
                <Button type="button" variant="outline" onClick={() => addStop('DELIVERY')} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Delivery Stop
                </Button>
            </div>
        </div>
    );
}
