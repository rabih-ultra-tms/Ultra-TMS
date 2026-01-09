'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface InsuranceCertificate {
  id: string;
  carrierId: string;
  carrierName: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  effectiveDate: string;
  expirationDate: string;
  status: string;
  daysUntilExpiration: number;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

export default function InsuranceDashboardPage() {
  const [certificates, setCertificates] = useState<InsuranceCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expiring' | 'expired' | 'pending'>('expiring');
  const [typeFilter, setTypeFilter] = useState('');
  const [daysFilter, setDaysFilter] = useState(30);

  useEffect(() => {
    // Mock data
    const allCerts: InsuranceCertificate[] = [
      {
        id: '1',
        carrierId: '1',
        carrierName: 'Swift Transport LLC',
        type: 'AUTO_LIABILITY',
        provider: 'Progressive Commercial',
        policyNumber: 'AC-2024-001234',
        coverageAmount: 1000000,
        effectiveDate: '2024-01-15',
        expirationDate: '2025-01-25',
        status: 'ACTIVE',
        daysUntilExpiration: 10,
        verifiedAt: '2024-01-20',
        verifiedBy: 'Jane Admin',
      },
      {
        id: '2',
        carrierId: '1',
        carrierName: 'Swift Transport LLC',
        type: 'CARGO',
        provider: 'Old Dominion Insurance',
        policyNumber: 'CG-2024-005678',
        coverageAmount: 100000,
        effectiveDate: '2024-02-01',
        expirationDate: '2025-02-01',
        status: 'ACTIVE',
        daysUntilExpiration: 17,
        verifiedAt: '2024-02-05',
        verifiedBy: 'Jane Admin',
      },
      {
        id: '3',
        carrierId: '2',
        carrierName: 'Midwest Freight Inc',
        type: 'GENERAL_LIABILITY',
        provider: 'State Farm Commercial',
        policyNumber: 'GL-2024-009876',
        coverageAmount: 2000000,
        effectiveDate: '2024-03-01',
        expirationDate: '2025-01-20',
        status: 'ACTIVE',
        daysUntilExpiration: 5,
        verifiedAt: '2024-03-05',
        verifiedBy: 'John Doe',
      },
      {
        id: '4',
        carrierId: '3',
        carrierName: 'Southern Express Transport',
        type: 'WORKERS_COMP',
        provider: 'Liberty Mutual',
        policyNumber: 'WC-2024-112233',
        coverageAmount: 500000,
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-10',
        status: 'EXPIRED',
        daysUntilExpiration: -5,
        verifiedAt: '2024-01-05',
        verifiedBy: 'Jane Admin',
      },
      {
        id: '5',
        carrierId: '4',
        carrierName: 'Pacific Coast Logistics',
        type: 'AUTO_LIABILITY',
        provider: 'Travelers Insurance',
        policyNumber: 'AC-2024-445566',
        coverageAmount: 1000000,
        effectiveDate: '2025-01-10',
        expirationDate: '2026-01-10',
        status: 'PENDING',
        daysUntilExpiration: 360,
        verifiedAt: null,
        verifiedBy: null,
      },
      {
        id: '6',
        carrierId: '5',
        carrierName: 'Mountain West Trucking',
        type: 'CARGO',
        provider: 'Great American Insurance',
        policyNumber: 'CG-2024-778899',
        coverageAmount: 150000,
        effectiveDate: '2024-06-01',
        expirationDate: '2025-01-08',
        status: 'EXPIRED',
        daysUntilExpiration: -7,
        verifiedAt: '2024-06-05',
        verifiedBy: 'John Doe',
      },
    ];

    setCertificates(allCerts);
    setLoading(false);
  }, []);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      AUTO_LIABILITY: 'Auto Liability',
      CARGO: 'Cargo',
      GENERAL_LIABILITY: 'General Liability',
      WORKERS_COMP: 'Workers Comp',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredCerts = certificates.filter((cert) => {
    if (activeTab === 'expiring') {
      return cert.status === 'ACTIVE' && cert.daysUntilExpiration > 0 && cert.daysUntilExpiration <= daysFilter;
    } else if (activeTab === 'expired') {
      return cert.status === 'EXPIRED' || cert.daysUntilExpiration < 0;
    } else if (activeTab === 'pending') {
      return cert.status === 'PENDING';
    }
    return true;
  }).filter((cert) => {
    if (typeFilter) {
      return cert.type === typeFilter;
    }
    return true;
  });

  const stats = {
    expiring30: certificates.filter(c => c.status === 'ACTIVE' && c.daysUntilExpiration > 0 && c.daysUntilExpiration <= 30).length,
    expiring7: certificates.filter(c => c.status === 'ACTIVE' && c.daysUntilExpiration > 0 && c.daysUntilExpiration <= 7).length,
    expired: certificates.filter(c => c.status === 'EXPIRED' || c.daysUntilExpiration < 0).length,
    pending: certificates.filter(c => c.status === 'PENDING').length,
  };

  if (loading) {
    return <div className="p-8">Loading insurance dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Dashboard</h1>
          <p className="text-gray-600">Monitor carrier insurance certificates and compliance</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Expiring in 7 Days</div>
          <div className="text-3xl font-bold text-red-600">{stats.expiring7}</div>
          <div className="text-xs text-gray-400">Urgent attention needed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500">Expiring in 30 Days</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.expiring30}</div>
          <div className="text-xs text-gray-400">Renewal needed soon</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <div className="text-sm text-gray-500">Expired</div>
          <div className="text-3xl font-bold text-gray-600">{stats.expired}</div>
          <div className="text-xs text-gray-400">Non-compliant carriers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Pending Verification</div>
          <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
          <div className="text-xs text-gray-400">Awaiting review</div>
        </div>
      </div>

      {/* Alert Banner */}
      {stats.expiring7 > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-medium text-red-800">Urgent: {stats.expiring7} certificate(s) expiring within 7 days</div>
            <div className="text-sm text-red-600">Contact carriers immediately to request updated certificates of insurance.</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('expiring')}
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 'expiring'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Expiring Soon ({stats.expiring30})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 'expired'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Expired ({stats.expired})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Verification ({stats.pending})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="AUTO_LIABILITY">Auto Liability</option>
          <option value="CARGO">Cargo</option>
          <option value="GENERAL_LIABILITY">General Liability</option>
          <option value="WORKERS_COMP">Workers Comp</option>
        </select>
        {activeTab === 'expiring' && (
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>Next 7 Days</option>
            <option value={14}>Next 14 Days</option>
            <option value={30}>Next 30 Days</option>
            <option value={60}>Next 60 Days</option>
            <option value={90}>Next 90 Days</option>
          </select>
        )}
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider / Policy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coverage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No certificates found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/carriers/${cert.carrierId}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {cert.carrierName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getTypeLabel(cert.type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cert.provider}</div>
                    <div className="text-xs text-gray-500 font-mono">{cert.policyNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(cert.coverageAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      cert.daysUntilExpiration < 0 ? 'text-red-600' :
                      cert.daysUntilExpiration <= 7 ? 'text-red-600' :
                      cert.daysUntilExpiration <= 30 ? 'text-yellow-600' :
                      'text-gray-900'
                    }`}>
                      {cert.expirationDate}
                    </div>
                    <div className={`text-xs ${
                      cert.daysUntilExpiration < 0 ? 'text-red-500' :
                      cert.daysUntilExpiration <= 7 ? 'text-red-500' :
                      'text-gray-500'
                    }`}>
                      {cert.daysUntilExpiration < 0 
                        ? `${Math.abs(cert.daysUntilExpiration)} days ago`
                        : `${cert.daysUntilExpiration} days remaining`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                      {cert.status === 'PENDING' && (
                        <button className="text-green-600 hover:text-green-800">Verify</button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800">Request</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Insurance Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['AUTO_LIABILITY', 'CARGO', 'GENERAL_LIABILITY', 'WORKERS_COMP'].map((type) => {
          const typeCerts = certificates.filter(c => c.type === type);
          const active = typeCerts.filter(c => c.status === 'ACTIVE' && c.daysUntilExpiration > 0).length;
          const expiring = typeCerts.filter(c => c.status === 'ACTIVE' && c.daysUntilExpiration > 0 && c.daysUntilExpiration <= 30).length;
          const expired = typeCerts.filter(c => c.status === 'EXPIRED' || c.daysUntilExpiration < 0).length;

          return (
            <div key={type} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-gray-900">{getTypeLabel(type)}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active</span>
                  <span className="text-green-600 font-medium">{active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expiring (30d)</span>
                  <span className="text-yellow-600 font-medium">{expiring}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expired</span>
                  <span className="text-red-600 font-medium">{expired}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
