'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePortalShipment,
  usePortalShipmentTracking,
} from '@/lib/hooks/portal/use-portal-shipments';
import { usePortalShipmentDocuments } from '@/lib/hooks/portal/use-portal-documents';
import { ArrowLeft, MapPin, FileText, Download } from 'lucide-react';

export default function PortalShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: shipment, isLoading } = usePortalShipment(id);
  const { data: tracking, isLoading: trackingLoading } = usePortalShipmentTracking(id);
  const { data: documents } = usePortalShipmentDocuments(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Shipment not found</p>
        <Link href="/portal/shipments">
          <Button variant="link" className="mt-2">
            Back to shipments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/portal/shipments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{shipment.loadNumber}</h1>
          <p className="text-sm text-gray-500">
            {shipment.origin} &rarr; {shipment.destination}
          </p>
        </div>
        <Badge className="ml-auto">{shipment.status.replace(/_/g, ' ')}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shipment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Load #" value={shipment.loadNumber} />
            {shipment.referenceNumber && (
              <DetailRow label="Reference" value={shipment.referenceNumber} />
            )}
            <DetailRow label="Origin" value={shipment.origin} />
            <DetailRow label="Destination" value={shipment.destination} />
            {shipment.commodity && <DetailRow label="Commodity" value={shipment.commodity} />}
            {shipment.weight && <DetailRow label="Weight" value={`${shipment.weight} lbs`} />}
            {shipment.pickupDate && (
              <DetailRow
                label="Pickup"
                value={new Date(shipment.pickupDate).toLocaleDateString()}
              />
            )}
            {shipment.deliveryDate && (
              <DetailRow
                label="Delivery"
                value={new Date(shipment.deliveryDate).toLocaleDateString()}
              />
            )}
            {shipment.eta && (
              <DetailRow label="ETA" value={new Date(shipment.eta).toLocaleString()} />
            )}
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {trackingLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : !tracking?.length ? (
              <p className="py-4 text-center text-sm text-gray-500">No tracking events yet</p>
            ) : (
              <div className="relative space-y-4 pl-6">
                <div className="absolute left-2 top-2 h-[calc(100%-16px)] w-0.5 bg-gray-200" />
                {tracking.map((event, i) => (
                  <div key={event.id} className="relative">
                    <div
                      className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 ${
                        i === 0
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {event.city && event.state && (
                          <>
                            <MapPin className="h-3 w-3" />
                            <span>
                              {event.city}, {event.state}
                            </span>
                          </>
                        )}
                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      {documents && documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
