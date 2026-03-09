'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalShipments } from '@/lib/hooks/portal/use-portal-shipments';
import { Package, ArrowRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  DISPATCHED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function PortalShipmentsPage() {
  const { data: shipments, isLoading } = usePortalShipments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        <p className="text-sm text-gray-500">Track all your shipments</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !shipments?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No shipments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Link key={shipment.id} href={`/portal/shipments/${shipment.id}`}>
              <Card className="transition-colors hover:border-blue-200">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{shipment.loadNumber}</p>
                        {shipment.referenceNumber && (
                          <span className="text-xs text-gray-400">
                            Ref: {shipment.referenceNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {shipment.origin} &rarr; {shipment.destination}
                      </p>
                      {shipment.pickupDate && (
                        <p className="text-xs text-gray-400">
                          Pickup: {new Date(shipment.pickupDate).toLocaleDateString()}
                          {shipment.deliveryDate &&
                            ` | Delivery: ${new Date(shipment.deliveryDate).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={STATUS_COLORS[shipment.status] ?? 'bg-gray-100 text-gray-800'}>
                      {shipment.status.replace(/_/g, ' ')}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
