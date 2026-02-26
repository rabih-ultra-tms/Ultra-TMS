"use client";

import { useState } from "react";
import {
    useCarrierDrivers,
    useCreateDriver,
    useUpdateDriverById,
    useDeleteDriverById,
} from "@/lib/hooks/operations";
import { OperationsCarrierDriver } from "@/types/carriers";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

const CDL_CLASSES = ["A", "B", "C"] as const;
const DRIVER_STATUSES = ["ACTIVE", "INACTIVE", "ON_LEAVE"] as const;
const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ON_LEAVE: "On Leave",
};
const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    INACTIVE: "secondary",
    ON_LEAVE: "outline",
};

interface DriverFormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    cdlNumber: string;
    cdlState: string;
    cdlClass: string;
    cdlExpiry: string;
    medicalCardExpiry: string;
    status: string;
    notes: string;
}

const EMPTY_FORM: DriverFormData = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    cdlNumber: "",
    cdlState: "",
    cdlClass: "A",
    cdlExpiry: "",
    medicalCardExpiry: "",
    status: "ACTIVE",
    notes: "",
};

function driverToForm(driver: OperationsCarrierDriver): DriverFormData {
    return {
        firstName: driver.firstName ?? "",
        lastName: driver.lastName ?? "",
        phone: driver.phone ?? "",
        email: driver.email ?? "",
        cdlNumber: driver.cdlNumber ?? "",
        cdlState: driver.cdlState ?? "",
        cdlClass: driver.cdlClass ?? "A",
        // cdlExpiry and medicalCardExpiry come back as ISO strings from API; slice to YYYY-MM-DD for <input type="date">
        cdlExpiry: driver.cdlExpiry ? String(driver.cdlExpiry).slice(0, 10) : "",
        medicalCardExpiry: driver.medicalCardExpiry ? String(driver.medicalCardExpiry).slice(0, 10) : "",
        status: driver.status ?? "ACTIVE",
        notes: driver.notes ?? "",
    };
}

interface CarrierDriversManagerProps {
    carrierId: string;
}

export function CarrierDriversManager({ carrierId }: CarrierDriversManagerProps) {
    const { data: rawDrivers, isLoading } = useCarrierDrivers(carrierId);
    const drivers: OperationsCarrierDriver[] = Array.isArray(rawDrivers) ? rawDrivers : [];

    const createDriver = useCreateDriver(carrierId);
    const updateDriverById = useUpdateDriverById(carrierId);
    const deleteDriverById = useDeleteDriverById(carrierId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
    const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
    const [form, setForm] = useState<DriverFormData>(EMPTY_FORM);

    const isSaving = createDriver.isPending || updateDriverById.isPending;

    const openAdd = () => {
        setEditingDriverId(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (driver: OperationsCarrierDriver) => {
        setEditingDriverId(driver.id);
        setForm(driverToForm(driver));
        setDialogOpen(true);
    };

    const set = (field: keyof DriverFormData) => (value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            toast.error("First and last name are required");
            return;
        }

        const payload: Partial<OperationsCarrierDriver> = {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone || undefined,
            email: form.email || undefined,
            cdlNumber: form.cdlNumber || undefined,
            cdlState: form.cdlState || undefined,
            cdlClass: form.cdlClass || undefined,
            cdlExpiry: form.cdlExpiry || undefined,
            medicalCardExpiry: form.medicalCardExpiry || undefined,
            status: form.status as OperationsCarrierDriver["status"],
            notes: form.notes || undefined,
        };

        try {
            if (editingDriverId) {
                await updateDriverById.mutateAsync({ driverId: editingDriverId, data: payload });
            } else {
                await createDriver.mutateAsync(payload);
                toast.success("Driver added");
            }
            setDialogOpen(false);
        } catch {
            // Errors handled by mutation onError
        }
    };

    const handleDelete = async () => {
        if (!deletingDriverId) return;
        await deleteDriverById.mutateAsync(deletingDriverId);
        setDeletingDriverId(null);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Drivers
                            {drivers.length > 0 && (
                                <Badge variant="secondary">{drivers.length}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Manage drivers for this carrier.</CardDescription>
                    </div>
                    <Button size="sm" onClick={openAdd}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Driver
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading drivers...
                        </div>
                    ) : drivers.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No drivers added yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-4 font-medium">Name</th>
                                        <th className="pb-2 pr-4 font-medium">Phone</th>
                                        <th className="pb-2 pr-4 font-medium">CDL #</th>
                                        <th className="pb-2 pr-4 font-medium">CDL Expiry</th>
                                        <th className="pb-2 pr-4 font-medium">Med. Card Expiry</th>
                                        <th className="pb-2 pr-4 font-medium">Status</th>
                                        <th className="pb-2 font-medium" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map((driver) => (
                                        <tr key={driver.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-medium">
                                                {driver.firstName} {driver.lastName}
                                            </td>
                                            <td className="py-2 pr-4 text-muted-foreground">
                                                {driver.phone ?? "—"}
                                            </td>
                                            <td className="py-2 pr-4 font-mono text-xs">
                                                {driver.cdlNumber ?? "—"}
                                            </td>
                                            <td className="py-2 pr-4 text-muted-foreground">
                                                {driver.cdlExpiry
                                                    ? String(driver.cdlExpiry).slice(0, 10)
                                                    : "—"}
                                            </td>
                                            <td className="py-2 pr-4 text-muted-foreground">
                                                {driver.medicalCardExpiry
                                                    ? String(driver.medicalCardExpiry).slice(0, 10)
                                                    : "—"}
                                            </td>
                                            <td className="py-2 pr-4">
                                                <Badge variant={STATUS_COLORS[driver.status] ?? "secondary"}>
                                                    {STATUS_LABELS[driver.status] ?? driver.status}
                                                </Badge>
                                            </td>
                                            <td className="py-2">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => openEdit(driver)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => setDeletingDriverId(driver.id)}
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

            {/* Add / Edit Driver Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingDriverId ? "Edit Driver" : "Add Driver"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="drv-firstName">First Name *</Label>
                                <Input
                                    id="drv-firstName"
                                    value={form.firstName}
                                    onChange={(e) => set("firstName")(e.target.value)}
                                    placeholder="Jane"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="drv-lastName">Last Name *</Label>
                                <Input
                                    id="drv-lastName"
                                    value={form.lastName}
                                    onChange={(e) => set("lastName")(e.target.value)}
                                    placeholder="Smith"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="drv-phone">Phone</Label>
                                <Input
                                    id="drv-phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => set("phone")(e.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="drv-email">Email</Label>
                                <Input
                                    id="drv-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => set("email")(e.target.value)}
                                    placeholder="driver@example.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1 col-span-2">
                                <Label htmlFor="drv-cdlNumber">CDL Number</Label>
                                <Input
                                    id="drv-cdlNumber"
                                    value={form.cdlNumber}
                                    onChange={(e) => set("cdlNumber")(e.target.value)}
                                    placeholder="D1234567"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="drv-cdlState">CDL State</Label>
                                <Input
                                    id="drv-cdlState"
                                    value={form.cdlState}
                                    onChange={(e) => set("cdlState")(e.target.value.toUpperCase().slice(0, 2))}
                                    placeholder="TX"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label>CDL Class</Label>
                                <Select value={form.cdlClass} onValueChange={set("cdlClass")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CDL_CLASSES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                Class {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="drv-cdlExpiry">CDL Expiry</Label>
                                <Input
                                    id="drv-cdlExpiry"
                                    type="date"
                                    value={form.cdlExpiry}
                                    onChange={(e) => set("cdlExpiry")(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="drv-medCardExpiry">Med. Card Expiry</Label>
                                <Input
                                    id="drv-medCardExpiry"
                                    type="date"
                                    value={form.medicalCardExpiry}
                                    onChange={(e) => set("medicalCardExpiry")(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={set("status")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DRIVER_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {STATUS_LABELS[s]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingDriverId ? "Save Changes" : "Add Driver"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <ConfirmDialog
                open={!!deletingDriverId}
                title="Remove Driver"
                description="Are you sure you want to remove this driver? This action cannot be undone."
                confirmLabel="Remove Driver"
                variant="destructive"
                onConfirm={handleDelete}
                onCancel={() => setDeletingDriverId(null)}
            />
        </>
    );
}
