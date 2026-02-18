'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Building2,
  Truck,
  Users,
  Shield,
} from 'lucide-react';
import {
  useFmcsaLookup,
  type FmcsaCarrierRecord,
} from '@/lib/hooks/carriers/use-fmcsa';

interface FmcsaLookupProps {
  onAutoFill?: (data: {
    companyName?: string;
    mcNumber?: string;
    dotNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
  }) => void;
}

export function FmcsaLookup({ onAutoFill }: FmcsaLookupProps) {
  const [lookupType, setLookupType] = useState<'mc' | 'dot'>('mc');
  const [lookupValue, setLookupValue] = useState('');
  const lookup = useFmcsaLookup();

  const handleLookup = () => {
    const trimmed = lookupValue.trim();
    if (!trimmed) return;

    lookup.mutate(
      lookupType === 'mc'
        ? { mcNumber: trimmed }
        : { dotNumber: trimmed },
    );
  };

  const handleAutoFill = (record: FmcsaCarrierRecord) => {
    onAutoFill?.({
      companyName: record.legalName ?? undefined,
      mcNumber: record.mcNumber ?? undefined,
      dotNumber: record.dotNumber ?? undefined,
      address: record.physicalAddress ?? undefined,
      city: record.physicalCity ?? undefined,
      state: record.physicalState ?? undefined,
      zip: record.physicalZip ?? undefined,
      phone: record.phone ?? undefined,
    });
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4" />
          FMCSA Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lookup input */}
        <div className="flex gap-2">
          <div className="flex rounded-md border overflow-hidden">
            <button
              type="button"
              onClick={() => setLookupType('mc')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                lookupType === 'mc'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              MC#
            </button>
            <button
              type="button"
              onClick={() => setLookupType('dot')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                lookupType === 'dot'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              DOT#
            </button>
          </div>
          <Input
            placeholder={lookupType === 'mc' ? 'Enter MC number' : 'Enter DOT number'}
            value={lookupValue}
            onChange={(e) => setLookupValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleLookup}
            disabled={!lookupValue.trim() || lookup.isPending}
          >
            {lookup.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Verify
          </Button>
        </div>

        {/* Error */}
        {lookup.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              FMCSA lookup failed. You can continue with manual entry.
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {lookup.data && (
          <FmcsaResultCard
            record={lookup.data}
            onAutoFill={() => handleAutoFill(lookup.data!)}
          />
        )}
      </CardContent>
    </Card>
  );
}

function FmcsaResultCard({
  record,
  onAutoFill,
}: {
  record: FmcsaCarrierRecord;
  onAutoFill: () => void;
}) {
  const isActive = record.operatingStatus === 'ACTIVE';
  const isOOS = record.operatingStatus === 'OUT_OF_SERVICE';

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Authority status banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isActive ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : isOOS ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
          <span className="font-medium text-sm">
            Authority: {record.operatingStatus ?? 'Unknown'}
          </span>
        </div>
        <Badge
          variant={isActive ? 'default' : 'destructive'}
          className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {isActive ? 'AUTHORIZED' : record.operatingStatus ?? 'UNKNOWN'}
        </Badge>
      </div>

      {/* Carrier info grid */}
      <div className="grid gap-2 sm:grid-cols-2 text-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs">Legal Name</p>
            <p className="font-medium">{record.legalName ?? '—'}</p>
          </div>
        </div>
        {record.dbaName && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">DBA</p>
              <p className="font-medium">{record.dbaName}</p>
            </div>
          </div>
        )}
        {record.powerUnitCount != null && (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Power Units</p>
              <p className="font-medium">{record.powerUnitCount}</p>
            </div>
          </div>
        )}
        {record.driverCount != null && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Drivers</p>
              <p className="font-medium">{record.driverCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Authority types */}
      <div className="flex gap-2 flex-wrap">
        {record.commonAuthority && (
          <Badge variant="outline" className="text-xs">Common Authority</Badge>
        )}
        {record.contractAuthority && (
          <Badge variant="outline" className="text-xs">Contract Authority</Badge>
        )}
        {record.brokerAuthority && (
          <Badge variant="outline" className="text-xs">Broker Authority</Badge>
        )}
      </div>

      {/* Auto-fill button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onAutoFill}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Auto-fill carrier form with FMCSA data
      </Button>
    </div>
  );
}
