# Load Edit Page Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the Load Edit page so form data populates from the API, carrier/driver/rate sections display in edit mode, and missing fields (order link, status badge, appointment scheduling) are added.

**Architecture:** Fix-in-place approach — modify 3 existing files. `FormPage` gets a `useEffect` to reset form on async data arrival. `LoadFormSections` gets new props (`initialCarrier`, `orderInfo`) so existing carrier/order data renders in edit mode. `StopsBuilder` gets appointment and special instructions fields.

**Tech Stack:** React 19, React Hook Form, Zod, shadcn/ui, Next.js App Router, TanStack Query

---

## Task 1: Fix FormPage — form.reset on async defaultValues

**Files:**
- Modify: `apps/web/components/patterns/form-page.tsx:83-90`

**Step 1: Add useEffect for form reset after useForm initialization**

After line 90 (`});` closing `useForm`), before line 92 (`const { isDirty ...`), add:

```typescript
    // Reset form when defaultValues change (async data arrival)
    const serializedDefaults = JSON.stringify(defaultValues);
    React.useEffect(() => {
        form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serializedDefaults]);
```

This handles the core P0 bug: `useForm` ignores `defaultValues` changes after first render. The `JSON.stringify` gives a stable dependency for deep comparison. The `form.reset()` call re-initializes all fields with the new values.

**Step 2: Verify the edit page loads with populated fields**

Navigate to `http://localhost:3000/operations/loads/<any-load-id>/edit` and confirm Equipment Type, Weight, Commodity, and Stop fields now populate from the load data.

**Step 3: Commit**

```bash
git add apps/web/components/patterns/form-page.tsx
git commit -m "fix: reset form on async defaultValues change in FormPage"
```

---

## Task 2: Add initialCarrier + orderInfo props to LoadFormSections

**Files:**
- Modify: `apps/web/components/tms/loads/load-form.tsx:1-17` (imports)
- Modify: `apps/web/components/tms/loads/load-form.tsx:112-122` (interface + component init)

**Step 1: Add imports for LoadStatusBadge and Link**

At the top of load-form.tsx, add to imports:

```typescript
import Link from "next/link";
import { Calculator, Plus, Trash2, MapPin, FileText, Clock as ClockIcon } from "lucide-react";
import { LoadStatusBadge } from "./load-status-badge";
import { LoadStatus } from "@/types/loads";
```

**Step 2: Extend the interface**

Replace the `LoadFormSectionsProps` interface (lines 112-118) with:

```typescript
interface LoadFormSectionsProps {
    form: UseFormReturn<LoadFormValues>;
    customerRate?: number;
    isFromOrder?: boolean;
    mode?: 'create' | 'edit';
    loadStatus?: string;
    /** Existing carrier data for edit mode — initializes the carrier display */
    initialCarrier?: {
        id: string;
        companyName: string;
        mcNumber: string;
    };
    /** Order info for edit mode — shown as read-only header */
    orderInfo?: {
        id: string;
        orderNumber: string;
        customerName: string;
    };
}
```

**Step 3: Update component signature and initialize selectedCarrier from existing data**

Replace the component function signature and early state (lines 120-122) with:

```typescript
export function LoadFormSections({
    form,
    customerRate,
    isFromOrder,
    mode = 'create',
    loadStatus,
    initialCarrier,
    orderInfo,
}: LoadFormSectionsProps) {
    const [showCarrierSelector, setShowCarrierSelector] = React.useState(false);
    // In edit mode, initialize from existing carrier data
    const [selectedCarrier, setSelectedCarrier] = React.useState<CarrierWithScore | null>(
        initialCarrier
            ? { id: initialCarrier.id, companyName: initialCarrier.companyName, mcNumber: initialCarrier.mcNumber } as CarrierWithScore
            : null
    );
```

**Step 4: Also sync selectedCarrier when initialCarrier changes (async load)**

After the `selectedCarrier` state declaration, add:

```typescript
    // Sync selectedCarrier when initialCarrier arrives (async data)
    React.useEffect(() => {
        if (initialCarrier && !selectedCarrier) {
            setSelectedCarrier({
                id: initialCarrier.id,
                companyName: initialCarrier.companyName,
                mcNumber: initialCarrier.mcNumber,
            } as CarrierWithScore);
        }
    }, [initialCarrier, selectedCarrier]);
```

---

## Task 3: Add Order Link + Status Badge section (edit mode)

**Files:**
- Modify: `apps/web/components/tms/loads/load-form.tsx:166-168` (inside return, before Equipment & Freight card)

**Step 1: Add the order info bar**

Replace the opening `<div className="space-y-6">` and add the order info section right after it:

```tsx
        <div className="space-y-6">
            {/* Order & Status Info (edit mode) */}
            {mode === 'edit' && orderInfo && (
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Order:</span>
                                    <Link
                                        href={`/operations/orders/${orderInfo.id}`}
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        {orderInfo.orderNumber}
                                    </Link>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-sm text-muted-foreground">
                                    Customer: <span className="font-medium text-foreground">{orderInfo.customerName}</span>
                                </span>
                            </div>
                            {loadStatus && (
                                <LoadStatusBadge status={loadStatus as LoadStatus} />
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
```

This shows a compact info bar with linked order number, customer name, and status badge.

---

## Task 4: Fix Carrier section — show existing carrier in edit mode

**Files:**
- Modify: `apps/web/components/tms/loads/load-form.tsx:364-472` (Carrier Assignment card content)

**Step 1: Replace the Carrier Assignment card content**

Replace the `<CardContent>` block inside the Carrier Assignment card (lines 364-471) with logic that handles both read-only (locked) and editable carrier display:

```tsx
                <CardContent>
                    {/* Read-only carrier display for locked status */}
                    {carrierReadOnly && selectedCarrier && (
                        <div className="space-y-3">
                            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                Carrier assignment is locked after pickup. Contact operations manager to reassign.
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div>
                                    <div className="font-medium">{selectedCarrier.companyName}</div>
                                    <div className="text-sm text-muted-foreground font-mono">{selectedCarrier.mcNumber}</div>
                                </div>
                            </div>
                            {/* Driver Info (read-only display) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="driverName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driver Name</FormLabel>
                                        <FormControl><Input placeholder="John Doe" {...field} readOnly className="bg-muted/50" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="driverPhone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driver Phone</FormLabel>
                                        <FormControl><Input placeholder="(555) 123-4567" {...field} readOnly className="bg-muted/50" /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="truckNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Truck Number</FormLabel>
                                        <FormControl><Input placeholder="T-1234" {...field} readOnly className="bg-muted/50" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="trailerNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trailer Number</FormLabel>
                                        <FormControl><Input placeholder="TR-5678" {...field} readOnly className="bg-muted/50" /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    )}

                    {/* Read-only locked but no carrier */}
                    {carrierReadOnly && !selectedCarrier && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                            Carrier assignment is locked after pickup. Contact operations manager to reassign.
                        </div>
                    )}

                    {/* Editable: no carrier selected yet */}
                    {!showCarrierSelector && !selectedCarrier && !carrierReadOnly && (
                        <Button onClick={() => setShowCarrierSelector(true)} variant="outline" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Select Carrier
                        </Button>
                    )}

                    {/* Editable: carrier selected — show info + driver fields */}
                    {!showCarrierSelector && selectedCarrier && !carrierReadOnly && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div>
                                    <div className="font-medium">{selectedCarrier.companyName}</div>
                                    <div className="text-sm text-muted-foreground font-mono">{selectedCarrier.mcNumber}</div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedCarrier(null);
                                    form.setValue("carrierId", undefined);
                                    setShowCarrierSelector(true);
                                }}>
                                    Change
                                </Button>
                            </div>
                            {/* Driver Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="driverName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driver Name</FormLabel>
                                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="driverPhone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driver Phone</FormLabel>
                                        <FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="truckNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Truck Number</FormLabel>
                                        <FormControl><Input placeholder="T-1234" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="trailerNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trailer Number</FormLabel>
                                        <FormControl><Input placeholder="TR-5678" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    )}

                    {/* Carrier picker */}
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
```

---

## Task 5: Fix Rate section — show when carrier exists (not just selectedCarrier)

**Files:**
- Modify: `apps/web/components/tms/loads/load-form.tsx:474-475`

**Step 1: Change the Rate section gate**

The Rate section gate currently checks `selectedCarrier` (picker state). Since we now initialize `selectedCarrier` from `initialCarrier`, this already works. But also show it when there's a `carrierId` in the form (belt + suspenders):

Replace line 475:
```tsx
            {selectedCarrier && (
```
With:
```tsx
            {(selectedCarrier || form.watch("carrierId")) && (
```

This ensures the Rate & Margin section shows whenever a carrier is associated with the load.

---

## Task 6: Add appointment + special instructions fields to StopsBuilder

**Files:**
- Modify: `apps/web/components/tms/loads/load-form.tsx:741-823` (StopsBuilder CardContent)

**Step 1: Add fields after the Contact Name/Phone row**

After the contact name/phone grid (line 823, before `</CardContent>`), add:

```tsx
                        {/* Address Line 2 */}
                        <Input
                            placeholder="Address Line 2 (suite, unit, etc.)"
                            value={stop.addressLine2 || ""}
                            onChange={(e) => {
                                const updated = [...stops];
                                if (updated[index]) {
                                    updated[index].addressLine2 = e.target.value;
                                    form.setValue("stops", updated);
                                }
                            }}
                        />

                        {/* Appointment */}
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <div className="text-sm font-medium">Appointment Required</div>
                                <div className="text-xs text-muted-foreground">Does this stop require a scheduled appointment?</div>
                            </div>
                            <Switch
                                checked={stop.appointmentRequired || false}
                                onCheckedChange={(checked) => {
                                    const updated = [...stops];
                                    if (updated[index]) {
                                        updated[index].appointmentRequired = checked;
                                        form.setValue("stops", updated);
                                    }
                                }}
                            />
                        </div>

                        {stop.appointmentRequired && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                    type="date"
                                    placeholder="Appointment Date"
                                    value={stop.appointmentDate || ""}
                                    onChange={(e) => {
                                        const updated = [...stops];
                                        if (updated[index]) {
                                            updated[index].appointmentDate = e.target.value;
                                            form.setValue("stops", updated);
                                        }
                                    }}
                                />
                                <Input
                                    type="time"
                                    placeholder="Start Time"
                                    value={stop.appointmentTimeStart || ""}
                                    onChange={(e) => {
                                        const updated = [...stops];
                                        if (updated[index]) {
                                            updated[index].appointmentTimeStart = e.target.value;
                                            form.setValue("stops", updated);
                                        }
                                    }}
                                />
                                <Input
                                    type="time"
                                    placeholder="End Time"
                                    value={stop.appointmentTimeEnd || ""}
                                    onChange={(e) => {
                                        const updated = [...stops];
                                        if (updated[index]) {
                                            updated[index].appointmentTimeEnd = e.target.value;
                                            form.setValue("stops", updated);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Special Instructions */}
                        <Textarea
                            placeholder="Special instructions (e.g., call 30 min before arrival)"
                            value={stop.specialInstructions || ""}
                            onChange={(e) => {
                                const updated = [...stops];
                                if (updated[index]) {
                                    updated[index].specialInstructions = e.target.value;
                                    form.setValue("stops", updated);
                                }
                            }}
                            className="min-h-[60px]"
                        />
```

The `Switch` import already exists (line 13). `Textarea` import already exists (line 10).

---

## Task 7: Update Edit Page — pass initialCarrier, customerRate, orderInfo

**Files:**
- Modify: `apps/web/app/(dashboard)/operations/loads/[id]/edit/page.tsx`

**Step 1: Replace the full edit page**

```tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FormPage } from "@/components/patterns/form-page";
import { LoadFormSections, loadFormSchema, LoadFormValues } from "@/components/tms/loads/load-form";
import { useLoad, useUpdateLoad } from "@/lib/hooks/tms/use-loads";
import { LoadStatusBadge } from "@/components/tms/loads/load-status-badge";
import { LoadStatus } from "@/types/loads";

export default function EditLoadPage() {
    const params = useParams();
    const router = useRouter();
    const loadId = params.id as string;

    const { data: loadData, isLoading, error } = useLoad(loadId);
    const updateLoad = useUpdateLoad(loadId);

    // Prepare default values from load data
    const defaultValues = React.useMemo((): LoadFormValues => {
        if (!loadData || !loadData.stops) {
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
```

---

## Task 8: Type-check and verify in browser

**Step 1: Run type check**

```bash
pnpm check-types
```

Expected: No new errors in the 3 modified files.

**Step 2: Visual verification in browser**

Navigate to `http://localhost:3000/operations/loads/<id>/edit` and verify:
- [ ] Equipment type, commodity, weight fields populate from load data
- [ ] Stop addresses, facility names, contact info populate
- [ ] Order info bar shows at top with order number (clickable), customer name, status badge
- [ ] Carrier section shows carrier name + MC# (read-only if post-pickup, editable if pre-pickup)
- [ ] Driver name, phone, truck/trailer number fields visible and populated
- [ ] Rate & Margin section visible with carrier rate populated
- [ ] Stop cards show appointment toggle, date/time fields (when toggled), special instructions
- [ ] Cancel navigates back to load detail
- [ ] Save Changes button enables when form is dirty

**Step 3: Commit**

```bash
git add apps/web/components/patterns/form-page.tsx apps/web/components/tms/loads/load-form.tsx apps/web/app/\(dashboard\)/operations/loads/\[id\]/edit/page.tsx
git commit -m "fix: populate form data, show carrier/rate/order sections on Load Edit page"
```
