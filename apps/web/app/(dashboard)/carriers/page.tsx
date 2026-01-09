'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Carrier {
  id: string;
  mcNumber: string;
  dotNumber: string;
  legalName: string;
  dbaName: string | null;
  city: string;
  state: string;
  phone: string;
  status: string;
  qualificationTier: string;
  equipmentTypes: string[];
  totalLoadsCompleted: number;
  onTimeDeliveryRate: number;
  avgRating: number;
}

export default function CarriersListPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Mock data for demonstration
    setCarriers([
      {
        id: '1',
        mcNumber: 'MC-123456',
        dotNumber: '1234567',
        legalName: 'Swift Transport LLC',
        dbaName: 'Swift Logistics',
        city: 'Chicago',
        state: 'IL',
        phone: '312-555-0100',
        status: 'ACTIVE',
        qualificationTier: 'PLATINUM',
        equipmentTypes: ['DRY_VAN', 'REEFER'],
        totalLoadsCompleted: 245,
        onTimeDeliveryRate: 98.5,
        avgRating: 4.8,
      },
      {
        id: '2',
        mcNumber: 'MC-234567',
        dotNumber: '2345678',
        legalName: 'Midwest Freight Inc',
        dbaName: null,
        city: 'Indianapolis',
        state: 'IN',
        phone: '317-555-0200',
        status: 'ACTIVE',
        qualificationTier: 'GOLD',
        equipmentTypes: ['DRY_VAN', 'FLATBED'],
        totalLoadsCompleted: 89,
        onTimeDeliveryRate: 94.2,
        avgRating: 4.5,
      },
      {
        id: '3',
        mcNumber: 'MC-345678',
        dotNumber: '3456789',
        legalName: 'Southern Express Transport',
        dbaName: 'SET Trucking',
        city: 'Dallas',
        state: 'TX',
        phone: '214-555-0300',
        status: 'ACTIVE',
        qualificationTier: 'SILVER',
        equipmentTypes: ['DRY_VAN'],
        totalLoadsCompleted: 34,
        onTimeDeliveryRate: 88.1,
        avgRating: 4.2,
      },
      {
        id: '4',
        mcNumber: 'MC-456789',
        dotNumber: '4567890',
        legalName: 'Pacific Carriers LLC',
        dbaName: null,
        city: 'Los Angeles',
        state: 'CA',
        phone: '213-555-0400',
        status: 'PENDING',
        qualificationTier: 'UNQUALIFIED',
        equipmentTypes: ['REEFER', 'TANKER'],
        totalLoadsCompleted: 0,
        onTimeDeliveryRate: 0,
        avgRating: 0,
      },
      {
        id: '5',
        mcNumber: 'MC-567890',
        dotNumber: '5678901',
        legalName: 'Mountain View Trucking',
        dbaName: null,
        city: 'Denver',
        state: 'CO',
        phone: '303-555-0500',
        status: 'SUSPENDED',
        qualificationTier: 'BRONZE',
        equipmentTypes: ['FLATBED', 'STEP_DECK'],
        totalLoadsCompleted: 12,
        onTimeDeliveryRate: 75.0,
        avgRating: 3.5,
      },
      {
        id: '6',
        mcNumber: 'MC-678901',
        dotNumber: '6789012',
        legalName: 'Eastern Haulers Inc',
        dbaName: 'EH Transport',
        city: 'Atlanta',
        state: 'GA',
        phone: '404-555-0600',
        status: 'ACTIVE',
        qualificationTier: 'GOLD',
        equipmentTypes: ['DRY_VAN', 'REEFER', 'FLATBED'],
        totalLoadsCompleted: 156,
        onTimeDeliveryRate: 92.8,
        avgRating: 4.6,
      },
    ]);
    setTotalPages(3);
    setLoading(false);
  }, [search, statusFilter, tierFilter, page]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BLACKLISTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      PLATINUM: 'bg-purple-100 text-purple-800',
      GOLD: 'bg-yellow-100 text-yellow-800',
      SILVER: 'bg-gray-200 text-gray-700',
      BRONZE: 'bg-orange-100 text-orange-700',
      UNQUALIFIED: 'bg-gray-100 text-gray-500',
    };
    return colors[tier] || 'bg-gray-100 text-gray-500';
  };

  const formatEquipmentTypes = (types: string[]) => {
    const shortNames: Record<string, string> = {
      DRY_VAN: 'Van',
      REEFER: 'Reefer',
      FLATBED: 'Flat',
      STEP_DECK: 'Step',
      LOWBOY: 'Low',
      TANKER: 'Tank',
      HOPPER: 'Hop',
      POWER_ONLY: 'PO',
    };
    return types.slice(0, 3).map((t) => shortNames[t] || t).join(', ');
  };

  const statuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'BLACKLISTED'];
  const tiers = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'UNQUALIFIED'];

  if (loading) {
    return <div className="p-8">Loading carriers...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carriers</h1>
          <p className="text-gray-600">Manage your carrier network</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/carriers/search"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            🔍 Search Carriers
          </Link>
          <Link
            href="/carriers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Carrier
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Carriers</div>
          <div className="text-2xl font-bold text-gray-900">156</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">128</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-600">12</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Platinum/Gold</div>
          <div className="text-2xl font-bold text-purple-600">45</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Expiring Insurance</div>
          <div className="text-2xl font-bold text-red-600">8</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name, MC#, DOT#..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tiers</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Carriers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MC# / DOT#
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carriers.map((carrier) => (
              <tr key={carrier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {carrier.legalName}
                  </div>
                  {carrier.dbaName && (
                    <div className="text-sm text-gray-500">
                      DBA: {carrier.dbaName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{carrier.mcNumber}</div>
                  <div className="text-sm text-gray-500">DOT: {carrier.dotNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {carrier.city}, {carrier.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatEquipmentTypes(carrier.equipmentTypes)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      carrier.status
                    )}`}
                  >
                    {carrier.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(
                      carrier.qualificationTier
                    )}`}
                  >
                    {carrier.qualificationTier}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {carrier.totalLoadsCompleted} loads
                  </div>
                  <div className="text-sm text-gray-500">
                    {carrier.onTimeDeliveryRate > 0
                      ? `${carrier.onTimeDeliveryRate}% OTD`
                      : 'No data'}
                    {carrier.avgRating > 0 && ` • ⭐ ${carrier.avgRating}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <Link
                      href={`/carriers/${carrier.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    <Link
                      href={`/carriers/${carrier.id}/compliance`}
                      className="text-green-600 hover:text-green-800"
                    >
                      Compliance
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
