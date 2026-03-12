'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  useCreateCheckCall,
  type CreateCheckCallData,
} from '@/lib/hooks/tms/use-checkcalls';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckCallFormProps {
  loadId: string;
  onSuccess?: () => void;
}

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

const CHECK_CALL_TYPES = [
  { value: 'CHECK_CALL', label: 'Check Call' },
  { value: 'ARRIVAL', label: 'Arrival' },
  { value: 'DEPARTURE', label: 'Departure' },
  { value: 'DELAY', label: 'Delay' },
  { value: 'ISSUE', label: 'Issue' },
] as const;

const checkCallSchema = z.object({
  type: z.enum(['CHECK_CALL', 'ARRIVAL', 'DEPARTURE', 'DELAY', 'ISSUE']),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required').max(100),
  locationDescription: z.string().max(200).optional(),
  etaToNextStop: z.string().optional(),
  nextCheckCallAt: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type CheckCallFormValues = z.input<typeof checkCallSchema>;

export function CheckCallForm({ loadId, onSuccess }: CheckCallFormProps) {
  const createCheckCall = useCreateCheckCall();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CheckCallFormValues>({
    resolver: zodResolver(checkCallSchema),
    defaultValues: {
      type: 'CHECK_CALL',
      state: '',
      city: '',
      locationDescription: '',
      etaToNextStop: '',
      nextCheckCallAt: '',
      notes: '',
    },
  });

  const onSubmit = async (values: CheckCallFormValues) => {
    setSubmitError(null);
    try {
      await createCheckCall.mutateAsync({
        loadId,
        type: values.type as CreateCheckCallData['type'],
        city: values.city,
        state: values.state,
        locationDescription: values.locationDescription,
        notes: values.notes,
        gpsSource: 'MANUAL',
        ...(values.etaToNextStop
          ? { etaToNextStop: new Date(values.etaToNextStop).toISOString() }
          : {}),
        ...(values.nextCheckCallAt
          ? { nextCheckCallAt: new Date(values.nextCheckCallAt).toISOString() }
          : {}),
      });
      form.reset();
      onSuccess?.();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    }
  };

  const notesValue = form.watch('notes');

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Check Call</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CHECK_CALL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  City <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Springfield" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Description</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., I-55 south, mile marker 142"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="etaToNextStop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ETA to Next Stop</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextCheckCallAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Check Call Reminder</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Driver status, ETA updates, issues, weather conditions, etc."
                    rows={4}
                    maxLength={500}
                  />
                </FormControl>
                {notesValue && (
                  <p className="text-xs text-muted-foreground">
                    {notesValue.length}/500 characters
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

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
              onClick={() => form.reset()}
            >
              Clear
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
