'use client';

import { useClaimFormStore } from '@/lib/stores/claim-form-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { File } from 'lucide-react';
import { useCarriers } from '@/lib/hooks/operations';

interface ClaimFormStep4Props {
  onSaveAsDraft: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ClaimFormStep4({
  onSaveAsDraft,
  onSubmit,
  isLoading,
}: ClaimFormStep4Props) {
  const formState = useClaimFormStore();
  const { data: carriersData } = useCarriers({ page: 1, limit: 1000 });

  const items = formState.getItems();
  const documents = formState.getDocuments();
  const totalValue = formState.getItemsTotal();
  const selectedCarrier = (carriersData?.data || []).find(
    (c) => c.id === formState.carrierId
  );

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
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Review Your Claim
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Please review all information before submitting your claim. You can
          save as draft or file the claim now.
        </p>
      </div>

      {/* Step 1: Claim Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claim Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-text-muted">Claim Type</p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {formState.claimType}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">
                Incident Date
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {formState.incidentDate
                  ? new Date(formState.incidentDate).toLocaleString()
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">
                Incident Location
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {formState.incidentLocation || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Carrier</p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {selectedCarrier?.companyName || 'Not selected'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-text-muted">Description</p>
            <p className="mt-2 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-text-primary dark:bg-gray-900">
              {formState.description}
            </p>
          </div>

          {(formState.orderId || formState.loadId) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formState.orderId && (
                <div>
                  <p className="text-xs font-medium text-text-muted">
                    Order ID
                  </p>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {formState.orderId}
                  </p>
                </div>
              )}
              {formState.loadId && (
                <div>
                  <p className="text-xs font-medium text-text-muted">Load ID</p>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {formState.loadId}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Items Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Items & Damages ({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const itemTotal = item.quantity * item.unitPrice;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{item.description}</p>
                              {item.damageType && (
                                <p className="mt-1 text-xs text-text-muted">
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="font-semibold text-text-primary">
                  Total Claimed Amount
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted">No items added.</p>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Documents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Supporting Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <File className="size-4 text-gray-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {doc.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {doc.documentType}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              No documents uploaded. (Optional)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-l-4 border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950">
        <CardContent className="pt-6">
          <h3 className="mb-2 font-medium text-text-primary">
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong>If you file the claim:</strong> It will be submitted for
                processing and reviewed by our team.
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong>If you save as draft:</strong> You can continue editing
                later before filing.
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                You will receive email updates on the status of your claim.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          onClick={onSaveAsDraft}
          disabled={isLoading}
          className="flex-1"
        >
          Save as Draft
        </Button>
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Filing Claim...' : 'File Claim'}
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-text-muted">
        By filing this claim, you certify that the information provided is true
        and accurate to the best of your knowledge.
      </p>
    </div>
  );
}
