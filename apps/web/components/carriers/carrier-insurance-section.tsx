'use client';

import { OperationsCarrier } from '@/types/carriers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CarrierInsuranceSectionProps {
  carrier: OperationsCarrier;
}

function getExpiryStatus(expiryDate: string): {
  label: string;
  className: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number;
} {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      label: 'Expired',
      className: 'bg-red-100 text-red-800',
      isExpired: true,
      isExpiringSoon: false,
      daysRemaining,
    };
  }
  if (daysRemaining <= 30) {
    return {
      label: `Expires in ${daysRemaining}d`,
      className: 'bg-amber-100 text-amber-800',
      isExpired: false,
      isExpiringSoon: true,
      daysRemaining,
    };
  }
  return {
    label: 'Valid',
    className: 'bg-emerald-100 text-emerald-800',
    isExpired: false,
    isExpiringSoon: false,
    daysRemaining,
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CarrierInsuranceSection({ carrier }: CarrierInsuranceSectionProps) {
  const hasInsurance = carrier.insuranceCompany || carrier.insurancePolicyNumber || carrier.insuranceExpiryDate;

  if (!hasInsurance) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
          <Shield className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium">No insurance information</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Insurance details have not been added for this carrier. Edit the carrier to add insurance information.
          </p>
        </CardContent>
      </Card>
    );
  }

  const expiryStatus = carrier.insuranceExpiryDate
    ? getExpiryStatus(carrier.insuranceExpiryDate)
    : null;

  return (
    <div className="space-y-4">
      {/* Alert banner for expired/expiring insurance */}
      {expiryStatus?.isExpired && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">
            Insurance expired on {formatDate(carrier.insuranceExpiryDate!)}.
            This carrier should not be assigned to new loads.
          </p>
        </div>
      )}
      {expiryStatus?.isExpiringSoon && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Insurance expires in {expiryStatus.daysRemaining} days ({formatDate(carrier.insuranceExpiryDate!)}).
            Request an updated certificate.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Insurance Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {carrier.insuranceCompany && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Insurance Company</span>
              <span className="text-sm font-medium">{carrier.insuranceCompany}</span>
            </div>
          )}
          {carrier.insurancePolicyNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Policy Number</span>
              <span className="text-sm font-medium font-mono">{carrier.insurancePolicyNumber}</span>
            </div>
          )}
          {carrier.insuranceCargoLimitCents != null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cargo Limit</span>
              <span className="text-sm font-medium">
                {formatCurrency(carrier.insuranceCargoLimitCents)}
              </span>
            </div>
          )}
          {carrier.insuranceExpiryDate && expiryStatus && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expiry Date</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{formatDate(carrier.insuranceExpiryDate)}</span>
                <Badge className={expiryStatus.className}>{expiryStatus.label}</Badge>
              </div>
            </div>
          )}

          {/* Compliance check */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium">Compliance Check</h4>
            <ComplianceRow
              label="Cargo Insurance >= $100,000"
              pass={
                carrier.insuranceCargoLimitCents != null &&
                carrier.insuranceCargoLimitCents >= 10000000
              }
            />
            <ComplianceRow
              label="Insurance not expired"
              pass={expiryStatus ? !expiryStatus.isExpired : false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceRow({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {pass ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
      )}
      <span className={pass ? 'text-foreground' : 'text-red-700'}>{label}</span>
    </div>
  );
}
