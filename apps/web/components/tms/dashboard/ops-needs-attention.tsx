'use client';

import { useNeedsAttention, type NeedsAttentionLoad } from '@/lib/hooks/tms/use-ops-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Phone, Edit, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OpsNeedsAttentionProps {
  maxVisible?: number;
  onViewAll?: () => void;
}

export function OpsNeedsAttention({
  maxVisible = 6,
  onViewAll,
}: OpsNeedsAttentionProps) {
  const { data: loads, isLoading, error, refetch } = useNeedsAttention();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <Skeleton className="mb-4 h-5 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-900">Unable to load needs attention</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const visibleLoads = loads?.slice(0, maxVisible) || [];
  const totalCount = loads?.length || 0;

  const handleViewLoad = (loadId: string) => {
    router.push(`/operations/loads/${loadId}`);
  };

  const getActionButtons = (load: NeedsAttentionLoad) => {
    switch (load.issueType) {
      case 'no_check_call':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewLoad(load.id);
              }}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
            >
              <Eye className="inline size-3 mr-1" />
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewLoad(load.id);
              }}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
            >
              <Phone className="inline size-3 mr-1" />
              Call
            </button>
          </>
        );
      case 'eta_past_due':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewLoad(load.id);
              }}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
            >
              <Eye className="inline size-3 mr-1" />
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewLoad(load.id);
              }}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
            >
              <Edit className="inline size-3 mr-1" />
              Update
            </button>
          </>
        );
      case 'detention':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewLoad(load.id);
              }}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
            >
              <Eye className="inline size-3 mr-1" />
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewLoad(load.id);
              }}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
            >
              <FileText className="inline size-3 mr-1" />
              Log
            </button>
          </>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewLoad(load.id);
            }}
            className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
          >
            <Eye className="inline size-3 mr-1" />
            View
          </button>
        );
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Needs Attention
          {totalCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {totalCount}
            </span>
          )}
        </h3>
        {totalCount > maxVisible && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {visibleLoads.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-text-muted">
          Nothing needs attention right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLoads.map((load) => (
            <div
              key={load.id}
              className={`group cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                load.severity === 'critical'
                  ? 'border-l-4 border-l-red-500 bg-red-50'
                  : 'border-l-4 border-l-amber-500 bg-amber-50'
              }`}
              onClick={() => handleViewLoad(load.id)}
            >
              {/* Load Number */}
              <div className="mb-2">
                <span className="font-mono text-xs font-bold text-text-primary">
                  {load.loadNumber}
                </span>
              </div>

              {/* Route */}
              <div className="mb-3 text-xs text-text-muted">
                {load.origin} → {load.destination}
              </div>

              {/* Issue Badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${
                    load.severity === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {load.issue}
                  {load.timeSinceIssue && (
                    <span className="ml-1">({load.timeSinceIssue})</span>
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {getActionButtons(load)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
