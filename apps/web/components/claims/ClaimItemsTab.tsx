'use client';

import { useState } from 'react';
import { ClaimItem, CreateClaimItemDTO } from '@/lib/api/claims/types';
import { claimItemsClient } from '@/lib/api/claims';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClaimItemsTabProps {
  claimId: string;
  items: ClaimItem[];
  onItemsChange: () => void;
}

interface ItemFormData {
  description: string;
  quantity: string;
  unitPrice: string;
  damageType: string;
  damageExtent: string;
}

export function ClaimItemsTab({
  claimId,
  items,
  onItemsChange,
}: ClaimItemsTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({
    description: '',
    quantity: '1',
    unitPrice: '0',
    damageType: '',
    damageExtent: '',
  });

  const resetForm = () => {
    setFormData({
      description: '',
      quantity: '1',
      unitPrice: '0',
      damageType: '',
      damageExtent: '',
    });
  };

  const handleAddItem = async () => {
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    const quantity = parseInt(formData.quantity, 10);
    const unitPrice = parseFloat(formData.unitPrice);
    if (isNaN(quantity) || quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error('Unit price must be non-negative');
      return;
    }

    try {
      setIsSubmitting(true);
      const itemData: CreateClaimItemDTO = {
        description: formData.description.trim(),
        quantity,
        unitPrice,
        damageType: formData.damageType || undefined,
        damageExtent: formData.damageExtent || undefined,
      };
      await claimItemsClient.addItem(claimId, itemData);
      toast.success('Item added successfully');
      resetForm();
      setShowAddDialog(false);
      onItemsChange();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmId) return;
    try {
      setIsSubmitting(true);
      await claimItemsClient.deleteItem(claimId, deleteConfirmId);
      toast.success('Item deleted successfully');
      setDeleteConfirmId(null);
      onItemsChange();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalValue = items.reduce(
    (sum, item) => sum + (item.totalValue || item.quantity * item.unitPrice),
    0
  );

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Claim Item</DialogTitle>
              <DialogDescription>
                Add a damaged or affected item to this claim
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the item"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="mt-1 min-h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Damage Type (Optional)
                </label>
                <Input
                  placeholder="e.g., Water damage, Dent"
                  value={formData.damageType}
                  onChange={(e) =>
                    setFormData({ ...formData, damageType: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Damage Extent (Optional)
                </label>
                <Input
                  placeholder="e.g., Total loss, 50% damage"
                  value={formData.damageExtent}
                  onChange={(e) =>
                    setFormData({ ...formData, damageExtent: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleAddItem}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No items yet. Add one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const itemTotal =
                        item.totalValue || item.quantity * item.unitPrice;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-sm">
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.damageType && (
                                <p className="text-xs text-muted-foreground">
                                  {item.damageType}
                                  {item.damageExtent &&
                                    ` • ${item.damageExtent}`}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(itemTotal)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                title="Edit coming soon"
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmId(item.id)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
