'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  preferredLanguage: string;
  cdlNumber: string;
  cdlState: string;
  cdlClass: string;
  cdlExpiration: string;
  endorsements: string[];
  medicalCardExpiration: string | null;
  mvrDate: string | null;
  status: string;
  availability: string;
  carrierName: string;
  carrierId: string;
  assignedTruckNumber: string | null;
  assignedTrailerNumber: string | null;
  lastLocationCity: string | null;
  lastLocationState: string | null;
  lastLocationTimestamp: string | null;
  hosStatus: string | null;
  hosDriveRemaining: number | null;
  hosDutyRemaining: number | null;
  hosCycleRemaining: number | null;
  hosResetAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface LoadHistory {
  id: string;
  loadNumber: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  status: string;
  revenue: number;
}

export default function DriverDetailPage() {
  const params = useParams();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loadHistory, setLoadHistory] = useState<LoadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Mock data
    setDriver({
      id: driverId,
      firstName: 'James',
      lastName: 'Wilson',
      phone: '312-555-1001',
      email: 'jwilson@swifttransport.com',
      preferredLanguage: 'EN',
      cdlNumber: 'D123456789',
      cdlState: 'IL',
      cdlClass: 'A',
      cdlExpiration: '2026-03-15',
      endorsements: ['H', 'T'],
      medicalCardExpiration: '2025-08-15',
      mvrDate: '2024-06-01',
      status: 'ACTIVE',
      availability: 'EN_ROUTE',
      carrierName: 'Swift Transport LLC',
      carrierId: '1',
      assignedTruckNumber: 'TRK-101',
      assignedTrailerNumber: 'TRL-205',
      lastLocationCity: 'Kansas City',
      lastLocationState: 'MO',
      lastLocationTimestamp: '2025-01-15T14:30:00Z',
      hosStatus: 'DRIVING',
      hosDriveRemaining: 420,
      hosDutyRemaining: 540,
      hosCycleRemaining: 2400,
      hosResetAt: '2025-01-20T05:00:00Z',
      notes: 'Experienced driver, prefers Midwest lanes. Has hazmat endorsement for specialized loads.',
      createdAt: '2023-05-15',
    });

    setLoadHistory([
      {
        id: '1',
        loadNumber: 'LD-2025-0150',
        origin: 'Chicago, IL',
        destination: 'Denver, CO',
        pickupDate: '2025-01-15',
        deliveryDate: '2025-01-17',
        status: 'IN_TRANSIT',
        revenue: 3200,
      },
      {
        id: '2',
        loadNumber: 'LD-2025-0145',
        origin: 'Denver, CO',
        destination: 'Chicago, IL',
        pickupDate: '2025-01-12',
        deliveryDate: '2025-01-14',
        status: 'DELIVERED',
        revenue: 3100,
      },
      {
        id: '3',
        loadNumber: 'LD-2025-0132',
        origin: 'Chicago, IL',
        destination: 'Kansas City, MO',
        pickupDate: '2025-01-08',
        deliveryDate: '2025-01-09',
        status: 'DELIVERED',
        revenue: 1800,
      },
    ]);
    setLoading(false);
  }, [driverId]);

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

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30;
  };

  const getDaysUntil = (date: string | null) => {
    if (!date) return null;
    const expDate = new Date(date);
    const now = new Date();
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading || !driver) {
    return <div className="p-8">Loading driver...</div>;
  }

  const tabs = ['overview', 'hos', 'loads', 'documents'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/drivers" className="text-blue-600 hover:text-blue-800">
              ← Drivers
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {driver.firstName} {driver.lastName}
          </h1>
          <p className="text-gray-600">
            <Link href={`/carriers/${driver.carrierId}`} className="text-blue-600 hover:underline">
              {driver.carrierName}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(driver.status)}`}>
            {driver.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(driver.availability)}`}>
            {driver.availability.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Current Location</div>
          <div className="text-lg font-semibold text-gray-900">
            {driver.lastLocationCity ? (
              <>📍 {driver.lastLocationCity}, {driver.lastLocationState}</>
            ) : (
              <span className="text-gray-400">No location</span>
            )}
          </div>
          {driver.lastLocationTimestamp && (
            <div className="text-xs text-gray-400">
              Updated {new Date(driver.lastLocationTimestamp).toLocaleString()}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Assigned Equipment</div>
          <div className="text-lg font-semibold text-gray-900">
            {driver.assignedTruckNumber ? (
              <>🚛 {driver.assignedTruckNumber}</>
            ) : (
              <span className="text-gray-400">Not assigned</span>
            )}
          </div>
          {driver.assignedTrailerNumber && (
            <div className="text-sm text-gray-500">Trailer: {driver.assignedTrailerNumber}</div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">HOS Status</div>
          <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getHosStatusColor(driver.hosStatus)}`}>
            {driver.hosStatus?.replace('_', ' ') || 'Unknown'}
          </span>
          {driver.hosDriveRemaining !== null && (
            <div className="text-sm text-gray-600 mt-1">
              Drive Remaining: {formatHosTime(driver.hosDriveRemaining)}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">CDL Expires</div>
          <div className={`text-lg font-semibold ${isExpiringSoon(driver.cdlExpiration) ? 'text-red-600' : 'text-gray-900'}`}>
            {driver.cdlExpiration}
            {isExpiringSoon(driver.cdlExpiration) && ' ⚠️'}
          </div>
          <div className="text-sm text-gray-500">
            {getDaysUntil(driver.cdlExpiration)} days
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{driver.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{driver.email || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Preferred Language</dt>
                <dd className="text-gray-900">{driver.preferredLanguage === 'EN' ? 'English' : 'Spanish'}</dd>
              </div>
            </dl>
          </div>

          {/* CDL Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">CDL Information</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">CDL Number</dt>
                <dd className="text-gray-900 font-mono">{driver.cdlNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">State</dt>
                <dd className="text-gray-900">{driver.cdlState}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Class</dt>
                <dd className="text-gray-900">Class {driver.cdlClass}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Endorsements</dt>
                <dd className="text-gray-900">
                  {driver.endorsements.length > 0 ? driver.endorsements.join(', ') : 'None'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Expiration</dt>
                <dd className={isExpiringSoon(driver.cdlExpiration) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                  {driver.cdlExpiration} {isExpiringSoon(driver.cdlExpiration) && '⚠️'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Medical & MVR */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Medical & MVR</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Medical Card Expires</dt>
                <dd className={isExpiringSoon(driver.medicalCardExpiration) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                  {driver.medicalCardExpiration || '-'}
                  {isExpiringSoon(driver.medicalCardExpiration) && ' ⚠️'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last MVR Date</dt>
                <dd className="text-gray-900">{driver.mvrDate || '-'}</dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <p className="text-gray-600">{driver.notes || 'No notes available.'}</p>
          </div>
        </div>
      )}

      {activeTab === 'hos' && (
        <div className="space-y-6">
          {/* HOS Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Hours of Service Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500">Current Status</div>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getHosStatusColor(driver.hosStatus)}`}>
                  {driver.hosStatus?.replace('_', ' ') || 'Unknown'}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Drive Time Remaining</div>
                <div className="text-2xl font-bold text-gray-900">{formatHosTime(driver.hosDriveRemaining)}</div>
                <div className="text-xs text-gray-400">11-hour limit</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Duty Time Remaining</div>
                <div className="text-2xl font-bold text-gray-900">{formatHosTime(driver.hosDutyRemaining)}</div>
                <div className="text-xs text-gray-400">14-hour limit</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">70-Hour Cycle Remaining</div>
                <div className="text-2xl font-bold text-gray-900">{formatHosTime(driver.hosCycleRemaining)}</div>
                <div className="text-xs text-gray-400">8-day/70-hour rule</div>
              </div>
            </div>
            {driver.hosResetAt && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Next Reset:</strong> {new Date(driver.hosResetAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* HOS Progress Bars */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Hours Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Drive Time (11h limit)</span>
                  <span className="text-sm font-medium text-gray-900">{formatHosTime(driver.hosDriveRemaining)} remaining</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(driver.hosDriveRemaining || 0) / 660 * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">On-Duty Time (14h limit)</span>
                  <span className="text-sm font-medium text-gray-900">{formatHosTime(driver.hosDutyRemaining)} remaining</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(driver.hosDutyRemaining || 0) / 840 * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">70-Hour Cycle</span>
                  <span className="text-sm font-medium text-gray-900">{formatHosTime(driver.hosCycleRemaining)} remaining</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(driver.hosCycleRemaining || 0) / 4200 * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'loads' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Load History</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadHistory.map((load) => (
                <tr key={load.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/loads/${load.id}`} className="text-blue-600 hover:underline font-medium">
                      {load.loadNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{load.origin}</div>
                    <div className="text-sm text-gray-500">→ {load.destination}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{load.pickupDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{load.deliveryDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      load.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      load.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {load.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    ${load.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Driver Documents</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium">CDL Copy</div>
                  <div className="text-sm text-gray-500">Uploaded: 2024-06-01</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Verified</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium">Medical Card</div>
                  <div className="text-sm text-gray-500">Uploaded: 2024-06-01</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Verified</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium">MVR Report</div>
                  <div className="text-sm text-gray-500">Uploaded: 2024-06-01</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Verified</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
