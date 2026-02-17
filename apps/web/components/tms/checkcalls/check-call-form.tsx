'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCheckCall, type CreateCheckCallData } from '@/lib/hooks/tms/use-checkcalls';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckCallFormProps {
  loadId: string;
  onSuccess?: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const CHECK_CALL_TYPES = [
  { value: 'CHECK_CALL', label: 'Check Call' },
  { value: 'ARRIVAL', label: 'Arrival' },
  { value: 'DEPARTURE', label: 'Departure' },
  { value: 'DELAY', label: 'Delay' },
  { value: 'ISSUE', label: 'Issue' },
] as const;

export function CheckCallForm({ loadId, onSuccess }: CheckCallFormProps) {
  const createCheckCall = useCreateCheckCall();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateCheckCallData>>({
    loadId,
    type: 'CHECK_CALL',
    city: '',
    state: '',
    locationDescription: '',
    notes: '',
    gpsSource: 'MANUAL',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.city || !formData.state || !formData.type) {
      setError('Please fill in all required fields (Type, City, State)');
      return;
    }

    try {
      await createCheckCall.mutateAsync({
        loadId,
        type: formData.type as CreateCheckCallData['type'],
        city: formData.city,
        state: formData.state,
        locationDescription: formData.locationDescription,
        notes: formData.notes,
        gpsSource: formData.gpsSource as 'GPS' | 'MANUAL',
      });

      setFormData({
        loadId,
        type: 'CHECK_CALL',
        city: '',
        state: '',
        locationDescription: '',
        notes: '',
        gpsSource: 'MANUAL',
      });

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Check Call</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as CreateCheckCallData['type'] })
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {CHECK_CALL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g., Springfield"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationDescription">Location Description</Label>
          <Input
            id="locationDescription"
            value={formData.locationDescription}
            onChange={(e) =>
              setFormData({ ...formData, locationDescription: e.target.value })
            }
            placeholder="e.g., I-55 south, mile marker 142"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Driver status, ETA updates, issues, weather conditions, etc."
            rows={4}
            maxLength={500}
          />
          {formData.notes && (
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/500 characters
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createCheckCall.isPending}
            className="flex-1"
          >
            {createCheckCall.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Check Call
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                loadId,
                type: 'CHECK_CALL',
                city: '',
                state: '',
                locationDescription: '',
                notes: '',
                gpsSource: 'MANUAL',
              });
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}
