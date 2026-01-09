'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Carrier {
  id: string;
  legalName: string;
  mcNumber: string;
  dotNumber: string;
  city: string;
  state: string;
  phone: string;
  dispatchPhone: string | null;
  equipmentTypes: string[];
  serviceStates: string[];
  qualificationTier: string;
  totalLoadsCompleted: number;
  onTimeDeliveryRate: number;
  avgRating: number;
  preferredLanguage: string;
}

export default function CarrierSearchPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Search filters
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [originState, setOriginState] = useState('');
  const [destinationState, setDestinationState] = useState('');
  const [tiers, setTiers] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('');
  const [minLoads, setMinLoads] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    // Simulate search
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setCarriers([
      {
        id: '1',
        legalName: 'Swift Transport LLC',
        mcNumber: 'MC-123456',
        dotNumber: '1234567',
        city: 'Chicago',
        state: 'IL',
        phone: '312-555-0100',
        dispatchPhone: '312-555-0102',
        equipmentTypes: ['DRY_VAN', 'REEFER'],
        serviceStates: ['IL', 'IN', 'WI', 'MI', 'OH'],
        qualificationTier: 'PLATINUM',
        totalLoadsCompleted: 245,
        onTimeDeliveryRate: 98.5,
        avgRating: 4.8,
        preferredLanguage: 'en',
      },
      {
        id: '2',
        legalName: 'Midwest Freight Inc',
        mcNumber: 'MC-234567',
        dotNumber: '2345678',
        city: 'Indianapolis',
        state: 'IN',
        phone: '317-555-0200',
        dispatchPhone: '317-555-0201',
        equipmentTypes: ['DRY_VAN', 'FLATBED'],
        serviceStates: ['IN', 'OH', 'KY', 'IL'],
        qualificationTier: 'GOLD',
        totalLoadsCompleted: 89,
        onTimeDeliveryRate: 94.2,
        avgRating: 4.5,
        preferredLanguage: 'en',
      },
      {
        id: '3',
        legalName: 'TransMex Logistics',
        mcNumber: 'MC-345678',
        dotNumber: '3456789',
        city: 'Dallas',
        state: 'TX',
        phone: '214-555-0300',
        dispatchPhone: '214-555-0301',
        equipmentTypes: ['DRY_VAN', 'REEFER'],
        serviceStates: ['TX', 'OK', 'AR', 'LA', 'NM'],
        qualificationTier: 'GOLD',
        totalLoadsCompleted: 156,
        onTimeDeliveryRate: 92.8,
        avgRating: 4.6,
        preferredLanguage: 'es',
      },
    ]);
    
    setSearched(true);
    setLoading(false);
  };

  const handleEquipmentToggle = (type: string) => {
    setEquipmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleTierToggle = (tier: string) => {
    setTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      PLATINUM: 'bg-purple-100 text-purple-800',
      GOLD: 'bg-yellow-100 text-yellow-800',
      SILVER: 'bg-gray-200 text-gray-700',
      BRONZE: 'bg-orange-100 text-orange-700',
    };
    return colors[tier] || 'bg-gray-100 text-gray-500';
  };

  const equipmentTypesList = [
    'DRY_VAN',
    'REEFER',
    'FLATBED',
    'STEP_DECK',
    'LOWBOY',
    'TANKER',
    'HOPPER',
    'POWER_ONLY',
  ];

  const tiersList = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/carriers" className="text-gray-500 hover:text-gray-700">
            ← Back to Carriers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Search Carriers</h1>
          <p className="text-gray-600">Find carriers for your loads based on equipment and lanes</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Criteria</h3>

        {/* Equipment Types */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
          <div className="flex flex-wrap gap-2">
            {equipmentTypesList.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleEquipmentToggle(type)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  equipmentTypes.includes(type)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Lane Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin State</label>
            <select
              value={originState}
              onChange={(e) => setOriginState(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Any State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination State</label>
            <select
              value={destinationState}
              onChange={(e) => setDestinationState(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Any State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Qualification Tier */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Qualification Tier</label>
          <div className="flex flex-wrap gap-2">
            {tiersList.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => handleTierToggle(tier)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  tiers.includes(tier)
                    ? getTierColor(tier) + ' border-transparent'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Min Requirements */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Loads Completed</label>
            <select
              value={minLoads}
              onChange={(e) => setMinLoads(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Any</option>
              <option value="10">10+ loads</option>
              <option value="25">25+ loads</option>
              <option value="50">50+ loads</option>
              <option value="100">100+ loads</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : '🔍 Search Carriers'}
        </button>
      </div>

      {/* Search Results */}
      {searched && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({carriers.length} carriers found)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {carriers.map((carrier) => (
              <div key={carrier.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {carrier.legalName}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(carrier.qualificationTier)}`}>
                        {carrier.qualificationTier}
                      </span>
                      {carrier.preferredLanguage === 'es' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          🇪🇸 Español
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {carrier.mcNumber} • DOT: {carrier.dotNumber} • {carrier.city}, {carrier.state}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {carrier.equipmentTypes.map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {carrier.serviceStates.map((state) => (
                        <span key={state} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {state}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-600 mb-1">
                      {carrier.totalLoadsCompleted} loads • {carrier.onTimeDeliveryRate}% OTD
                    </div>
                    <div className="text-lg font-semibold text-yellow-600 mb-2">
                      ⭐ {carrier.avgRating}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <a
                        href={`tel:${carrier.dispatchPhone || carrier.phone}`}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        📞 Call Dispatch
                      </a>
                      <Link
                        href={`/carriers/${carrier.id}`}
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && carriers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Carriers Found</h3>
          <p className="text-gray-600">Try adjusting your search criteria to find more carriers.</p>
        </div>
      )}
    </div>
  );
}
