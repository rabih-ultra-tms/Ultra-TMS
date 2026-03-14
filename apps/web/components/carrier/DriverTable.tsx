'use client';

import * as React from 'react';
import { AlertCircle, Edit, Trash2, Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState, LoadingState, ErrorState } from '@/components/shared';
import {
  Driver,
  DriverStatus,
  useDeleteDriver,
} from '@/lib/hooks/carrier/use-drivers';
import { DriverFormDialog } from './DriverFormDialog';
import { AssignLoadDialog } from './AssignLoadDialog';

interface DriverTableProps {
  drivers: Driver[];
  onAddDriver?: () => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function DriverTable({
  drivers,
  isLoading = false,
  error = null,
  onRetry,
}: DriverTableProps) {
  const [editingDriver, setEditingDriver] = React.useState<Driver | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [assignLoadOpen, setAssignLoadOpen] = React.useState(false);
  const [assigningDriver, setAssigningDriver] = React.useState<Driver | null>(
    null
  );
  const [deletingDriver, setDeletingDriver] = React.useState<Driver | null>(
    null
  );

  const deleteDriverMutation = useDeleteDriver();

  const handleAddClick = () => {
    setEditingDriver(null);
    setFormOpen(true);
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
    setFormOpen(true);
  };

  const handleAssignClick = (driver: Driver) => {
    setAssigningDriver(driver);
    setAssignLoadOpen(true);
  };

  const handleDeleteClick = (driver: Driver) => {
    setDeletingDriver(driver);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDriver) return;
    try {
      await deleteDriverMutation.mutateAsync(deletingDriver.id);
      setDeletingDriver(null);
    } catch {
      // Error handled by mutation
    }
  };

  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case DriverStatus.INACTIVE:
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case DriverStatus.SUSPENDED:
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLicenseExpiryClass = (expiryDate?: string | null) => {
    if (!expiryDate) return '';

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return 'text-red-600';
    } else if (daysUntilExpiry < 30) {
      return 'text-yellow-600';
    }
    return '';
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading && !drivers.length) {
    return <LoadingState message="Loading drivers..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load drivers"
        message={error instanceof Error ? error.message : 'An error occurred'}
        retry={onRetry}
      />
    );
  }

  if (!drivers.length) {
    return (
      <EmptyState
        title="No drivers yet"
        description="Add your first driver to get started with driver management."
        action={
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[140px]">License Number</TableHead>
              <TableHead className="min-w-[120px]">License Expiry</TableHead>
              <TableHead className="min-w-[140px]">Phone</TableHead>
              <TableHead className="min-w-[100px] text-center">
                Status
              </TableHead>
              <TableHead className="min-w-[200px] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <div className="font-medium">
                    {driver.firstName} {driver.lastName}
                  </div>
                  {driver.email && (
                    <div className="text-sm text-muted-foreground">
                      {driver.email}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>{driver.cdlNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {driver.cdlState} - Class {driver.cdlClass}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`flex items-center gap-2 ${getLicenseExpiryClass(
                      driver.cdlExpiration
                    )}`}
                  >
                    {getLicenseExpiryClass(driver.cdlExpiration) ===
                      'text-red-600' && <AlertCircle className="h-4 w-4" />}
                    {formatDate(driver.cdlExpiration)}
                  </div>
                </TableCell>
                <TableCell>{driver.phone || '—'}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(driver.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(driver)}
                      title="Edit driver"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignClick(driver)}
                      title="Assign load"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(driver)}
                      title="Delete driver"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DriverFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        driver={editingDriver || undefined}
      />

      <AssignLoadDialog
        open={assignLoadOpen}
        onOpenChange={setAssignLoadOpen}
        driver={assigningDriver}
      />

      <AlertDialog
        open={!!deletingDriver}
        onOpenChange={() => setDeletingDriver(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingDriver?.firstName}{' '}
              {deletingDriver?.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={deleteDriverMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteDriverMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteDriverMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
