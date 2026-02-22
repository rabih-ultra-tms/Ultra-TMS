"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface BidCounterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (amount: number, notes?: string) => void;
    isPending: boolean;
}

export function BidCounterDialog({
    open,
    onOpenChange,
    onSubmit,
    isPending,
}: BidCounterDialogProps) {
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (Number.isNaN(parsed) || parsed <= 0) return;
        onSubmit(parsed, notes || undefined);
        setAmount("");
        setNotes("");
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Counter Offer</DialogTitle>
                    <DialogDescription>
                        Enter your counter amount. The carrier will receive a
                        notification with your offer.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="counter-amount">
                            Counter Amount ($)
                        </Label>
                        <Input
                            id="counter-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="2500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="counter-notes">Notes (optional)</Label>
                        <Textarea
                            id="counter-notes"
                            placeholder="Reason for counter..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isPending ||
                                !amount ||
                                parseFloat(amount) <= 0
                            }
                        >
                            {isPending ? "Sending..." : "Send Counter Offer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
