'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Stop, StopStatus, StopType } from '@/lib/hooks/tms/use-stops';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useMemo } from 'react';

interface StopCardProps {
  stop: Stop;
  isLast?: boolean;
}

function getStopTypeBadgeColor(type: StopType) {
  switch (type) {
    case 'PICKUP':
      return 'bg-blue-100 text-blue-800';
    case 'DELIVERY':
      return 'bg-green-100 text-green-800';
    case 'STOP':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getStopStatusBadgeColor(status: StopStatus) {
  switch (status) {
    case 'PENDING':
      return 'bg-gray-100 text-gray-700';
    case 'EN_ROUTE':
      return 'bg-blue-100 text-blue-800';
    case 'ARRIVED':
      return 'bg-amber-100 text-amber-800';
    case 'LOADING':
    case 'UNLOADING':
      return 'bg-indigo-100 text-indigo-800';
    case 'LOADED':
    case 'UNLOADED':
      return 'bg-cyan-100 text-cyan-800';
    case 'DEPARTED':
      return 'bg-emerald-100 text-emerald-800';
    case 'SKIPPED':
      return 'bg-slate-100 text-slate-500';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getLeftBorderColor(status: StopStatus) {
  if (status === 'DEPARTED') {
    return 'border-l-emerald-500';
  }
  if (['ARRIVED', 'LOADING', 'LOADED', 'UNLOADING', 'UNLOADED'].includes(status)) {
    return 'border-l-blue-500';
  }
  return 'border-l-gray-300';
}

function calculateDwellTime(arrivedAt?: string, departedAt?: string): string | null {
  if (!arrivedAt) return null;

  const arrivalTime = new Date(arrivedAt);
  const departureTime = departedAt ? new Date(departedAt) : new Date();
  const diffMs = departureTime.getTime() - arrivalTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function calculateDetention(
  arrivedAt?: string,
  departedAt?: string,
  freeTimeMinutes: number = 120,
  detentionRate: number = 75
): { hasDetention: boolean; detentionTime: string; detentionCharge: number } | null {
  if (!arrivedAt) return null;

  const arrivalTime = new Date(arrivedAt);
  const departureTime = departedAt ? new Date(departedAt) : new Date();
  const dwellMinutes = Math.floor((departureTime.getTime() - arrivalTime.getTime()) / 60000);

  const billableMinutes = Math.max(0, dwellMinutes - freeTimeMinutes);
  const cappedHours = Math.min(billableMinutes / 60, 8);

  if (cappedHours <= 0) {
    return { hasDetention: false, detentionTime: '0h', detentionCharge: 0 };
  }

  const detentionCharge = cappedHours * detentionRate;
  const hours = Math.floor(cappedHours);
  const minutes = Math.round((cappedHours - hours) * 60);

  return {
    hasDetention: true,
    detentionTime: `${hours}h ${minutes}m`,
    detentionCharge,
  };
}

function calculateArrivalVariance(
  arrivedAt?: string,
  appointmentTimeFrom?: string
): { variance: string; color: string } | null {
  if (!arrivedAt || !appointmentTimeFrom) return null;

  const arrival = new Date(arrivedAt);
  const scheduled = new Date(appointmentTimeFrom);
  const diffMs = arrival.getTime() - scheduled.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (Math.abs(diffMins) <= 5) {
    return { variance: 'On time', color: 'text-green-600' };
  }

  if (diffMins > 0) {
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    return { variance: `+${timeStr} late`, color: 'text-orange-600' };
  }

  const absDiffMins = Math.abs(diffMins);
  const hours = Math.floor(absDiffMins / 60);
  const minutes = absDiffMins % 60;
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { variance: `-${timeStr} early`, color: 'text-green-600' };
}

function formatTime(dateString?: string): string {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(dateString?: string): string {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function StopCard({ stop, isLast = false }: StopCardProps) {
  const dwellTime = useMemo(
    () => calculateDwellTime(stop.arrivedAt, stop.departedAt),
    [stop.arrivedAt, stop.departedAt]
  );

  const detention = useMemo(
    () =>
      calculateDetention(
        stop.arrivedAt,
        stop.departedAt,
        stop.freeTimeMinutes,
        stop.detentionRate
      ),
    [stop.arrivedAt, stop.departedAt, stop.freeTimeMinutes, stop.detentionRate]
  );

  const arrivalVariance = useMemo(
    () => calculateArrivalVariance(stop.arrivedAt, stop.appointmentTimeFrom),
    [stop.arrivedAt, stop.appointmentTimeFrom]
  );

  const isCompleted = stop.status === 'DEPARTED';
  const isActive = ['ARRIVED', 'LOADING', 'LOADED', 'UNLOADING', 'UNLOADED'].includes(
    stop.status
  );

  return (
    <div className="relative">
      <Card
        className={cn(
          'border-l-4 transition-colors',
          getLeftBorderColor(stop.status)
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Sequence Number Circle */}
              <div className="flex items-center justify-center">
                {isCompleted ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-semibold">
                    {stop.sequenceNumber}
                  </div>
                ) : isActive ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-50 text-blue-700 font-semibold animate-pulse">
                    {stop.sequenceNumber}
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-600 font-semibold">
                    {stop.sequenceNumber}
                  </div>
                )}
              </div>

              {/* Stop Type Badge */}
              <Badge className={cn('font-medium', getStopTypeBadgeColor(stop.stopType))}>
                {stop.stopType}
              </Badge>
            </div>

            {/* Status Badge */}
            <Badge className={cn('font-medium', getStopStatusBadgeColor(stop.status))}>
              {stop.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Facility Info */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{stop.facilityName}</h3>
            <div className="mt-1 flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {stop.address}, {stop.city}, {stop.state} {stop.zipCode}
              </span>
            </div>
            {stop.contactName && stop.contactPhone && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href={`tel:${stop.contactPhone}`} className="hover:text-blue-600">
                  {stop.contactName} ({stop.contactPhone})
                </a>
              </div>
            )}
          </div>

          {/* Appointment Window */}
          {stop.appointmentDate && (
            <div className="rounded-md bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">Appointment:</span>
                <span className="text-gray-900">
                  {formatDate(stop.appointmentDate)},{' '}
                  {formatTime(stop.appointmentTimeFrom)} -{' '}
                  {formatTime(stop.appointmentTimeTo)}
                </span>
              </div>
            </div>
          )}

          {/* Timing Section */}
          {(stop.arrivedAt || stop.departedAt) && (
            <>
              <Separator />
              <div className="space-y-2">
                {stop.arrivedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Arrived:</span>
                      <span className="font-medium text-gray-900">
                        {formatTime(stop.arrivedAt)}
                      </span>
                    </div>
                    {arrivalVariance && (
                      <span className={cn('text-sm font-medium', arrivalVariance.color)}>
                        {arrivalVariance.variance}
                      </span>
                    )}
                  </div>
                )}

                {stop.departedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Departed:</span>
                    <span className="font-medium text-gray-900">
                      {formatTime(stop.departedAt)}
                    </span>
                  </div>
                )}

                {dwellTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Dwell:</span>
                    <span className="font-medium text-gray-900">{dwellTime}</span>
                  </div>
                )}

                {detention && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle
                      className={cn(
                        'h-4 w-4',
                        detention.hasDetention ? 'text-red-500' : 'text-gray-500'
                      )}
                    />
                    <span className="text-gray-600">Detention:</span>
                    {detention.hasDetention ? (
                      <span className="font-medium text-red-600">
                        {detention.detentionTime} ($
                        {detention.detentionCharge.toFixed(2)})
                      </span>
                    ) : (
                      <span className="font-medium text-green-600">
                        None (within free time)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Cargo Info */}
          {(stop.weight || stop.pieces || stop.pallets) && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Cargo:</span>
                <div className="flex gap-3 text-gray-900">
                  {stop.weight && <span>{stop.weight.toLocaleString()} lbs</span>}
                  {stop.pieces && <span>{stop.pieces} pcs</span>}
                  {stop.pallets && <span>{stop.pallets} pallets</span>}
                </div>
              </div>
            </>
          )}

          {/* Reference Numbers */}
          {(stop.referenceNumber || stop.bolNumber) && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                {stop.referenceNumber && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Ref:</span>
                    <code className="font-mono text-gray-900">{stop.referenceNumber}</code>
                  </div>
                )}
                {stop.bolNumber && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">BOL:</span>
                    <code className="font-mono text-gray-900">{stop.bolNumber}</code>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Special Instructions */}
          {stop.instructions && (
            <>
              <Separator />
              <div className="rounded-md bg-yellow-50 p-3 border border-yellow-100">
                <p className="text-sm italic text-gray-800">{stop.instructions}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Connecting Line */}
      {!isLast && (
        <div className="flex justify-center py-4">
          <div className="h-12 w-0.5 border-l-2 border-dashed border-gray-300" />
        </div>
      )}
    </div>
  );
}
