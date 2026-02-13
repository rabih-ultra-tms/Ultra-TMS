"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, RotateCcw } from "lucide-react";
import { VisibilityState } from "@tanstack/react-table";

interface ColumnSettingsDrawerProps {
    open: boolean;
    onClose: () => void;
    currentVisibility: VisibilityState;
    onVisibilityChange: (visibility: VisibilityState) => void;
}

export function ColumnSettingsDrawer({
    open,
    onClose,
    currentVisibility,
    onVisibilityChange
}: ColumnSettingsDrawerProps) {

    // Mock columns definition for settings
    const columns = [
        { id: "loadNumber", label: "Load #" },
        { id: "status", label: "Status" },
        { id: "route", label: "Origin > Destination" },
        { id: "pickupDate", label: "Pickup Date" },
        { id: "deliveryDate", label: "Delivery Date" },
        { id: "carrier", label: "Carrier" },
        { id: "equipmentType", label: "Equipment" },
        { id: "actions", label: "Actions" },
    ];

    const toggleColumn = (id: string, checked: boolean) => {
        onVisibilityChange({
            ...currentVisibility,
            [id]: checked
        });
    };

    const resetToDefault = () => {
        onVisibilityChange({});
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" /> View Settings
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Columns</h3>
                            <Button variant="ghost" size="sm" onClick={resetToDefault} className="h-6 px-2 text-xs">
                                <RotateCcw className="h-3 w-3 mr-1" /> Reset
                            </Button>
                        </div>
                        <ScrollArea className="h-[300px] rounded-md border p-4 bg-muted/20">
                            <div className="space-y-3">
                                {columns.map(col => (
                                    <div key={col.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`col-${col.id}`}
                                            checked={currentVisibility[col.id] !== false}
                                            onCheckedChange={(checked) => toggleColumn(col.id, !!checked)}
                                        />
                                        <Label htmlFor={`col-${col.id}`} className="text-sm cursor-pointer">{col.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Display</h3>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>Density controls coming soon.</p>
                            <p>Theme controls coming soon.</p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
