'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadDetailModal } from './LoadDetailModal';
import { useAvailableLoads, AvailableLoad } from '@/lib/hooks/useCarrierData';
import { Package, Loader2 } from 'lucide-react';

interface AvailableLoadsListProps {
  onLoadAccepted?: () => void;
}

type LoadStatus = 'available' | 'pending' | 'expired' | '';

export function AvailableLoadsList({
  onLoadAccepted,
}: AvailableLoadsListProps) {
  const [statusFilter, setStatusFilter] = useState<LoadStatus>('');
  const [selectedLoad, setSelectedLoad] = useState<AvailableLoad | null>(null);

  const { data: loads, isLoading, error } = useAvailableLoads();

  const filteredLoads = React.useMemo(() => {
    if (!loads) return [];
    if (!statusFilter) return loads;
    return loads.filter(
      (load) => load.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }, [loads, statusFilter]);

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
    accepted: 'bg-blue-100 text-blue-800',
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('available')) return statusColors['available'];
    if (statusLower.includes('pending')) return statusColors['pending'];
    if (statusLower.includes('accepted')) return statusColors['accepted'];
    if (statusLower.includes('expired')) return statusColors['expired'];
    return statusColors['available'];
  };

  const filterOptions = [
    { label: 'All', value: '' },
    { label: 'Available', value: 'available' },
    { label: 'Pending', value: 'pending' },
    { label: 'Expired', value: 'expired' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRate = (rate: number) => {
    return `$${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-slate-600">Loading available loads...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">
              Failed to load available loads
            </p>
            <p className="text-sm text-slate-500">
              {error instanceof Error
                ? error.message
                : 'An unknown error occurred'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Available Loads
            </h3>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filterOptions.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value as LoadStatus)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    statusFilter === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredLoads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-sm text-slate-500">
                {loads && loads.length === 0
                  ? 'No loads available at this time'
                  : 'No loads match the selected filter'}
              </p>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Origin
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Destination
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Rate
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Pickup Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoads.map((load) => (
                    <tr
                      key={load.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {load.origin}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {load.destination}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-bold">
                        {formatRate(load.rate)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(load.pickupDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(load.status)}`}
                        >
                          {load.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLoad(load)}
                          className="hover:bg-blue-50"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Load Detail Modal */}
      {selectedLoad && (
        <LoadDetailModal
          load={selectedLoad}
          onClose={() => setSelectedLoad(null)}
          onLoadAccepted={() => {
            setSelectedLoad(null);
            onLoadAccepted?.();
          }}
        />
      )}
    </>
  );
}
