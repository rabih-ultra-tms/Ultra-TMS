'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  EQUIPMENT_TYPE_LABELS,
  formatDimensions,
} from '@/types/load-history';
import type { LoadHistory, EquipmentType } from '@/types/load-history';
import { formatDate } from '@/lib/utils';
import {
  MapPin,
  Package,
  Calendar,
  Truck,
  User,
  FileText,
} from 'lucide-react';

interface LoadOverviewSectionProps {
  load: LoadHistory;
}

export function LoadOverviewSection({ load }: LoadOverviewSectionProps) {
  const equipment = load.equipmentTypeUsed as EquipmentType | null;
  const dimensions = formatDimensions(
    load.cargoLengthIn,
    load.cargoWidthIn,
    load.cargoHeightIn,
  );

  // Access extended detail fields if present
  const detail = load as LoadHistory & {
    carrier?: { id: string; companyName: string | null; mcNumber: string | null; primaryContactName: string | null; primaryContactPhone: string | null } | null;
    driver?: { id: string; firstName: string; lastName: string; phone: string | null } | null;
    truck?: { id: string; unitNumber: string | null; year: number | null; make: string | null; model: string | null; licensePlate: string | null } | null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Route */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Route
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Origin" value={`${load.originCity}, ${load.originState}${load.originZip ? ` ${load.originZip}` : ''}`} />
          <InfoRow label="Destination" value={`${load.destinationCity}, ${load.destinationState}${load.destinationZip ? ` ${load.destinationZip}` : ''}`} />
          {load.totalMiles != null && (
            <InfoRow label="Total Miles" value={load.totalMiles.toLocaleString()} />
          )}
        </CardContent>
      </Card>

      {/* Cargo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Cargo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {load.cargoDescription && (
            <InfoRow label="Description" value={load.cargoDescription} />
          )}
          {load.cargoPieces != null && (
            <InfoRow label="Pieces" value={String(load.cargoPieces)} />
          )}
          {load.cargoWeightLbs != null && (
            <InfoRow label="Weight" value={`${load.cargoWeightLbs.toLocaleString()} lbs`} />
          )}
          {dimensions && (
            <InfoRow label="Dimensions" value={dimensions} />
          )}
          {equipment && (
            <InfoRow label="Equipment" value={EQUIPMENT_TYPE_LABELS[equipment]} />
          )}
          {(load.isOversize || load.isOverweight) && (
            <div className="flex gap-2">
              {load.isOversize && (
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                  Oversize
                </Badge>
              )}
              {load.isOverweight && (
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                  Overweight
                </Badge>
              )}
            </div>
          )}
          {!load.cargoDescription && !load.cargoPieces && !load.cargoWeightLbs && !dimensions && !equipment && (
            <p className="text-sm text-muted-foreground">No cargo information recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {load.quoteDate && <InfoRow label="Quote Date" value={formatDate(load.quoteDate)} />}
          {load.bookedDate && <InfoRow label="Booked" value={formatDate(load.bookedDate)} />}
          {load.pickupDate && <InfoRow label="Pickup" value={formatDate(load.pickupDate)} />}
          {load.deliveryDate && <InfoRow label="Delivery" value={formatDate(load.deliveryDate)} />}
          {load.invoiceDate && <InfoRow label="Invoiced" value={formatDate(load.invoiceDate)} />}
          {load.paidDate && <InfoRow label="Paid" value={formatDate(load.paidDate)} />}
          {!load.quoteDate && !load.bookedDate && !load.pickupDate && !load.deliveryDate && (
            <p className="text-sm text-muted-foreground">No dates recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {load.customerName && <InfoRow label="Name" value={load.customerName} />}
          {load.customerCompany && <InfoRow label="Company" value={load.customerCompany} />}
          {load.quoteNumber && <InfoRow label="Quote #" value={load.quoteNumber} mono />}
          {!load.customerName && !load.customerCompany && (
            <p className="text-sm text-muted-foreground">No customer information recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Carrier / Driver / Truck (if present from LoadHistoryDetail) */}
      {(detail.carrier || detail.driver || detail.truck) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" />
              Carrier & Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.carrier && (
              <>
                {detail.carrier.companyName && (
                  <InfoRow label="Carrier" value={detail.carrier.companyName} />
                )}
                {detail.carrier.mcNumber && (
                  <InfoRow label="MC Number" value={`MC-${detail.carrier.mcNumber}`} mono />
                )}
                {detail.carrier.primaryContactName && (
                  <InfoRow label="Contact" value={detail.carrier.primaryContactName} />
                )}
                {detail.carrier.primaryContactPhone && (
                  <InfoRow label="Phone" value={detail.carrier.primaryContactPhone} />
                )}
              </>
            )}
            {detail.driver && (
              <InfoRow
                label="Driver"
                value={`${detail.driver.firstName} ${detail.driver.lastName}${detail.driver.phone ? ` (${detail.driver.phone})` : ''}`}
              />
            )}
            {detail.truck && (
              <InfoRow
                label="Truck"
                value={[
                  detail.truck.unitNumber && `#${detail.truck.unitNumber}`,
                  [detail.truck.year, detail.truck.make, detail.truck.model].filter(Boolean).join(' '),
                  detail.truck.licensePlate,
                ].filter(Boolean).join(' - ')}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {load.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{load.notes}</p>
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
