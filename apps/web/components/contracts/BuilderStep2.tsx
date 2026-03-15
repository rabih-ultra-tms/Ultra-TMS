'use client';

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
import { Textarea } from '@/components/ui/textarea';

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'];
const incotermsOptions = [
  'EXW',
  'FCA',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
];

export default function BuilderStep2() {
  const { currency, paymentTerms, incoterms, value, setTerms } =
    useContractBuilderStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Contract Terms
        </h2>
        <p className="text-sm text-text-muted">
          Define payment terms, pricing, and contract value
        </p>
      </div>

      <Separator />

      {/* Currency & Incoterms */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="currency" className="text-sm font-medium">
            Currency *
          </Label>
          <Select
            value={currency}
            onValueChange={(selectedCurrency) =>
              setTerms(selectedCurrency, paymentTerms, incoterms, value)
            }
          >
            <SelectTrigger id="currency" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="incoterms" className="text-sm font-medium">
            Incoterms
          </Label>
          <Select
            value={incoterms}
            onValueChange={(selectedIncoterms) =>
              setTerms(currency, paymentTerms, selectedIncoterms, value)
            }
          >
            <SelectTrigger id="incoterms" className="mt-2">
              <SelectValue placeholder="Select incoterm" />
            </SelectTrigger>
            <SelectContent>
              {incotermsOptions.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contract Value */}
      <div>
        <Label htmlFor="value" className="text-sm font-medium">
          Contract Value ({currency}) *
        </Label>
        <Input
          id="value"
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) =>
            setTerms(
              currency,
              paymentTerms,
              incoterms,
              parseFloat(e.target.value) || 0
            )
          }
          placeholder="Enter contract value"
          className="mt-2"
        />
      </div>

      {/* Payment Terms */}
      <div>
        <Label htmlFor="payment-terms" className="text-sm font-medium">
          Payment Terms *
        </Label>
        <Textarea
          id="payment-terms"
          placeholder="e.g., Net 30, 50% deposit upon signing, 50% on delivery"
          value={paymentTerms}
          onChange={(e) => setTerms(currency, e.target.value, incoterms, value)}
          className="mt-2"
          rows={4}
        />
      </div>

      {/* Validation Message */}
      {!currency || !paymentTerms || value === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Please fill in all required fields to continue.
        </div>
      ) : null}
    </div>
  );
}
