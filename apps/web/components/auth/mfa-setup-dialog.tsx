"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MFASetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeUrl?: string;
}

export function MFASetupDialog({ open, onOpenChange, qrCodeUrl }: MFASetupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up MFA</DialogTitle>
          <DialogDescription>Scan the QR code with your authenticator app.</DialogDescription>
        </DialogHeader>
        {qrCodeUrl ? (
          <div className="flex justify-center">
            <Image src={qrCodeUrl} alt="MFA QR code" width={160} height={160} />
          </div>
        ) : (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            QR code will appear here.
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
