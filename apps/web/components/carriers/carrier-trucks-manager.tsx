"use client";

import { useState } from "react";
import {
    useCarrierTrucks,
    useCarrierDrivers,
    useCreateTruck,
    useUpdateTruckById,
    useDeleteTruckById,
    useTruckTypes,
} from "@/lib/hooks/operations";
import { OperationsCarrierTruck, OperationsCarrierDriver } from "@/types/carriers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Pencil, Trash2, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";

const TRUCK_STATUSES = ["ACTIVE", "INACTIVE", "OUT_OF_SERVICE", "SOLD"] as const;
const TRUCK_STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    OUT_OF_SERVICE: "Out of Service",
    SOLD: "Sold",
};
const TRUCK_STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    INACTIVE: "secondary",
    OUT_OF_SERVICE: "destructive",
    SOLD: "outline",
};

interface TruckFormData {
    unitNumber: string;
    year: string;
    make: string;
    model: string;
    vin: string;
    licensePlate: string;
    licensePlateState: string;
    truckTypeId: string;
    category: string;
    status: string;
    assignedDriverId: string;
    registrationExpiry: string;
    annualInspectionDate: string;
    notes: string;
}

const EMPTY_FORM: TruckFormData = {
    unitNumber: "",
    year: "",
    make: "",
    model: "",
    vin: "",
    licensePlate: "",
    licensePlateState: "",
    truckTypeId: "",
    category: "",
    status: "ACTIVE",
    assignedDriverId: "",
    registrationExpiry: "",
    annualInspectionDate: "",
    notes: "",
};

function truckToForm(truck: OperationsCarrierTruck): TruckFormData {
    return {
        unitNumber: truck.unitNumber ?? "",
        year: truck.year ? String(truck.year) : "",
        make: truck.make ?? "",
        model: truck.model ?? "",
        vin: truck.vin ?? "",
        licensePlate: truck.licensePlate ?? "",
        licensePlateState: truck.licensePlateState ?? "",
        truckTypeId: truck.truckTypeId ?? "",
        category: truck.category ?? "",
        status: truck.status ?? "ACTIVE",
        assignedDriverId: truck.assignedDriverId ?? "",
        registrationExpiry: truck.registrationExpiry ? String(truck.registrationExpiry).slice(0, 10) : "",
        annualInspectionDate: truck.annualInspectionDate ? String(truck.annualInspectionDate).slice(0, 10) : "",
        notes: truck.notes ?? "",
    };
}

interface CarrierTrucksManagerProps {
    carrierId: string;
    /** When true, shows the driver assignment dropdown (COMPANY carriers with multiple drivers) */
    showDriverAssignment?: boolean;
}

export function CarrierTrucksManager({ carrierId, showDriverAssignment = true }: CarrierTrucksManagerProps) {
    const { data: rawTrucks, isLoading } = useCarrierTrucks(carrierId);
    const trucks: OperationsCarrierTruck[] = Array.isArray(rawTrucks) ? rawTrucks : [];

    const { data: rawDrivers } = useCarrierDrivers(carrierId);
    const drivers: OperationsCarrierDriver[] = Array.isArray(rawDrivers) ? rawDrivers : [];

    const { data: truckTypesResponse } = useTruckTypes({ limit: 200 });
    const truckTypes = truckTypesResponse?.data ?? [];

    const createTruck = useCreateTruck(carrierId);
    const updateTruckById = useUpdateTruckById(carrierId);
    const deleteTruckById = useDeleteTruckById(carrierId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTruckId, setEditingTruckId] = useState<string | null>(null);
    const [deletingTruckId, setDeletingTruckId] = useState<string | null>(null);
    const [form, setForm] = useState<TruckFormData>(EMPTY_FORM);

    const isSaving = createTruck.isPending || updateTruckById.isPending;

    const set = (field: keyof TruckFormData) => (value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleTruckTypeChange = (truckTypeId: string) => {
        const selected = truckTypes.find((t) => t.id === truckTypeId);
        setForm((prev) => ({
            ...prev,
            truckTypeId,
            // Auto-populate category from the selected truck type
            category: selected?.category ?? prev.category,
        }));
    };

    const openAdd = () => {
        setEditingTruckId(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (truck: OperationsCarrierTruck) => {
        setEditingTruckId(truck.id);
        setForm(truckToForm(truck));
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.unitNumber.trim()) {
            toast.error("Unit number is required");
            return;
        }

        const payload: Partial<OperationsCarrierTruck> = {
            unitNumber: form.unitNumber.trim(),
            year: form.year ? Number(form.year) : undefined,
            make: form.make || undefined,
            model: form.model || undefined,
            vin: form.vin || undefined,
            licensePlate: form.licensePlate || undefined,
            licensePlateState: form.licensePlateState || undefined,
            truckTypeId: form.truckTypeId || undefined,
            category: form.category || "VAN",
            status: form.status as OperationsCarrierTruck["status"],
            assignedDriverId: form.assignedDriverId || undefined,
            registrationExpiry: form.registrationExpiry || undefined,
            annualInspectionDate: form.annualInspectionDate || undefined,
            notes: form.notes || undefined,
        };

        try {
            if (editingTruckId) {
                await updateTruckById.mutateAsync({ truckId: editingTruckId, data: payload });
            } else {
                await createTruck.mutateAsync(payload);
                toast.success("Truck added");
            }
            setDialogOpen(false);
        } catch {
            // Errors handled by mutation onError
        }
    };

    const handleDelete = async () => {
        if (!deletingTruckId) return;
        await deleteTruckById.mutateAsync(deletingTruckId);
        setDeletingTruckId(null);
    };

    const driverName = (driverId?: string | null) => {
        if (!driverId) return null;
        const d = drivers.find((dr) => dr.id === driverId);
        return d ? `${d.firstName} ${d.lastName}` : null;
    };

    const truckTypeName = (truck: OperationsCarrierTruck) => {
        if (truck.truckTypeId) {
            const t = truckTypes.find((tt) => tt.id === truck.truckTypeId);
            if (t) return t.name;
        }
        return truck.category || "—";
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Trucks
                            {trucks.length > 0 && (
                                <Badge variant="secondary">{trucks.length}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Manage trucks and trailers for this carrier.</CardDescription>
                    </div>
                    <Button size="sm" onClick={openAdd}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Truck
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading trucks...
                        </div>
                    ) : trucks.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No trucks added yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-4 font-medium">Unit #</th>
                                        <th className="pb-2 pr-4 font-medium">Year / Make / Model</th>
                                        <th className="pb-2 pr-4 font-medium">Truck Type</th>
                                        {showDriverAssignment && (
                                            <th className="pb-2 pr-4 font-medium">Driver</th>
                                        )}
                                        <th className="pb-2 pr-4 font-medium">Status</th>
                                        <th className="pb-2 font-medium" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {trucks.map((truck) => (
                                        <tr key={truck.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-mono font-medium">{truck.unitNumber}</td>
                                            <td className="py-2 pr-4 text-muted-foreground">
                                                {[truck.year, truck.make, truck.model].filter(Boolean).join(" ") || "—"}
                                            </td>
                                            <td className="py-2 pr-4">
                                                <Badge variant="outline">{truckTypeName(truck)}</Badge>
                                            </td>
                                            {showDriverAssignment && (
                                                <td className="py-2 pr-4 text-muted-foreground">
                                                    {driverName(truck.assignedDriverId) ?? "—"}
                                                </td>
                                            )}
                                            <td className="py-2 pr-4">
                                                <Badge variant={TRUCK_STATUS_COLORS[truck.status] ?? "secondary"}>
                                                    {TRUCK_STATUS_LABELS[truck.status] ?? truck.status}
                                                </Badge>
                                            </td>
                                            <td className="py-2">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => openEdit(truck)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => setDeletingTruckId(truck.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add / Edit Truck Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTruckId ? "Edit Truck" : "Add Truck"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        {/* Unit Number */}
                        <div className="space-y-1">
                            <Label htmlFor="truck-unit">Unit Number *</Label>
                            <Input
                                id="truck-unit"
                                value={form.unitNumber}
                                onChange={(e) => set("unitNumber")(e.target.value)}
                                placeholder="e.g. T-101"
                            />
                        </div>

                        {/* Truck Type */}
                        <div className="space-y-1">
                            <Label>Truck Type</Label>
                            <Select
                                value={form.truckTypeId || "none"}
                                onValueChange={(v) => handleTruckTypeChange(v === "none" ? "" : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select truck type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Not specified —</SelectItem>
                                    {truckTypes.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                            {t.category && (
                                                <span className="ml-1 text-muted-foreground text-xs">
                                                    ({t.category})
                                                </span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Links to your truck type catalog and auto-fills the category.
                            </p>
                        </div>

                        {/* Year / Make / Model */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="truck-year">Year</Label>
                                <Input
                                    id="truck-year"
                                    type="number"
                                    value={form.year}
                                    onChange={(e) => set("year")(e.target.value)}
                                    placeholder="2022"
                                    min={1980}
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="truck-make">Make</Label>
                                <Input
                                    id="truck-make"
                                    value={form.make}
                                    onChange={(e) => set("make")(e.target.value)}
                                    placeholder="Kenworth"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="truck-model">Model</Label>
                                <Input
                                    id="truck-model"
                                    value={form.model}
                                    onChange={(e) => set("model")(e.target.value)}
                                    placeholder="T680"
                                />
                            </div>
                        </div>

                        {/* VIN */}
                        <div className="space-y-1">
                            <Label htmlFor="truck-vin">VIN</Label>
                            <Input
                                id="truck-vin"
                                value={form.vin}
                                onChange={(e) => set("vin")(e.target.value.toUpperCase())}
                                placeholder="1XKYD49X5NJ123456"
                                maxLength={17}
                                className="font-mono"
                            />
                        </div>

                        {/* License Plate */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1">
                                <Label htmlFor="truck-plate">License Plate</Label>
                                <Input
                                    id="truck-plate"
                                    value={form.licensePlate}
                                    onChange={(e) => set("licensePlate")(e.target.value.toUpperCase())}
                                    placeholder="ABC1234"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="truck-plate-state">State</Label>
                                <Input
                                    id="truck-plate-state"
                                    value={form.licensePlateState}
                                    onChange={(e) => set("licensePlateState")(e.target.value.toUpperCase().slice(0, 2))}
                                    placeholder="TX"
                                    maxLength={2}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={set("status")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRUCK_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {TRUCK_STATUS_LABELS[s]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assigned Driver */}
                        {showDriverAssignment && drivers.length > 0 && (
                            <div className="space-y-1">
                                <Label>Assigned Driver</Label>
                                <Select
                                    value={form.assignedDriverId || "none"}
                                    onValueChange={(v) => set("assignedDriverId")(v === "none" ? "" : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Unassigned —</SelectItem>
                                        {drivers.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.firstName} {d.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Registration & Inspection */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="truck-reg-expiry">Registration Expiry</Label>
                                <Input
                                    id="truck-reg-expiry"
                                    type="date"
                                    value={form.registrationExpiry}
                                    onChange={(e) => set("registrationExpiry")(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="truck-inspection">Annual Inspection</Label>
                                <Input
                                    id="truck-inspection"
                                    type="date"
                                    value={form.annualInspectionDate}
                                    onChange={(e) => set("annualInspectionDate")(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                            <Label htmlFor="truck-notes">Notes</Label>
                            <Textarea
                                id="truck-notes"
                                value={form.notes}
                                onChange={(e) => set("notes")(e.target.value)}
                                placeholder="Any additional notes..."
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTruckId ? "Save Changes" : "Add Truck"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <ConfirmDialog
                open={!!deletingTruckId}
                title="Delete Truck"
                description="Are you sure you want to delete this truck record? This cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
                onCancel={() => setDeletingTruckId(null)}
            />
        </>
    );
}
