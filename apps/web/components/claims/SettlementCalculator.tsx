'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { claimSettlementClient } from '@/lib/api/claims';
import {
  ClaimDetailResponse,
  ClaimStatus,
  CreateClaimAdjustmentDTO,
} from '@/lib/api/claims/types';
import { z } from 'zod';

// ===========================
// Types
// ===========================

interface SettlementCalculatorProps {
  claim: ClaimDetailResponse;
  claimId: string;
  onSuccess: () => void;
}

interface AdjustmentForm {
  reason: string;
  amount: number;
}

// ===========================
// Validation
// ===========================

const adjustmentSchema = z.object({
  reason: z.enum(['DEDUCTIBLE', 'DEPRECIATION', 'SUBROGATION', 'OTHER']),
  amount: z.number().refine((val) => val !== 0, 'Amount cannot be zero'),
});

const settlementSchema = z.object({
  deductible: z.number().min(0, 'Deductible must be non-negative'),
  paymentMethod: z.enum(['CHECK', 'ACH', 'CARD', 'WIRE']),
  notes: z.string().optional(),
});

// ===========================
// Helper Functions
// ===========================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: ClaimStatus): string {
  return status.split('_').join(' ');
}

// ===========================
// Component
// ===========================

export function SettlementCalculator({
  claim,
  claimId,
  onSuccess,
}: SettlementCalculatorProps) {
  const router = useRouter();

  // Form state
  const [deductible, setDeductible] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    'CHECK' | 'ACH' | 'CARD' | 'WIRE' | ''
  >('');
  const [notes, setNotes] = useState('');
  const [adjustments, setAdjustments] = useState(claim.adjustments || []);
  const [newAdjustment, setNewAdjustment] = useState<AdjustmentForm>({
    reason: '',
    amount: 0,
  });
  const [showAddAdjustment, setShowAddAdjustment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Calculations
  const totalAdjustments = adjustments.reduce(
    (sum, adj) => sum + adj.adjustmentAmount,
    0
  );
  const approvedAmount = claim.claimedAmount - deductible + totalAdjustments;

  // Handle add adjustment
  const handleAddAdjustment = async () => {
    try {
      const validation = adjustmentSchema.safeParse(newAdjustment);
      if (!validation.success) {
        toast.error('Please fill in all adjustment fields correctly');
        return;
      }

      const adjustmentData: CreateClaimAdjustmentDTO = {
        adjustmentType: 'MANUAL',
        reason: newAdjustment.reason,
        adjustmentAmount: newAdjustment.amount,
      };

      const added = await claimSettlementClient.addAdjustment(
        claimId,
        adjustmentData
      );
      setAdjustments([...adjustments, added]);
      setNewAdjustment({ reason: '', amount: 0 });
      setShowAddAdjustment(false);
      toast.success('Adjustment added successfully');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to add adjustment';
      toast.error(message);
    }
  };

  // Handle remove adjustment
  const handleRemoveAdjustment = async (adjustmentId: string) => {
    try {
      await claimSettlementClient.deleteAdjustment(claimId, adjustmentId);
      setAdjustments(adjustments.filter((adj) => adj.id !== adjustmentId));
      toast.success('Adjustment removed successfully');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove adjustment';
      toast.error(message);
    }
  };

  // Handle approve claim
  const handleApprove = async () => {
    try {
      const validation = settlementSchema.safeParse({
        deductible,
        paymentMethod,
        notes,
      });

      if (!validation.success) {
        toast.error('Please select a payment method');
        return;
      }

      setIsSubmitting(true);
      setLastError(null);
      await claimSettlementClient.approve(claimId, {
        approvedAmount,
        reason: notes || undefined,
      });
      toast.success('Claim approved successfully');
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to approve claim';
      setLastError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deny claim
  const handleDeny = async () => {
    try {
      if (!notes.trim()) {
        toast.error('Please provide a reason for denial');
        return;
      }

      setIsSubmitting(true);
      setLastError(null);
      // Backend uses "deny" and DENIED status (not "reject")
      await claimSettlementClient.deny(claimId, {
        reason: notes,
      });
      toast.success('Claim denied successfully');
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to deny claim';
      setLastError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if settlement is allowed
  // Spec: Only show if status = UNDER_REVIEW or later
  // Since UNDER_REVIEW doesn't exist in enum, interpret as "after investigation is complete"
  // Allow: APPROVED, SETTLED, CLOSED (after investigation is done)
  // Deny: DRAFT, SUBMITTED, UNDER_INVESTIGATION, PENDING_DOCUMENTATION (investigation in progress)
  const deniedStatuses = [
    ClaimStatus.DRAFT,
    ClaimStatus.SUBMITTED,
    ClaimStatus.UNDER_INVESTIGATION,
    ClaimStatus.PENDING_DOCUMENTATION,
  ];
  const isSettlementAllowed = claim && !deniedStatuses.includes(claim.status);

  if (!isSettlementAllowed) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800">
            Settlement calculator is only available after investigation is
            complete.
          </p>
          <p className="mt-2 text-xs text-yellow-700">
            Allowed statuses: <strong>Approved, Settled, Closed</strong>
          </p>
          <p className="text-xs text-yellow-700">
            Current status: <strong>{formatStatus(claim.status)}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Base Claim Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(claim.claimedAmount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Original claimed amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(Math.max(0, approvedAmount))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              After deductible and adjustments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deductible Section */}
      <Card>
        <CardHeader>
          <CardTitle>Deductible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="deductible" className="text-sm font-medium">
                  Deductible Amount
                </Label>
                <Input
                  id="deductible"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deductible}
                  onChange={(e) =>
                    setDeductible(parseFloat(e.target.value) || 0)
                  }
                  className="mt-2"
                  placeholder="0.00"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  After Deductible
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(claim.claimedAmount - deductible)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjustments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Adjustments</CardTitle>
          <Dialog open={showAddAdjustment} onOpenChange={setShowAddAdjustment}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 size-4" />
                Add Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Adjustment</DialogTitle>
                <DialogDescription>
                  Add a manual adjustment to the claim amount
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="adjustment-reason"
                    className="text-sm font-medium"
                  >
                    Adjustment Reason
                  </Label>
                  <Select
                    value={newAdjustment.reason}
                    onValueChange={(value) =>
                      setNewAdjustment({
                        ...newAdjustment,
                        reason: value,
                      })
                    }
                  >
                    <SelectTrigger id="adjustment-reason" className="mt-2">
                      <SelectValue placeholder="Select adjustment reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEDUCTIBLE">Deductible</SelectItem>
                      <SelectItem value="DEPRECIATION">Depreciation</SelectItem>
                      <SelectItem value="SUBROGATION">Subrogation</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="adjustment-amount"
                    className="text-sm font-medium"
                  >
                    Amount (negative for reduction, positive for increase)
                  </Label>
                  <Input
                    id="adjustment-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAdjustment.amount}
                    onChange={(e) =>
                      setNewAdjustment({
                        ...newAdjustment,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleAddAdjustment} className="w-full">
                  Add Adjustment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {adjustments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No adjustments added yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="w-10">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adj) => (
                    <TableRow key={adj.id}>
                      <TableCell>{adj.reason}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            adj.adjustmentAmount > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {adj.adjustmentAmount > 0 ? '+' : ''}
                          {formatCurrency(adj.adjustmentAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(adj.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {adj.createdBy || 'System'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdjustment(adj.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total Adjustments:</span>
                  <span
                    className={
                      totalAdjustments > 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {totalAdjustments > 0 ? '+' : ''}
                    {formatCurrency(totalAdjustments)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlement Information */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payment-method" className="text-sm font-medium">
              Payment Method
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(
                  value as 'CHECK' | 'ACH' | 'CARD' | 'WIRE' | ''
                )
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="ACH">ACH Transfer</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="WIRE">Wire Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="settlement-notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="settlement-notes"
              placeholder="Add any additional notes or approval reason..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary and Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">Settlement Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Claimed Amount:</span>
            <span className="font-medium">
              {formatCurrency(claim.claimedAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Deductible:</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(deductible)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Adjustments:</span>
            <span
              className={`font-medium ${
                totalAdjustments > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalAdjustments > 0 ? '+' : ''}
              {formatCurrency(totalAdjustments)}
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="font-semibold">Approved Amount:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(Math.max(0, approvedAmount))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Retry UI */}
      {lastError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="mb-3 text-sm text-red-700">{lastError}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLastError(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/claims/${claimId}`)}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Details
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeny}
          disabled={isSubmitting || !notes.trim()}
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          Deny Claim
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isSubmitting || !paymentMethod}
          className="flex-1"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          Approve Claim
        </Button>
      </div>
    </div>
  );
}
