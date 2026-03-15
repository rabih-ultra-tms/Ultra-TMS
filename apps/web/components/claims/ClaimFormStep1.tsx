'use client';

import { useState } from 'react';
import { useClaimFormStore } from '@/lib/stores/claim-form-store';
import { useCarriers } from '@/lib/hooks/operations';
import { ClaimType } from '@/lib/api/claims/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CLAIM_TYPE_OPTIONS = [
  { value: ClaimType.CARGO_DAMAGE, label: 'Cargo Damage' },
  { value: ClaimType.CARGO_LOSS, label: 'Cargo Loss' },
  { value: ClaimType.SHORTAGE, label: 'Shortage' },
  { value: ClaimType.LATE_DELIVERY, label: 'Late Delivery' },
  { value: ClaimType.OVERCHARGE, label: 'Overcharge' },
  { value: ClaimType.OTHER, label: 'Other' },
];

export function ClaimFormStep1() {
  const formState = useClaimFormStore();
  const { data: carriersData, isLoading: carrierLoading } = useCarriers({
    page: 1,
    limit: 1000,
  });
  const [carrierSearch, setCarrierSearch] = useState('');
  const [carrierOpen, setCarrierOpen] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  // Filter carriers based on search
  const filteredCarriers = (carriersData?.data || []).filter((carrier) =>
    carrier.companyName?.toLowerCase().includes(carrierSearch.toLowerCase())
  );

  const selectedCarrier = (carriersData?.data || []).find(
    (c) => c.id === formState.carrierId
  );

  return (
    <div className="space-y-6">
      {/* Claim Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Claim Type <span className="text-red-500">*</span>
        </label>
        <Select
          value={formState.claimType}
          onValueChange={(value) => formState.setClaimType(value as ClaimType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select claim type" />
          </SelectTrigger>
          <SelectContent>
            {CLAIM_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-text-muted">
          Select the type of claim you are filing
        </p>
      </div>

      {/* Incident Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Incident Date & Time <span className="text-red-500">*</span>
        </label>
        <Input
          type="datetime-local"
          value={formState.incidentDate}
          onChange={(e) => formState.setIncidentDate(e.target.value)}
          max={todayDate}
          placeholder="Select incident date and time"
        />
        <p className="text-xs text-text-muted">
          Date and time when the incident occurred (must be in the past)
        </p>
        {formState.incidentDate && (
          <p className="text-xs text-green-600">
            ✓ {new Date(formState.incidentDate).toLocaleString()}
          </p>
        )}
      </div>

      {/* Incident Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Incident Location
        </label>
        <Input
          type="text"
          value={formState.incidentLocation}
          onChange={(e) => formState.setIncidentLocation(e.target.value)}
          placeholder="e.g., Highway 95, Mile Marker 42"
        />
        <p className="text-xs text-text-muted">
          Location where the incident occurred
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={formState.description}
          onChange={(e) => formState.setDescription(e.target.value)}
          placeholder="Describe the incident, damages, or issue in detail..."
          minLength={10}
          maxLength={5000}
          rows={4}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Provide a detailed description of what happened (10-5000 characters)
          </p>
          <p
            className={cn(
              'text-xs font-medium',
              formState.description.length > 5000
                ? 'text-red-500'
                : formState.description.length > 4500
                  ? 'text-yellow-600'
                  : 'text-text-muted'
            )}
          >
            {formState.description.length}/5000
          </p>
        </div>
      </div>

      {/* Carrier Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Carrier <span className="text-red-500">*</span>
        </label>
        {carrierLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Popover open={carrierOpen} onOpenChange={setCarrierOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={carrierOpen}
                className="w-full justify-between"
              >
                {selectedCarrier?.companyName || 'Select carrier...'}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search carriers..."
                  value={carrierSearch}
                  onValueChange={setCarrierSearch}
                />
                <CommandEmpty>No carrier found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {filteredCarriers.map((carrier) => (
                      <CommandItem
                        key={carrier.id}
                        value={carrier.id}
                        onSelect={(currentValue) => {
                          formState.setCarrierId(currentValue);
                          setCarrierOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            formState.carrierId === carrier.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{carrier.companyName}</span>
                          {carrier.carrierType && (
                            <span className="text-xs text-text-muted">
                              {carrier.carrierType}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        <p className="text-xs text-text-muted">
          Select the carrier involved in this claim
        </p>
      </div>

      {/* Order/Load Lookup (Optional) */}
      <Card className="bg-blue-50 p-4 dark:bg-blue-950">
        <h3 className="mb-3 text-sm font-medium text-text-primary">
          Optional: Link to Order or Load
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Order ID
            </label>
            <Input
              type="text"
              value={formState.orderId || ''}
              onChange={(e) =>
                formState.setOrderId(e.target.value || undefined)
              }
              placeholder="e.g., ORD-2024-001234"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Load ID
            </label>
            <Input
              type="text"
              value={formState.loadId || ''}
              onChange={(e) => formState.setLoadId(e.target.value || undefined)}
              placeholder="e.g., LOAD-2024-005678"
            />
          </div>
        </div>
      </Card>

      {/* Validation Summary */}
      <Card className="border-l-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-950">
        <h3 className="mb-2 text-sm font-medium text-text-primary">
          Step 1 Validation
        </h3>
        <ul className="space-y-1 text-xs text-text-muted">
          <li className={formState.claimType ? 'text-green-600' : ''}>
            {formState.claimType ? '✓' : '○'} Claim type selected
          </li>
          <li className={formState.incidentDate ? 'text-green-600' : ''}>
            {formState.incidentDate ? '✓' : '○'} Incident date set
          </li>
          <li
            className={
              formState.description.length >= 10 ? 'text-green-600' : ''
            }
          >
            {formState.description.length >= 10 ? '✓' : '○'} Description
            provided (min 10 chars)
          </li>
          <li className={formState.carrierId ? 'text-green-600' : ''}>
            {formState.carrierId ? '✓' : '○'} Carrier selected
          </li>
        </ul>
      </Card>
    </div>
  );
}
