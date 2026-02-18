'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Loader2 } from 'lucide-react';
import {
  useCsaScores,
  type CsaScore,
  type CSABasicType,
} from '@/lib/hooks/carriers/use-fmcsa';

const BASIC_LABELS: Record<CSABasicType, string> = {
  UNSAFE_DRIVING: 'Unsafe Driving',
  HOS_COMPLIANCE: 'HOS Compliance',
  DRIVER_FITNESS: 'Driver Fitness',
  CONTROLLED_SUBSTANCES: 'Controlled Substances',
  VEHICLE_MAINTENANCE: 'Vehicle Maintenance',
  HAZMAT_COMPLIANCE: 'Hazmat Compliance',
  CRASH_INDICATOR: 'Crash Indicator',
};

const BASIC_THRESHOLDS: Record<CSABasicType, number> = {
  UNSAFE_DRIVING: 65,
  HOS_COMPLIANCE: 65,
  DRIVER_FITNESS: 80,
  CONTROLLED_SUBSTANCES: 80,
  VEHICLE_MAINTENANCE: 80,
  HAZMAT_COMPLIANCE: 80,
  CRASH_INDICATOR: 65,
};

function getPercentileColor(percentile: number | null, threshold: number): string {
  if (percentile == null) return 'bg-muted';
  if (percentile >= threshold) return 'bg-red-500';
  if (percentile >= threshold * 0.75) return 'bg-amber-500';
  return 'bg-green-500';
}

function getPercentileTextColor(percentile: number | null, threshold: number): string {
  if (percentile == null) return 'text-muted-foreground';
  if (percentile >= threshold) return 'text-red-600';
  if (percentile >= threshold * 0.75) return 'text-amber-600';
  return 'text-green-600';
}

interface CsaScoresDisplayProps {
  carrierId: string;
}

export function CsaScoresDisplay({ carrierId }: CsaScoresDisplayProps) {
  const { data: scores, isLoading, error } = useCsaScores(carrierId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Unable to load CSA scores. Data may not be available for this carrier.
        </CardContent>
      </Card>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            CSA BASIC Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No CSA score data available. Run an FMCSA verification to populate scores.
        </CardContent>
      </Card>
    );
  }

  const scoreMap = new Map(scores.map((s) => [s.basicType, s]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4" />
          CSA BASIC Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(Object.keys(BASIC_LABELS) as CSABasicType[]).map((type) => {
            const score = scoreMap.get(type);
            const threshold = BASIC_THRESHOLDS[type];
            return (
              <BasicScoreRow
                key={type}
                label={BASIC_LABELS[type]}
                score={score ?? null}
                threshold={threshold}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BasicScoreRow({
  label,
  score,
  threshold,
}: {
  label: string;
  score: CsaScore | null;
  threshold: number;
}) {
  const percentile = score?.percentile ?? null;
  const barColor = getPercentileColor(percentile, threshold);
  const textColor = getPercentileTextColor(percentile, threshold);
  const barWidth = percentile != null ? `${percentile}%` : '0%';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {score?.isAlert && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Alert
            </Badge>
          )}
        </div>
        <span className={`font-mono text-sm font-semibold ${textColor}`}>
          {percentile != null ? `${percentile}%` : '—'}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${barColor}`}
          style={{ width: barWidth }}
        />
        {/* Threshold marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/40"
          style={{ left: `${threshold}%` }}
        />
      </div>
      {score && (
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{score.inspectionCount} inspections</span>
          <span>{score.violationCount} violations</span>
          {score.oosViolationCount > 0 && (
            <span className="text-red-500">{score.oosViolationCount} OOS</span>
          )}
        </div>
      )}
    </div>
  );
}
