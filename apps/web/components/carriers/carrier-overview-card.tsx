'use client';

import { OperationsCarrier } from '@/types/carriers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Building2,
} from 'lucide-react';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CHECK: 'Check',
  ACH: 'ACH Transfer',
  WIRE: 'Wire Transfer',
  QUICK_PAY: 'Quick Pay',
};

interface CarrierOverviewCardProps {
  carrier: OperationsCarrier;
}

export function CarrierOverviewCard({ carrier }: CarrierOverviewCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Company Name" value={carrier.companyName} />
          <InfoRow label="Type" value={carrier.carrierType === 'OWNER_OPERATOR' ? 'Owner Operator' : 'Company'} />
          {carrier.mcNumber && (
            <InfoRow label="MC Number" value={`MC-${carrier.mcNumber}`} mono />
          )}
          {carrier.dotNumber && (
            <InfoRow label="DOT Number" value={`DOT# ${carrier.dotNumber}`} mono />
          )}
          {carrier.einTaxId && (
            <InfoRow label="EIN / Tax ID" value={`***-**-${carrier.einTaxId.slice(-4)}`} />
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-sm">
              <p>{carrier.address}</p>
              <p>{carrier.city}, {carrier.state} {carrier.zip}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <a href={`tel:${carrier.phone}`} className="text-sm hover:underline">
              {carrier.phone}
            </a>
            {carrier.phoneSecondary && (
              <span className="text-sm text-muted-foreground">
                / {carrier.phoneSecondary}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <a href={`mailto:${carrier.email}`} className="text-sm hover:underline">
              {carrier.email}
            </a>
          </div>
          {carrier.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={carrier.website.startsWith('http') ? carrier.website : `https://${carrier.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                {carrier.website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Payment & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            label="Payment Terms"
            value={`NET ${carrier.paymentTermsDays}`}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment Method</span>
            <Badge variant="outline">
              {PAYMENT_METHOD_LABELS[carrier.preferredPaymentMethod] || carrier.preferredPaymentMethod}
            </Badge>
          </div>
          {carrier.billingEmail && (
            <InfoRow label="Billing Email" value={carrier.billingEmail} />
          )}
          {carrier.factoringCompanyName && (
            <>
              <InfoRow label="Factoring Company" value={carrier.factoringCompanyName} />
              {carrier.factoringPhone && (
                <InfoRow label="Factoring Phone" value={carrier.factoringPhone} />
              )}
              {carrier.factoringEmail && (
                <InfoRow label="Factoring Email" value={carrier.factoringEmail} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {carrier.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{carrier.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
