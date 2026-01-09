'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Pagination from '@/components/ui/Pagination';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  cdlNumber: string;
  cdlState: string;
  cdlClass: string;
  cdlExpiration: string;
  endorsements: string[];
  status: string;
  availability: string;
  carrierName: string;
  carrierId: string;
  assignedTruckNumber: string | null;
  lastLocationCity: string | null;
  lastLocationState: string | null;
  hosStatus: string | null;
  hosDriveRemaining: number | null;
}

export default function DriversListPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 80, // Mock total for now
    totalPages: 4,
  });

  useEffect(() => {
    // Mock data
    setDrivers([
      {
        id: '1',
        firstName: 'James',
        lastName: 'Wilson',
        phone: '312-555-1001',
        email: 'jwilson@swifttransport.com',
        cdlNumber: 'D123456789',
        cdlState: 'IL',
        cdlClass: 'A',
        cdlExpiration: '2026-03-15',
        endorsements: ['H', 'T'],
        status: 'ACTIVE',
        availability: 'EN_ROUTE',
        carrierName: 'Swift Transport LLC',
        carrierId: '1',
        assignedTruckNumber: 'TRK-101',
        lastLocationCity: 'Kansas City',
        lastLocationState: 'MO',
        hosStatus: 'DRIVING',
        hosDriveRemaining: 420,
      },
      {
        id: '2',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        phone: '312-555-1002',
        email: 'mrodriguez@swifttransport.com',
        cdlNumber: 'D234567890',
        cdlState: 'IL',
        cdlClass: 'A',
        cdlExpiration: '2025-08-20',
        endorsements: ['N', 'X'],
        status: 'ACTIVE',
        availability: 'AVAILABLE',
        carrierName: 'Swift Transport LLC',
        carrierId: '1',
        assignedTruckNumber: 'TRK-102',
        lastLocationCity: 'Chicago',
        lastLocationState: 'IL',
        hosStatus: 'OFF_DUTY',
        hosDriveRemaining: 660,
      },
      {
        id: '3',
        firstName: 'Robert',
        lastName: 'Johnson',
        phone: '317-555-2001',
        email: 'rjohnson@midwestfreight.com',
        cdlNumber: 'D345678901',
        cdlState: 'IN',
        cdlClass: 'A',
        cdlExpiration: '2025-02-10',
        endorsements: ['H'],
        status: 'ACTIVE',
        availability: 'EN_ROUTE',
        carrierName: 'Midwest Freight Inc',
        carrierId: '2',
        assignedTruckNumber: 'MF-205',
        lastLocationCity: 'Columbus',
        lastLocationState: 'OH',
        hosStatus: 'ON_DUTY',
        hosDriveRemaining: 540,
      },
      {
        id: '4',
        firstName: 'Carlos',
        lastName: 'Mendez',
        phone: '214-555-3001',
        email: null,
        cdlNumber: 'D456789012',
        cdlState: 'TX',
        cdlClass: 'A',
        cdlExpiration: '2025-11-30',
        endorsements: ['T', 'P'],
        status: 'ACTIVE',
        availability: 'UNAVAILABLE',
        carrierName: 'Southern Express Transport',
        carrierId: '3',
        assignedTruckNumber: null,
        lastLocationCity: 'Dallas',
        lastLocationState: 'TX',
        hosStatus: 'SLEEPER',
        hosDriveRemaining: 0,
      },
      {
        id: '5',
        firstName: 'Mike',
        lastName: 'Thompson',
        phone: '312-555-1003',
        email: 'mthompson@swifttransport.com',
        cdlNumber: 'D567890123',
        cdlState: 'IL',
        cdlClass: 'A',
        cdlExpiration: '2025-01-20',
        endorsements: [],
        status: 'SUSPENDED',
        availability: 'UNAVAILABLE',
        carrierName: 'Swift Transport LLC',
        carrierId: '1',
        assignedTruckNumber: null,
        lastLocationCity: null,
        lastLocationState: null,
        hosStatus: null,
        hosDriveRemaining: null,
      },
    ]);
    setPagination((prev) => ({ ...prev, totalPages: 4, total: 80 }));
    setLoading(false);
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [search, statusFilter, availabilityFilter]);

  // Derived filtered list and pagination counters
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      !search ||
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(search.toLowerCase()) ||
      d.phone.toLowerCase().includes(search.toLowerCase()) ||
      d.cdlNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
    const matchesAvailability = !availabilityFilter || d.availability === availabilityFilter;
    return matchesSearch && matchesStatus && matchesAvailability;
  });

  const total = filteredDrivers.length;
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const pageDrivers = filteredDrivers.slice(startIndex, endIndex);

  // Keep pagination totals in sync
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages: Math.max(1, Math.ceil(total / prev.limit)),
    }));
  }, [total, pagination.limit]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityColor = (availability: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800',
      UNAVAILABLE: 'bg-gray-100 text-gray-800',
      EN_ROUTE: 'bg-blue-100 text-blue-800',
    };
    return colors[availability] || 'bg-gray-100 text-gray-800';
  };

  const getHosStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-500';
    const colors: Record<string, string> = {
      DRIVING: 'bg-green-100 text-green-800',
      ON_DUTY: 'bg-blue-100 text-blue-800',
      OFF_DUTY: 'bg-gray-100 text-gray-800',
      SLEEPER: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  const formatHosTime = (minutes: number | null) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isExpiringSoon = (date: string) => {
    const expDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-slate-500 text-sm">Loading drivers...</div>
    </div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Drivers</h1>
          <p className="mt-0.5 text-sm text-slate-600">View all drivers across your carrier network</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Total Drivers</div>
          <div className="text-xl font-semibold text-slate-900">89</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Available</div>
          <div className="text-xl font-semibold text-green-600">32</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">En Route</div>
          <div className="text-xl font-semibold text-blue-600">45</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">CDL Expiring</div>
          <div className="text-xl font-semibold text-yellow-600">5</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Medical Expiring</div>
          <div className="text-xl font-semibold text-orange-600">3</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-md border border-slate-200 p-3 mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name, CDL#, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                CDL Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                HOS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {pageDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {driver.firstName} {driver.lastName}
                  </div>
                  <div className="text-sm text-slate-500">{driver.phone}</div>
                  {driver.assignedTruckNumber && (
                    <div className="text-xs text-blue-600">🚛 {driver.assignedTruckNumber}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/carriers/${driver.carrierId}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {driver.carrierName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {driver.cdlNumber} ({driver.cdlState})
                  </div>
                  <div className="text-sm text-gray-500">
                    Class {driver.cdlClass}
                    {driver.endorsements.length > 0 && (
                      <span className="ml-1">
                        • {driver.endorsements.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${isExpiringSoon(driver.cdlExpiration) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    Exp: {driver.cdlExpiration}
                    {isExpiringSoon(driver.cdlExpiration) && ' ⚠️'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                    {driver.status}
                  </span>
                  <br />
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(driver.availability)}`}>
                    {driver.availability.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.lastLocationCity ? (
                    <div className="text-sm text-gray-900">
                      📍 {driver.lastLocationCity}, {driver.lastLocationState}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No location</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getHosStatusColor(driver.hosStatus)}`}>
                    {driver.hosStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                  {driver.hosDriveRemaining !== null && (
                    <div className="text-xs text-slate-500 mt-1">
                      Drive: {formatHosTime(driver.hosDriveRemaining)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/drivers/${driver.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No drivers match the filters</p>
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
        itemName="drivers"
      />
    </div>
  );
}
