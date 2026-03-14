'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AvailableLoad } from '@/lib/hooks/useCarrierData';
import { carrierClient } from '@/lib/api/carrier-client';
import { X, Loader2 } from 'lucide-react';

interface LoadDetailModalProps {
  load: AvailableLoad;
  onClose: () => void;
  onLoadAccepted?: () => void;
}

type NotificationType = 'success' | 'error' | null;

export function LoadDetailModal({
  load,
  onClose,
  onLoadAccepted,
}: LoadDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  }>({ type: null, message: '' });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: '' });
    }, 4000);
  };

  const handleAcceptLoad = async () => {
    setIsLoading(true);
    try {
      await carrierClient.acceptLoad(load.id);
      showNotification('success', 'Load accepted successfully');
      setTimeout(() => {
        onClose();
        onLoadAccepted?.();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to accept load';
      showNotification('error', errorMessage);
      setIsLoading(false);
    }
  };

  const handleRejectLoad = async () => {
    setIsLoading(true);
    try {
      await carrierClient.rejectLoad(load.id);
      showNotification('success', 'Load rejected successfully');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reject load';
      showNotification('error', errorMessage);
      setIsLoading(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('available')) return 'text-green-600';
    if (statusLower.includes('pending')) return 'text-yellow-600';
    if (statusLower.includes('accepted')) return 'text-blue-600';
    if (statusLower.includes('expired')) return 'text-red-600';
    return 'text-slate-600';
  };

  const canAccept = load.status.toLowerCase() === 'available' && !isLoading;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal box */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg leading-6 font-semibold text-slate-900">
              Load Details
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              aria-label="Close"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Notification */}
            {notification.type && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  notification.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Load ID */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Load ID:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {load.id}
                </span>
              </div>

              {/* Origin */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Origin:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {load.origin}
                </span>
              </div>

              {/* Destination */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Destination:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {load.destination}
                </span>
              </div>

              {/* Rate */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Rate:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatRate(load.rate)}
                </span>
              </div>

              {/* Pickup Date */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Pickup Date:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatDate(load.pickupDate)}
                </span>
              </div>

              {/* Delivery Date */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Delivery Date:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatDate(load.deliveryDate)}
                </span>
              </div>

              {/* Weight */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Weight:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {load.weight.toLocaleString()} lbs
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Status:
                </span>
                <span
                  className={`text-sm font-semibold capitalize ${getStatusColor(load.status)}`}
                >
                  {load.status}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            {canAccept && (
              <Button
                onClick={handleAcceptLoad}
                disabled={isLoading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Accepting...' : 'Accept Load'}
              </Button>
            )}

            {canAccept && (
              <Button
                onClick={handleRejectLoad}
                disabled={isLoading}
                variant="outline"
                className="w-full sm:w-auto mt-2 sm:mt-0"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Rejecting...' : 'Reject Load'}
              </Button>
            )}

            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
