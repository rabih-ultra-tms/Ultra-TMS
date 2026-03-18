'use client';

import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useNoaRecords,
  useVerifyNoaRecord,
  useReleaseNoaRecord,
  NoaRecord,
  VerifyNoaDto,
  ReleaseNoaDto,
} from '@/lib/hooks/factoring';
import { useToast } from '@/lib/hooks/use-toast';
import { Check, X } from 'lucide-react';

type DialogMode = null | 'verify' | 'release';

export default function NoaRecordsPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<NoaRecord['status'] | ''>('');
  const [selectedRecord, setSelectedRecord] = useState<NoaRecord | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [notes, setNotes] = useState('');

  const { data, isLoading, refetch } = useNoaRecords({
    status: (status as NoaRecord['status'] | '') || undefined,
  });

  const { mutateAsync: verify, isPending: isVerifying } = useVerifyNoaRecord(
    selectedRecord?.id ?? ''
  );
  const { mutateAsync: release, isPending: isReleasing } = useReleaseNoaRecord(
    selectedRecord?.id ?? ''
  );

  const handleVerify = (record: NoaRecord) => {
    setSelectedRecord(record);
    setDialogMode('verify');
    setNotes('');
  };

  const handleRelease = (record: NoaRecord) => {
    setSelectedRecord(record);
    setDialogMode('release');
    setNotes('');
  };

  const handleSubmitDialog = async () => {
    if (!selectedRecord) return;

    try {
      if (dialogMode === 'verify') {
        const dto: VerifyNoaDto = {
          verificationDate: new Date().toISOString().split('T')[0],
          verificationNotes: notes,
        };
        await verify(dto);
        toast({ title: 'Success', description: 'NOA verified successfully' });
      } else if (dialogMode === 'release') {
        const dto: ReleaseNoaDto = { releaseNotes: notes };
        await release(dto);
        toast({ title: 'Success', description: 'NOA released successfully' });
      }
      refetch();
      setDialogMode(null);
    } catch (_err) {
      toast({
        title: 'Error',
        description: 'Failed to update NOA',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (
    status: NoaRecord['status']
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'PENDING':
        return 'outline';
      case 'VERIFIED':
        return 'secondary';
      case 'ACTIVE':
        return 'default';
      case 'EXPIRED':
        return 'destructive';
      case 'RELEASED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">NOA Records</h2>
        <p className="text-sm text-muted-foreground">
          Network Operating Agreement verification and management
        </p>
      </div>

      {/* Filters */}
      <div>
        <Label htmlFor="status">Filter by Status</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as NoaRecord['status'] | '')
          }
        >
          <SelectTrigger id="status" className="w-[200px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="RELEASED">Released</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NOA Number</TableHead>
              <TableHead>NOA Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Verification Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading NOA records...
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No NOA records found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono">
                    {record.noaNumber}
                  </TableCell>
                  <TableCell>
                    {new Date(record.noaDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {record.noaExpiryDate
                      ? new Date(record.noaExpiryDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {record.verificationMethod.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {record.status === 'PENDING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerify(record)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {(record.status === 'VERIFIED' ||
                      record.status === 'ACTIVE') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRelease(record)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={!!dialogMode} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'verify'
                ? 'Verify NOA Record'
                : 'Release NOA Record'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="noa">NOA Number</Label>
              <div className="py-2 text-sm font-mono">
                {selectedRecord?.noaNumber}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">
                {dialogMode === 'verify'
                  ? 'Verification Notes'
                  : 'Release Notes'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this action..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogMode(null)}
              disabled={isVerifying || isReleasing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDialog}
              disabled={isVerifying || isReleasing}
            >
              {dialogMode === 'verify'
                ? isVerifying
                  ? 'Verifying...'
                  : 'Verify'
                : isReleasing
                  ? 'Releasing...'
                  : 'Release'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
