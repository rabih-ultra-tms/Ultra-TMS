'use client';

import { OperationsCarrier } from '@/types/carriers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Building2, CreditCard } from 'lucide-react';

interface CarrierContactsTabProps {
  carrier: OperationsCarrier;
}

export function CarrierContactsTab({ carrier }: CarrierContactsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Primary Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ContactRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={carrier.phone}
            href={`tel:${carrier.phone}`}
          />
          {carrier.phoneSecondary && (
            <ContactRow
              icon={<Phone className="h-4 w-4" />}
              label="Secondary Phone"
              value={carrier.phoneSecondary}
              href={`tel:${carrier.phoneSecondary}`}
            />
          )}
          <ContactRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={carrier.email}
            href={`mailto:${carrier.email}`}
          />
          {carrier.website && (
            <ContactRow
              icon={<Building2 className="h-4 w-4" />}
              label="Website"
              value={carrier.website}
              href={carrier.website.startsWith('http') ? carrier.website : `https://${carrier.website}`}
              external
            />
          )}
          <ContactRow
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value={`${carrier.address}, ${carrier.city}, ${carrier.state} ${carrier.zip}`}
          />
        </CardContent>
      </Card>

      {/* Billing Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Billing Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ContactRow
            icon={<Mail className="h-4 w-4" />}
            label="Billing Email"
            value={carrier.billingEmail}
            href={`mailto:${carrier.billingEmail}`}
          />
          {carrier.factoringCompanyName && (
            <>
              <ContactRow
                icon={<Building2 className="h-4 w-4" />}
                label="Factoring Company"
                value={carrier.factoringCompanyName}
              />
              {carrier.factoringPhone && (
                <ContactRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Factoring Phone"
                  value={carrier.factoringPhone}
                  href={`tel:${carrier.factoringPhone}`}
                />
              )}
              {carrier.factoringEmail && (
                <ContactRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Factoring Email"
                  value={carrier.factoringEmail}
                  href={`mailto:${carrier.factoringEmail}`}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-sm hover:underline break-all"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {value}
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}
