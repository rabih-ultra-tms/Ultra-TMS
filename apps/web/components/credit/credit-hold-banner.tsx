'use client';

import { useState } from 'react';
import { useCreditHolds, useReleaseCreditHold } from '@/lib/hooks/credit';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateShort } from '@/lib/utils/format';

interface CreditHoldBannerProps {
  companyId: string;
}

export function CreditHoldBanner({ companyId }: CreditHoldBannerProps) {
  const {
    data: holds,
    isLoading,
    error,
  } = useCreditHolds({
    companyId,
  });

  const { mutateAsync: releaseHold, isPending: isReleasing } =
    useReleaseCreditHold();
  const [dismissedHolds, setDismissedHolds] = useState<Set<string>>(new Set());

  const activeHolds =
    holds?.data?.filter((h) => !dismissedHolds.has(h.id)) || [];

  if (isLoading) {
    return (
      <div data-testid="credit-hold-skeleton" className="space-y-2">
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error || activeHolds.length === 0) {
    return null;
  }

  const handleDismiss = (holdId: string) => {
    setDismissedHolds((prev) => new Set([...prev, holdId]));
  };

  const handleRelease = async (holdId: string) => {
    try {
      await releaseHold({
        holdId,
      });
      handleDismiss(holdId);
    } catch (err) {
      console.error('Failed to release hold:', err);
    }
  };

  const getHoldReasonLabel = (reason: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      FRAUD: {
        label: '🚨 Fraud Alert',
        color: 'border-red-600 bg-red-50 text-red-900',
      },
      PAYMENT: {
        label: '💳 Payment Issue',
        color: 'border-orange-600 bg-orange-50 text-orange-900',
      },
      COMPLIANCE: {
        label: '⚖️ Compliance Hold',
        color: 'border-yellow-600 bg-yellow-50 text-yellow-900',
      },
    };
    return (
      labels[reason] || {
        label: reason,
        color: 'border-gray-600 bg-gray-50 text-gray-900',
      }
    );
  };

  return (
    <div className="space-y-2">
      {activeHolds.map((hold) => {
        const reasonInfo = getHoldReasonLabel(hold.reason || 'UNKNOWN');
        return (
          <div
            key={hold.id}
            className={`border-l-4 p-4 rounded-md flex items-start justify-between gap-4 ${reasonInfo.color}`}
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold">{reasonInfo.label}</h3>
                <p className="text-sm mt-1">
                  Placed on{' '}
                  {formatDateShort(new Date(hold.placedDate || Date.now()))}
                </p>
                {hold.notes && (
                  <p className="text-sm mt-1 opacity-75">{hold.notes}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRelease(hold.id)}
                disabled={isReleasing}
                className="whitespace-nowrap"
              >
                {isReleasing ? 'Releasing...' : 'Release'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(hold.id)}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
