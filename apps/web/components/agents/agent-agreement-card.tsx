'use client';

import { useState } from 'react';
import { useUpdateAgreement } from '@/lib/hooks/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AgentAgreement } from '@/lib/hooks/agents';

interface AgentAgreementCardProps {
  agreement: AgentAgreement;
  editable?: boolean;
}

export function AgentAgreementCard({
  agreement,
  editable = false,
}: AgentAgreementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    splitRate: agreement.splitRate ?? 0,
    minimumPayout: agreement.minimumPayout ?? 0,
    minimumPerLoad: agreement.minimumPerLoad ?? 0,
  });

  const { mutate: updateAgreement, isPending } = useUpdateAgreement();

  const handleSave = () => {
    updateAgreement(
      {
        agreementId: agreement.id,
        agentId: agreement.agentId,
        splitRate: formData.splitRate,
        minimumPayout: formData.minimumPayout,
        minimumPerLoad: formData.minimumPerLoad,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="split-rate">Split Rate (%)</Label>
            <Input
              id="split-rate"
              type="number"
              value={formData.splitRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  splitRate: parseFloat(e.target.value),
                })
              }
              min="0"
              max="100"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="minimum-payout">Minimum Payout ($)</Label>
            <Input
              id="minimum-payout"
              type="number"
              value={formData.minimumPayout}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumPayout: parseFloat(e.target.value),
                })
              }
              min="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="minimum-per-load">Minimum Per Load ($)</Label>
            <Input
              id="minimum-per-load"
              type="number"
              value={formData.minimumPerLoad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumPerLoad: parseFloat(e.target.value),
                })
              }
              min="0"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">
            {agreement.agreementNumber}
          </CardTitle>
          <p className="text-xs text-text-muted mt-1">{agreement.splitType}</p>
        </div>
        <div className="flex gap-2">
          <Badge>{agreement.status}</Badge>
          {editable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-text-secondary">
              Effective Date
            </p>
            <p className="text-sm text-text-primary">
              {formatDate(agreement.effectiveDate)}
            </p>
          </div>
          {agreement.expirationDate && (
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Expiration Date
              </p>
              <p className="text-sm text-text-primary">
                {formatDate(agreement.expirationDate)}
              </p>
            </div>
          )}
          {agreement.splitRate && (
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Split Rate
              </p>
              <p className="text-sm text-text-primary">
                {agreement.splitRate}%
              </p>
            </div>
          )}
          {agreement.minimumPayout && (
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Minimum Payout
              </p>
              <p className="text-sm text-text-primary">
                ${agreement.minimumPayout.toLocaleString()}
              </p>
            </div>
          )}
          {agreement.minimumPerLoad && (
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Minimum Per Load
              </p>
              <p className="text-sm text-text-primary">
                ${agreement.minimumPerLoad.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
