'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ComplianceAlert {
  id: string;
  carrierId: string;
  carrierName: string;
  type: 'FMCSA' | 'INSURANCE' | 'DOCUMENT' | 'SAFETY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  createdAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  assignedTo: string | null;
}

interface CarrierCompliance {
  id: string;
  name: string;
  mcNumber: string;
  dotNumber: string;
  status: string;
  tier: string;
  fmcsaStatus: string;
  safetyRating: string | null;
  insuranceStatus: string;
  documentStatus: string;
  lastFmcsaCheck: string;
  alertCount: number;
}

interface DocumentPending {
  id: string;
  carrierId: string;
  carrierName: string;
  documentType: string;
  uploadedAt: string;
  status: 'PENDING_REVIEW' | 'REJECTED';
  rejectionReason: string | null;
}

export default function ComplianceMonitorPage() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [carriers, setCarriers] = useState<CarrierCompliance[]>([]);
  const [documents, setDocuments] = useState<DocumentPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'carriers' | 'documents'>('alerts');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    // Mock data
    setAlerts([
      {
        id: '1',
        carrierId: '3',
        carrierName: 'Southern Express Transport',
        type: 'FMCSA',
        severity: 'CRITICAL',
        title: 'Operating Authority Revoked',
        description: 'FMCSA reports operating authority has been revoked. Carrier cannot operate legally.',
        createdAt: '2025-01-15T10:30:00Z',
        status: 'OPEN',
        assignedTo: null,
      },
      {
        id: '2',
        carrierId: '1',
        carrierName: 'Swift Transport LLC',
        type: 'INSURANCE',
        severity: 'HIGH',
        title: 'Auto Liability Insurance Expiring',
        description: 'Auto liability insurance expires in 10 days. Renewal certificate not yet received.',
        createdAt: '2025-01-14T09:00:00Z',
        status: 'IN_PROGRESS',
        assignedTo: 'Jane Admin',
      },
      {
        id: '3',
        carrierId: '5',
        carrierName: 'Mountain West Trucking',
        type: 'INSURANCE',
        severity: 'CRITICAL',
        title: 'Cargo Insurance Expired',
        description: 'Cargo insurance has expired. Do not dispatch loads until renewed.',
        createdAt: '2025-01-08T08:00:00Z',
        status: 'OPEN',
        assignedTo: null,
      },
      {
        id: '4',
        carrierId: '2',
        carrierName: 'Midwest Freight Inc',
        type: 'SAFETY',
        severity: 'MEDIUM',
        title: 'Safety Rating Downgrade',
        description: 'FMCSA safety rating changed from Satisfactory to Conditional.',
        createdAt: '2025-01-12T14:00:00Z',
        status: 'OPEN',
        assignedTo: null,
      },
      {
        id: '5',
        carrierId: '4',
        carrierName: 'Pacific Coast Logistics',
        type: 'DOCUMENT',
        severity: 'LOW',
        title: 'W-9 Form Missing',
        description: 'W-9 form not on file. Required for payment processing.',
        createdAt: '2025-01-10T11:00:00Z',
        status: 'OPEN',
        assignedTo: null,
      },
    ]);

    setCarriers([
      {
        id: '1',
        name: 'Swift Transport LLC',
        mcNumber: 'MC-123456',
        dotNumber: 'DOT-789012',
        status: 'ACTIVE',
        tier: 'PREFERRED',
        fmcsaStatus: 'AUTHORIZED',
        safetyRating: 'SATISFACTORY',
        insuranceStatus: 'EXPIRING',
        documentStatus: 'COMPLETE',
        lastFmcsaCheck: '2025-01-10',
        alertCount: 1,
      },
      {
        id: '2',
        name: 'Midwest Freight Inc',
        mcNumber: 'MC-234567',
        dotNumber: 'DOT-890123',
        status: 'ACTIVE',
        tier: 'APPROVED',
        fmcsaStatus: 'AUTHORIZED',
        safetyRating: 'CONDITIONAL',
        insuranceStatus: 'CURRENT',
        documentStatus: 'COMPLETE',
        lastFmcsaCheck: '2025-01-12',
        alertCount: 1,
      },
      {
        id: '3',
        name: 'Southern Express Transport',
        mcNumber: 'MC-345678',
        dotNumber: 'DOT-901234',
        status: 'SUSPENDED',
        tier: 'APPROVED',
        fmcsaStatus: 'REVOKED',
        safetyRating: null,
        insuranceStatus: 'EXPIRED',
        documentStatus: 'INCOMPLETE',
        lastFmcsaCheck: '2025-01-15',
        alertCount: 3,
      },
      {
        id: '4',
        name: 'Pacific Coast Logistics',
        mcNumber: 'MC-456789',
        dotNumber: 'DOT-012345',
        status: 'PENDING',
        tier: 'NEW',
        fmcsaStatus: 'AUTHORIZED',
        safetyRating: null,
        insuranceStatus: 'PENDING',
        documentStatus: 'INCOMPLETE',
        lastFmcsaCheck: '2025-01-08',
        alertCount: 1,
      },
      {
        id: '5',
        name: 'Mountain West Trucking',
        mcNumber: 'MC-567890',
        dotNumber: 'DOT-123456',
        status: 'ACTIVE',
        tier: 'APPROVED',
        fmcsaStatus: 'AUTHORIZED',
        safetyRating: 'SATISFACTORY',
        insuranceStatus: 'EXPIRED',
        documentStatus: 'COMPLETE',
        lastFmcsaCheck: '2025-01-05',
        alertCount: 1,
      },
    ]);

    setDocuments([
      {
        id: '1',
        carrierId: '4',
        carrierName: 'Pacific Coast Logistics',
        documentType: 'W9',
        uploadedAt: '2025-01-12T09:00:00Z',
        status: 'PENDING_REVIEW',
        rejectionReason: null,
      },
      {
        id: '2',
        carrierId: '4',
        carrierName: 'Pacific Coast Logistics',
        documentType: 'CARRIER_AGREEMENT',
        uploadedAt: '2025-01-12T09:05:00Z',
        status: 'PENDING_REVIEW',
        rejectionReason: null,
      },
      {
        id: '3',
        carrierId: '3',
        carrierName: 'Southern Express Transport',
        documentType: 'AUTHORITY_LETTER',
        uploadedAt: '2025-01-10T14:00:00Z',
        status: 'REJECTED',
        rejectionReason: 'Document is expired. Please upload current authority letter.',
      },
    ]);

    setLoading(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      LOW: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      DISMISSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      FMCSA: '🏛️',
      INSURANCE: '🛡️',
      DOCUMENT: '📄',
      SAFETY: '⚠️',
    };
    return icons[type] || '📋';
  };

  const getComplianceStatus = (carrier: CarrierCompliance) => {
    if (carrier.fmcsaStatus === 'REVOKED') return { label: 'Non-Compliant', color: 'bg-red-100 text-red-800' };
    if (carrier.insuranceStatus === 'EXPIRED') return { label: 'Insurance Issue', color: 'bg-red-100 text-red-800' };
    if (carrier.insuranceStatus === 'EXPIRING') return { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' };
    if (carrier.documentStatus === 'INCOMPLETE') return { label: 'Docs Incomplete', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Compliant', color: 'bg-green-100 text-green-800' };
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter && alert.severity !== severityFilter) return false;
    if (typeFilter && alert.type !== typeFilter) return false;
    return alert.status === 'OPEN' || alert.status === 'IN_PROGRESS';
  });

  const stats = {
    critical: alerts.filter(a => a.severity === 'CRITICAL' && (a.status === 'OPEN' || a.status === 'IN_PROGRESS')).length,
    high: alerts.filter(a => a.severity === 'HIGH' && (a.status === 'OPEN' || a.status === 'IN_PROGRESS')).length,
    nonCompliant: carriers.filter(c => c.fmcsaStatus === 'REVOKED' || c.insuranceStatus === 'EXPIRED').length,
    pendingDocs: documents.filter(d => d.status === 'PENDING_REVIEW').length,
  };

  if (loading) {
    return <div className="p-8">Loading compliance monitor...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Monitor</h1>
          <p className="text-gray-600">Track carrier compliance, alerts, and document status</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Run FMCSA Check
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Critical Alerts</div>
          <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-xs text-gray-400">Requires immediate action</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="text-sm text-gray-500">High Priority Alerts</div>
          <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-xs text-gray-400">Needs attention soon</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Non-Compliant Carriers</div>
          <div className="text-3xl font-bold text-red-600">{stats.nonCompliant}</div>
          <div className="text-xs text-gray-400">Cannot dispatch loads</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Documents Pending Review</div>
          <div className="text-3xl font-bold text-blue-600">{stats.pendingDocs}</div>
          <div className="text-xs text-gray-400">Awaiting verification</div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {stats.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <div className="font-medium text-red-800">Critical Compliance Issues Detected</div>
            <div className="text-sm text-red-600 mt-1">
              {stats.critical} carrier(s) have critical compliance issues that require immediate action.
              These carriers should not be dispatched until issues are resolved.
            </div>
          </div>
          <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
            View All
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 'alerts'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-slate-500 hover:text-gray-700'
          }`}
        >
          Active Alerts ({filteredAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('carriers')}
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 'carriers'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-slate-500 hover:text-gray-700'
          }`}
        >
          Carrier Compliance ({carriers.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 'documents'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-slate-500 hover:text-gray-700'
          }`}
        >
          Document Queue ({documents.length})
        </button>
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              <option value="FMCSA">FMCSA</option>
              <option value="INSURANCE">Insurance</option>
              <option value="DOCUMENT">Document</option>
              <option value="SAFETY">Safety</option>
            </select>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{alert.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status.replace('_', ' ')}
                        </span>
                      </div>
                      <Link
                        href={`/carriers/${alert.carrierId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {alert.carrierName}
                      </Link>
                      <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                      <div className="text-xs text-gray-400 mt-2">
                        Created: {new Date(alert.createdAt).toLocaleString()}
                        {alert.assignedTo && ` • Assigned to: ${alert.assignedTo}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      Assign
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carriers Tab */}
      {activeTab === 'carriers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Carrier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">MC/DOT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">FMCSA Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Safety Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Insurance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Overall</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {carriers.map((carrier) => {
                const overall = getComplianceStatus(carrier);
                return (
                  <tr key={carrier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/carriers/${carrier.id}`} className="text-blue-600 hover:underline font-medium">
                        {carrier.name}
                      </Link>
                      <div className="text-xs text-gray-500">{carrier.tier}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{carrier.mcNumber}</div>
                      <div className="text-gray-500">{carrier.dotNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        carrier.fmcsaStatus === 'AUTHORIZED' ? 'bg-green-100 text-green-800' :
                        carrier.fmcsaStatus === 'REVOKED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {carrier.fmcsaStatus}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        Last check: {carrier.lastFmcsaCheck}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {carrier.safetyRating ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          carrier.safetyRating === 'SATISFACTORY' ? 'bg-green-100 text-green-800' :
                          carrier.safetyRating === 'CONDITIONAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {carrier.safetyRating}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        carrier.insuranceStatus === 'CURRENT' ? 'bg-green-100 text-green-800' :
                        carrier.insuranceStatus === 'EXPIRING' ? 'bg-yellow-100 text-yellow-800' :
                        carrier.insuranceStatus === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {carrier.insuranceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        carrier.documentStatus === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {carrier.documentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${overall.color}`}>
                        {overall.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {carrier.alertCount > 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          {carrier.alertCount}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Carrier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Document Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/carriers/${doc.carrierId}`} className="text-blue-600 hover:underline font-medium">
                      {doc.carrierName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {doc.documentType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                    {doc.rejectionReason && (
                      <div className="text-xs text-red-600 mt-1">{doc.rejectionReason}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      {doc.status === 'PENDING_REVIEW' && (
                        <>
                          <button className="text-green-600 hover:text-green-800 text-sm">Approve</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
