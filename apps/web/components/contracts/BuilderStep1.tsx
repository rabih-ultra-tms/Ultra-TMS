'use client';

import { ContractType } from '@/lib/api/contracts/types';
import { useContractBuilderStore } from '@/lib/stores/contractBuilderStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function BuilderStep1() {
  const {
    contractType,
    partyId,
    partyName,
    startDate,
    endDate,
    setContractType,
    setParty,
    setDates,
  } = useContractBuilderStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Contract Type & Parties
        </h2>
        <p className="text-sm text-text-muted">
          Select the contract type and identify the parties involved
        </p>
      </div>

      <Separator />

      {/* Contract Type */}
      <div>
        <Label htmlFor="contract-type" className="text-sm font-medium">
          Contract Type *
        </Label>
        <Select
          value={contractType || ''}
          onValueChange={(value) =>
            setContractType(value as ContractType)
          }
        >
          <SelectTrigger id="contract-type" className="mt-2">
            <SelectValue placeholder="Select contract type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ContractType).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Party Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="party-id" className="text-sm font-medium">
            Party ID *
          </Label>
          <Input
            id="party-id"
            placeholder="e.g., CUST-001"
            value={partyId}
            onChange={(e) => setParty(e.target.value, partyName)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="party-name" className="text-sm font-medium">
            Party Name *
          </Label>
          <Input
            id="party-name"
            placeholder="e.g., ABC Transportation Inc."
            value={partyName}
            onChange={(e) => setParty(partyId, e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Dates */}
      <div>
        <h3 className="mb-4 font-medium text-text-primary">Contract Period</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="start-date" className="text-sm font-medium">
              Start Date *
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setDates(e.target.value, endDate)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="end-date" className="text-sm font-medium">
              End Date *
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setDates(startDate, e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {!contractType || !partyId || !partyName || !startDate || !endDate ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Please fill in all required fields to continue.
        </div>
      ) : null}
    </div>
  );
}
