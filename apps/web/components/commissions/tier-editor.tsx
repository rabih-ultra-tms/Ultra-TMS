'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { PlanTier } from '@/lib/hooks/commissions/use-plans';

interface TierEditorProps {
  tiers: PlanTier[];
  onChange: (tiers: PlanTier[]) => void;
  rateLabel?: string;
  rateSuffix?: string;
  disabled?: boolean;
}

const DEFAULT_TIER: PlanTier = { minMargin: 0, maxMargin: null, rate: 0 };

export function TierEditor({
  tiers,
  onChange,
  rateLabel = 'Rate',
  rateSuffix = '%',
  disabled = false,
}: TierEditorProps) {
  const handleAdd = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (lastTier.maxMargin ?? lastTier.minMargin + 10) : 0;
    onChange([
      ...tiers,
      { ...DEFAULT_TIER, minMargin: newMin },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof PlanTier,
    value: string
  ) => {
    const updated = tiers.map((tier, i) => {
      if (i !== index) return tier;
      if (field === 'maxMargin' && value === '') {
        return { ...tier, maxMargin: null };
      }
      return { ...tier, [field]: parseFloat(value) || 0 };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Commission Tiers</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
        >
          <Plus className="mr-1 size-3.5" />
          Add Tier
        </Button>
      </div>

      {tiers.length === 0 && (
        <p className="text-sm text-text-muted py-4 text-center">
          No tiers configured. Click &quot;Add Tier&quot; to get started.
        </p>
      )}

      {tiers.length > 0 && (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 text-xs font-medium text-text-muted px-1">
            <span>Min Margin %</span>
            <span>Max Margin %</span>
            <span>{rateLabel} {rateSuffix}</span>
            <span />
          </div>

          {/* Rows */}
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 items-center"
            >
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={tier.minMargin}
                onChange={(e) => handleChange(index, 'minMargin', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={tier.maxMargin ?? ''}
                onChange={(e) => handleChange(index, 'maxMargin', e.target.value)}
                disabled={disabled}
                placeholder="No limit"
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={tier.rate}
                onChange={(e) => handleChange(index, 'rate', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
