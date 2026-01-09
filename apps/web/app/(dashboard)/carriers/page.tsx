'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Pagination from '@/components/ui/Pagination';

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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 100, // Mock total for now
    totalPages: 5,
  });

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
    setPagination((prev) => ({ ...prev, totalPages: 5, total: 100 }));
    setLoading(false);
  }, [search, statusFilter, tierFilter, pagination.page]);

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

  // Derived filtered list and pagination counters
  const filteredCarriers = carriers.filter((c) => {
    const matchesSearch =
      !search ||
      c.legalName.toLowerCase().includes(search.toLowerCase()) ||
      (c.dbaName || '').toLowerCase().includes(search.toLowerCase()) ||
      c.mcNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.dotNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesTier = !tierFilter || c.qualificationTier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const total = filteredCarriers.length;
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const pageCarriers = filteredCarriers.slice(startIndex, endIndex);

  // Keep pagination totals in sync
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages: Math.max(1, Math.ceil(total / prev.limit)),
    }));
  }, [total, pagination.limit]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-slate-500 text-sm">Loading carriers...</div>
    </div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Carriers</h1>
          <p className="mt-0.5 text-sm text-slate-600">Manage your carrier network</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Total Carriers</div>
          <div className="text-xl font-semibold text-slate-900">156</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Active</div>
          <div className="text-xl font-semibold text-green-600">128</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Pending Approval</div>
          <div className="text-xl font-semibold text-yellow-600">12</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Platinum/Gold</div>
          <div className="text-xl font-semibold text-purple-600">45</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Expiring Insurance</div>
          <div className="text-xl font-semibold text-red-600">8</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-md border border-slate-200 p-3 mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name, MC#, DOT#..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
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
            className="px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
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
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                MC# / DOT#
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {pageCarriers.map((carrier) => (
              <tr key={carrier.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {carrier.legalName}
                  </div>
                  {carrier.dbaName && (
                    <div className="text-sm text-slate-500">
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
        {filteredCarriers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No carriers match the filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          itemName="carriers"
        />
    </div>
  );
}
