'use client';

import { useState } from 'react';
import { useClaimFormStore } from '@/lib/stores/claim-form-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DAMAGE_TYPES = [
  'Water Damage',
  'Impact Damage',
  'Contamination',
  'Spoilage',
  'Theft',
  'Lost Package',
  'Other',
];

const DAMAGE_EXTENTS = ['Minor', 'Moderate', 'Severe', 'Total Loss'];

export function ClaimFormStep2() {
  const formState = useClaimFormStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    description: '',
    quantity: '1',
    unitPrice: '0',
    damageType: '',
    damageExtent: '',
  });

  const items = formState.getItems();
  const totalValue = formState.getItemsTotal();

  const handleAddItem = () => {
    // Validate fields
    if (!formValues.description.trim()) {
      toast.error('Please enter an item description');
      return;
    }

    const quantity = parseFloat(formValues.quantity);
    const unitPrice = parseFloat(formValues.unitPrice);

    if (isNaN(quantity) || quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error('Unit price must be non-negative');
      return;
    }

    formState.addItem({
      description: formValues.description.trim(),
      quantity,
      unitPrice,
      damageType: formValues.damageType || undefined,
      damageExtent: formValues.damageExtent || undefined,
    });

    // Reset form
    setFormValues({
      description: '',
      quantity: '1',
      unitPrice: '0',
      damageType: '',
      damageExtent: '',
    });

    setShowAddDialog(false);
    toast.success('Item added to claim');
  };

  const handleDeleteItem = (id: string) => {
    formState.removeItem(id);
    setDeleteItemId(null);
    toast.success('Item removed from claim');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-sm text-text-primary">
          Add each damaged or affected item to your claim. Specify the
          description, quantity, and unit price for each item.
        </p>
      </Card>

      {/* Add Item Button */}
      <Button onClick={() => setShowAddDialog(true)} className="gap-2">
        <Plus className="size-4" />
        Add Item
      </Button>

      {/* Items Table */}
      {items.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20 text-center">Damage Type</TableHead>
                <TableHead className="w-16 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const itemTotal = item.quantity * item.unitPrice;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.description}
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
                    <TableCell className="text-center text-sm">
                      {item.damageType ? (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {item.damageType}
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteItemId(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Total Row */}
          <div className="border-t bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-text-primary">
                Total Claimed Amount:
              </p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex h-32 flex-col items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-sm text-text-muted">
            No items added yet. Click "Add Item" to get started.
          </p>
        </Card>
      )}

      {/* Validation Summary */}
      <Card
        className={cn(
          'border-l-4 p-4',
          items.length > 0
            ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-950'
            : 'border-yellow-500 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950'
        )}
      >
        <h3 className="mb-2 text-sm font-medium text-text-primary">
          Step 2 Validation
        </h3>
        <ul className="space-y-1 text-xs text-text-muted">
          <li className={items.length > 0 ? 'text-green-600' : ''}>
            {items.length > 0 ? '✓' : '○'} At least 1 item added ({items.length}
            )
          </li>
          <li className={totalValue > 0 ? 'text-green-600' : ''}>
            {totalValue > 0 ? '✓' : '○'} Total claimed amount:{' '}
            {formatCurrency(totalValue)}
          </li>
        </ul>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Item to Claim</DialogTitle>
            <DialogDescription>
              Enter the details of the damaged or affected item
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Item Description <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Electronic Components, Food Items, Furniture"
                value={formValues.description}
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
              />
            </div>

            {/* Quantity and Unit Price */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="1"
                  min="1"
                  value={formValues.quantity}
                  onChange={(e) =>
                    setFormValues({ ...formValues, quantity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Unit Price (USD) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formValues.unitPrice}
                  onChange={(e) =>
                    setFormValues({ ...formValues, unitPrice: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Damage Type and Extent */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Damage Type
                </label>
                <select
                  value={formValues.damageType}
                  onChange={(e) =>
                    setFormValues({ ...formValues, damageType: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <option value="">Select damage type...</option>
                  {DAMAGE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Damage Extent
                </label>
                <select
                  value={formValues.damageExtent}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      damageExtent: e.target.value,
                    })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <option value="">Select extent...</option>
                  {DAMAGE_EXTENTS.map((extent) => (
                    <option key={extent} value={extent}>
                      {extent}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteItemId !== null}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from the claim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteItemId(null)}>
              Keep Item
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
            >
              Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
