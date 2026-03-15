'use client';

import { Suspense } from 'react';
import ContractBuilder from '@/components/contracts/ContractBuilder';

export default function NewContractPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading contract builder...
        </div>
      }
    >
      <ContractBuilder />
    </Suspense>
  );
}
