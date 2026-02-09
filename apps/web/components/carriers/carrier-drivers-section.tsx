'use client';

import { OperationsCarrierDriver } from '@/types/carriers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Phone, Mail } from 'lucide-react';

const DRIVER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  INACTIVE: 'bg-gray-100 text-gray-700',
  ON_LEAVE: 'bg-amber-100 text-amber-800',
};

const DRIVER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

interface CarrierDriversSectionProps {
  carrierId: string;
  drivers: OperationsCarrierDriver[];
}

export function CarrierDriversSection({ drivers }: CarrierDriversSectionProps) {
  if (!drivers || drivers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
          <Users className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium">No drivers added</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Add drivers for this carrier to manage CDL information, medical cards, and assignments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Drivers ({drivers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>CDL</TableHead>
                <TableHead>CDL Expiry</TableHead>
                <TableHead>Medical Card</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">
                        {driver.firstName} {driver.lastName}
                      </span>
                      {driver.isOwner && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Owner
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={`tel:${driver.phone}`} className="text-sm hover:underline">
                      {driver.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {driver.cdlNumber} ({driver.cdlState})
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={isExpired(driver.cdlExpiry) ? 'text-red-600 font-medium' : ''}>
                      {formatDate(driver.cdlExpiry)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={isExpired(driver.medicalCardExpiry) ? 'text-red-600 font-medium' : ''}>
                      {formatDate(driver.medicalCardExpiry)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={DRIVER_STATUS_COLORS[driver.status] || 'bg-gray-100 text-gray-800'}>
                      {DRIVER_STATUS_LABELS[driver.status] || driver.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {drivers.map((driver) => (
            <div key={driver.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {driver.firstName} {driver.lastName}
                  </span>
                  {driver.isOwner && (
                    <Badge variant="outline" className="text-xs">Owner</Badge>
                  )}
                </div>
                <Badge className={DRIVER_STATUS_COLORS[driver.status] || 'bg-gray-100 text-gray-800'}>
                  {DRIVER_STATUS_LABELS[driver.status] || driver.status}
                </Badge>
              </div>

              <div className="grid gap-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <a href={`tel:${driver.phone}`} className="hover:underline">
                    {driver.phone}
                  </a>
                </div>
                {driver.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${driver.email}`} className="hover:underline">
                      {driver.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                <span>
                  CDL: <span className="font-mono">{driver.cdlNumber}</span> ({driver.cdlState})
                </span>
                <span className={isExpired(driver.cdlExpiry) ? 'text-red-600' : ''}>
                  Exp: {formatDate(driver.cdlExpiry)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
