'use client';

import React, { useState } from 'react';
import { AvailableLoadsList } from '@/components/carrier/AvailableLoadsList';

export default function CarrierLoadsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoadAccepted = () => {
    // Refresh the list by updating the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Available Loads</h1>
        <p className="text-slate-600 mt-2">
          Browse and accept available shipments
        </p>
      </div>

      {/* Available Loads List */}
      <AvailableLoadsList
        key={refreshKey}
        onLoadAccepted={handleLoadAccepted}
      />
    </div>
  );
}
