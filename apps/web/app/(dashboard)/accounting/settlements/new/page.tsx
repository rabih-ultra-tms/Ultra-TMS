'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateSettlementForm } from '@/components/accounting/create-settlement-form';

export default function NewSettlementPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              New Settlement
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new settlement for carrier payables
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <CreateSettlementForm
          onSuccess={(id) => {
            router.push(`/accounting/settlements/${id}`);
          }}
          onCancel={() => {
            router.back();
          }}
        />
      </div>
    </div>
  );
}
