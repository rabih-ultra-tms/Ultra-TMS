'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Contract, ContractStatus } from '@/lib/api/contracts/types';
import { contractsApi } from '@/lib/api/contracts/client';
import { toast } from 'sonner';
import { RotateCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface RenewalQueueProps {
  contracts: Contract[];
  isLoading?: boolean;
  onRenewalSuccess?: () => void;
}

/**
 * Renewal Queue Component
 * Shows contracts expiring within 30 days with renewal actions
 */
export function RenewalQueue({
  contracts,
  isLoading = false,
  onRenewalSuccess,
}: RenewalQueueProps) {
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [selectedForRenewal, setSelectedForRenewal] = useState<string | null>(null);
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState<
    Record<string, boolean>
  >({});

  // Filter contracts expiring within 30 days
  const expiringContracts = contracts.filter((contract) => {
    const today = new Date();
    const expireDate = new Date(contract.endDate);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (
      contract.status === ContractStatus.ACTIVE &&
      diffDays > 0 &&
      diffDays <= 30
    );
  });

  const getDaysRemaining = (endDate: string): number => {
    const today = new Date();
    const expireDate = new Date(endDate);
    const diffTime = expireDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyBadgeColor = (daysRemaining: number): string => {
    if (daysRemaining <= 7) {
      return 'bg-red-100 text-red-800';
    } else if (daysRemaining <= 14) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  const handleRenewal = async (contractId: string): Promise<void> => {
    setRenewingId(contractId);
    try {
      await contractsApi.renew(contractId);
      toast.success('Contract renewed successfully');
      setSelectedForRenewal(null);
      onRenewalSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to renew contract');
    } finally {
      setRenewingId(null);
    }
  };

  const toggleAutoRenewal = (contractId: string) => {
    setAutoRenewalEnabled((prev) => ({
      ...prev,
      [contractId]: !prev[contractId],
    }));
    const isEnabled = autoRenewalEnabled[contractId];
    toast.success(
      `Auto-renewal ${isEnabled ? 'disabled' : 'enabled'} for this contract`
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renewal Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expiringContracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renewal Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-4" />
            <p className="text-sm text-text-muted">
              No contracts expiring within 30 days
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Renewal Queue</CardTitle>
              <p className="mt-1 text-sm text-text-muted">
                {expiringContracts.length} contract
                {expiringContracts.length !== 1 ? 's' : ''} expiring within 30
                days
              </p>
            </div>
            <Badge variant="destructive">{expiringContracts.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringContracts.map((contract) => {
                const daysRemaining = getDaysRemaining(contract.endDate);
                const isRenewing = renewingId === contract.id;

                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium text-blue-600">
                      {contract.contractNumber}
                    </TableCell>
                    <TableCell>{contract.partyName}</TableCell>
                    <TableCell>
                      {new Date(contract.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getUrgencyBadgeColor(daysRemaining)}
                      >
                        {daysRemaining} days
                      </Badge>
                    </TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleAutoRenewal(contract.id)
                          }
                          title={
                            autoRenewalEnabled[contract.id]
                              ? 'Disable auto-renewal'
                              : 'Enable auto-renewal'
                          }
                        >
                          {autoRenewalEnabled[contract.id] ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            setSelectedForRenewal(contract.id)
                          }
                          disabled={isRenewing}
                          className="gap-1"
                        >
                          <RotateCw className="h-3 w-3" />
                          {isRenewing ? 'Renewing...' : 'Renew'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Renewal Confirmation Dialog */}
      {selectedForRenewal && (
        <AlertDialog
          open={!!selectedForRenewal}
          onOpenChange={(open) => !open && setSelectedForRenewal(null)}
        >
          <AlertDialogContent>
            <AlertDialogTitle>Renew Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to renew this contract? A new contract with
              the same terms will be created with an updated expiry date.
            </AlertDialogDescription>
            <div className="flex items-center justify-end gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleRenewal(selectedForRenewal)}
                disabled={renewingId === selectedForRenewal}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {renewingId === selectedForRenewal ? 'Renewing...' : 'Renew'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
