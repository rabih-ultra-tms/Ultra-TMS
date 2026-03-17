import { formatCurrency } from '@/lib/utils/format';

interface CreditUtilizationBarProps {
  used: number;
  limit: number;
  threshold?: number;
}

export function CreditUtilizationBar({
  used,
  limit,
  threshold,
}: CreditUtilizationBarProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  const displayPercentage = (used / limit) * 100;

  // Determine color based on utilization
  let barColor = 'bg-green-500';
  if (displayPercentage > 100) {
    barColor = 'bg-red-600';
  } else if (displayPercentage >= 90) {
    barColor = 'bg-orange-500';
  } else if (displayPercentage >= 70) {
    barColor = 'bg-yellow-500';
  }

  const thresholdPercent = threshold
    ? Math.round((threshold / limit) * 100)
    : null;

  return (
    <div data-testid="utilization-bar-container" className="space-y-2">
      <div className="relative h-8 w-full rounded-full bg-gray-200 overflow-hidden">
        {/* Fill bar */}
        <div
          data-testid="utilization-bar-fill"
          className={`h-full ${barColor} transition-all duration-300 flex items-center justify-end pr-3`}
          style={{ width: `${Math.min(displayPercentage, 100)}%` }}
        >
          {displayPercentage >= 15 && (
            <span className="text-xs font-semibold text-white">
              {percentage}%
            </span>
          )}
        </div>

        {/* Threshold marker */}
        {thresholdPercent && thresholdPercent < 100 && (
          <div
            className="absolute top-0 h-full w-1 bg-red-600 opacity-75"
            style={{ left: `${thresholdPercent}%` }}
            title={`Threshold: ${threshold}`}
          />
        )}

        {/* Percentage text on right if bar is small */}
        {displayPercentage < 15 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              {percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Info text */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          {percentage}% of {formatCurrency(limit)}
        </span>
        {threshold && (
          <span className="text-gray-500">
            Threshold: {formatCurrency(threshold)} ({thresholdPercent}%)
          </span>
        )}
      </div>

      {/* Amount used */}
      <div className="text-xs text-gray-600">
        Used:{' '}
        <span className="font-semibold text-gray-900">
          {formatCurrency(used)}
        </span>
        {used > limit && (
          <span className="ml-2 text-red-600">
            (Exceeded by {formatCurrency(used - limit)})
          </span>
        )}
      </div>
    </div>
  );
}
