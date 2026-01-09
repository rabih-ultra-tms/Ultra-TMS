'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Carrier {
  id: string;
  mcNumber: string;
  dotNumber: string;
  scacCode: string | null;
  legalName: string;
  dbaName: string | null;
  companyType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax: string | null;
  email: string;
  website: string | null;
  dispatchEmail: string | null;
  dispatchPhone: string | null;
  afterHoursPhone: string | null;
  status: string;
  qualificationTier: string;
  equipmentTypes: string[];
  serviceStates: string[];
  truckCount: number;
  trailerCount: number;
  paymentTerms: number;
  paymentMethod: string;
  w9OnFile: boolean;
  fmcsaAuthorityStatus: string | null;
  fmcsaSafetyRating: string | null;
  fmcsaOutOfService: boolean;
  fmcsaLastChecked: string | null;
  complianceScore: number | null;
  safetyScore: number | null;
  totalLoadsCompleted: number;
  onTimePickupRate: number;
  onTimeDeliveryRate: number;
  claimsRate: number;
  avgRating: number;
  preferredLanguage: string;
  notes: string | null;
  createdAt: string;
}

interface CarrierContact {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  role: string;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
}

interface InsuranceCertificate {
  id: string;
  insuranceType: string;
  policyNumber: string;
  insurerName: string;
  coverageAmount: number;
  effectiveDate: string;
  expirationDate: string;
  isVerified: boolean;
  status: string;
}

interface CarrierDocument {
  id: string;
  documentType: string;
  name: string;
  reviewStatus: string;
  createdAt: string;
}

export default function CarrierDetailPage() {
  const params = useParams();
  const carrierId = params.id as string;
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [contacts, setContacts] = useState<CarrierContact[]>([]);
  const [insurance, setInsurance] = useState<InsuranceCertificate[]>([]);
  const [documents, setDocuments] = useState<CarrierDocument[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setCarrier({
      id: carrierId,
      mcNumber: 'MC-123456',
      dotNumber: '1234567',
      scacCode: 'SWFT',
      legalName: 'Swift Transport LLC',
      dbaName: 'Swift Logistics',
      companyType: 'LLC',
      address: '123 Freight Way',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      phone: '312-555-0100',
      fax: '312-555-0101',
      email: 'dispatch@swifttransport.com',
      website: 'www.swifttransport.com',
      dispatchEmail: 'dispatch@swifttransport.com',
      dispatchPhone: '312-555-0102',
      afterHoursPhone: '312-555-0199',
      status: 'ACTIVE',
      qualificationTier: 'PLATINUM',
      equipmentTypes: ['DRY_VAN', 'REEFER'],
      serviceStates: ['IL', 'IN', 'WI', 'MI', 'OH', 'IA', 'MO'],
      truckCount: 45,
      trailerCount: 60,
      paymentTerms: 30,
      paymentMethod: 'ACH',
      w9OnFile: true,
      fmcsaAuthorityStatus: 'AUTHORIZED',
      fmcsaSafetyRating: 'SATISFACTORY',
      fmcsaOutOfService: false,
      fmcsaLastChecked: '2025-01-07',
      complianceScore: 95.5,
      safetyScore: 92.0,
      totalLoadsCompleted: 245,
      onTimePickupRate: 97.2,
      onTimeDeliveryRate: 98.5,
      claimsRate: 0.4,
      avgRating: 4.8,
      preferredLanguage: 'en',
      notes: 'Preferred carrier for Chicago area. Contact dispatch for urgent loads.',
      createdAt: '2024-03-15',
    });

    setContacts([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        title: 'Owner',
        role: 'OWNER',
        email: 'john.smith@swifttransport.com',
        phone: '312-555-0100',
        isPrimary: true,
      },
      {
        id: '2',
        firstName: 'Maria',
        lastName: 'Garcia',
        title: 'Dispatch Manager',
        role: 'DISPATCHER',
        email: 'maria@swifttransport.com',
        phone: '312-555-0102',
        isPrimary: false,
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        title: 'Accounting',
        role: 'ACCOUNTING',
        email: 'accounting@swifttransport.com',
        phone: '312-555-0103',
        isPrimary: false,
      },
    ]);

    setInsurance([
      {
        id: '1',
        insuranceType: 'AUTO_LIABILITY',
        policyNumber: 'AL-2025-001234',
        insurerName: 'Progressive Commercial',
        coverageAmount: 1000000,
        effectiveDate: '2025-01-01',
        expirationDate: '2026-01-01',
        isVerified: true,
        status: 'ACTIVE',
      },
      {
        id: '2',
        insuranceType: 'CARGO',
        policyNumber: 'CG-2025-005678',
        insurerName: 'Great West Casualty',
        coverageAmount: 100000,
        effectiveDate: '2025-01-01',
        expirationDate: '2026-01-01',
        isVerified: true,
        status: 'ACTIVE',
      },
      {
        id: '3',
        insuranceType: 'GENERAL_LIABILITY',
        policyNumber: 'GL-2025-009012',
        insurerName: 'Liberty Mutual',
        coverageAmount: 2000000,
        effectiveDate: '2025-01-01',
        expirationDate: '2026-01-01',
        isVerified: true,
        status: 'ACTIVE',
      },
    ]);

    setDocuments([
      {
        id: '1',
        documentType: 'W9',
        name: 'W9 Form 2024',
        reviewStatus: 'APPROVED',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        documentType: 'CARRIER_AGREEMENT',
        name: 'Carrier Agreement 2024',
        reviewStatus: 'APPROVED',
        createdAt: '2024-03-15',
      },
      {
        id: '3',
        documentType: 'AUTHORITY_LETTER',
        name: 'MC Authority',
        reviewStatus: 'APPROVED',
        createdAt: '2024-03-15',
      },
    ]);

    setLoading(false);
  }, [carrierId]);

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

  if (loading || !carrier) {
    return <div className="p-8">Loading carrier details...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/carriers" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{carrier.legalName}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(carrier.status)}`}>
              {carrier.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(carrier.qualificationTier)}`}>
              {carrier.qualificationTier}
            </span>
          </div>
          {carrier.dbaName && (
            <p className="text-gray-600 mt-1">DBA: {carrier.dbaName}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {carrier.mcNumber} • DOT: {carrier.dotNumber}
            {carrier.scacCode && ` • SCAC: ${carrier.scacCode}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50">
            🔄 Verify FMCSA
          </button>
          <Link
            href={`/carriers/${carrierId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Carrier
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['profile', 'compliance', 'documents', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
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
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Legal Name</dt>
                <dd className="text-sm font-medium text-gray-900">{carrier.legalName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Company Type</dt>
                <dd className="text-sm font-medium text-gray-900">{carrier.companyType}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Address</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {carrier.address}<br />
                  {carrier.city}, {carrier.state} {carrier.zipCode}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{carrier.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-blue-600">{carrier.email}</dd>
              </div>
              {carrier.website && (
                <div>
                  <dt className="text-sm text-gray-500">Website</dt>
                  <dd className="text-sm font-medium text-blue-600">{carrier.website}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Dispatch Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispatch Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Dispatch Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{carrier.dispatchPhone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Dispatch Email</dt>
                <dd className="text-sm font-medium text-blue-600">{carrier.dispatchEmail || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">After Hours</dt>
                <dd className="text-sm font-medium text-gray-900">{carrier.afterHoursPhone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Preferred Language</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {carrier.preferredLanguage === 'en' ? 'English' : 'Spanish'}
                </dd>
              </div>
            </dl>

            <h4 className="text-md font-semibold text-gray-900 mt-6 mb-3">Contacts</h4>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                        {contact.isPrimary && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{contact.title || contact.role}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {contact.phone && <div>📞 {contact.phone}</div>}
                    {contact.email && <div>✉️ {contact.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment & Service */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment & Service</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Equipment Types</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {carrier.equipmentTypes.map((type) => (
                      <span key={type} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        {type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Fleet Size</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {carrier.truckCount} trucks, {carrier.trailerCount} trailers
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Service States</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {carrier.serviceStates.map((state) => (
                      <span key={state} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {state}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            </dl>

            <h4 className="text-md font-semibold text-gray-900 mt-6 mb-3">Payment</h4>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Payment Terms</dt>
                <dd className="text-sm font-medium text-gray-900">Net {carrier.paymentTerms}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Payment Method</dt>
                <dd className="text-sm font-medium text-gray-900">{carrier.paymentMethod}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">W9 On File</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {carrier.w9OnFile ? '✅ Yes' : '❌ No'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* FMCSA Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">FMCSA Status</h3>
              <span className="text-sm text-gray-500">
                Last checked: {carrier.fmcsaLastChecked || 'Never'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Authority Status</div>
                <div className="text-lg font-semibold text-green-600">
                  {carrier.fmcsaAuthorityStatus || 'Unknown'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Safety Rating</div>
                <div className="text-lg font-semibold text-green-600">
                  {carrier.fmcsaSafetyRating || 'Unknown'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Out of Service</div>
                <div className={`text-lg font-semibold ${carrier.fmcsaOutOfService ? 'text-red-600' : 'text-green-600'}`}>
                  {carrier.fmcsaOutOfService ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Compliance Score</div>
                <div className="text-lg font-semibold text-blue-600">
                  {carrier.complianceScore ? `${carrier.complianceScore}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Insurance Certificates</h3>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                + Add Insurance
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Policy #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Insurer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {insurance.map((ins) => (
                  <tr key={ins.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {ins.insuranceType.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ins.policyNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ins.insurerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ${ins.coverageAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ins.expirationDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ins.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ins.status}
                        {ins.isVerified && ' ✓'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              + Upload Document
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {doc.documentType.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      doc.reviewStatus === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : doc.reviewStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.reviewStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-800">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Loads</div>
              <div className="text-2xl font-bold text-gray-900">{carrier.totalLoadsCompleted}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">On-Time Pickup</div>
              <div className="text-2xl font-bold text-green-600">{carrier.onTimePickupRate}%</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">On-Time Delivery</div>
              <div className="text-2xl font-bold text-green-600">{carrier.onTimeDeliveryRate}%</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Claims Rate</div>
              <div className="text-2xl font-bold text-yellow-600">{carrier.claimsRate}%</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Avg Rating</div>
              <div className="text-2xl font-bold text-blue-600">⭐ {carrier.avgRating}</div>
            </div>
          </div>

          {/* Qualification Tier Explanation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Qualification</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { tier: 'PLATINUM', loads: '100+', otd: '95%+', color: 'purple' },
                { tier: 'GOLD', loads: '50+', otd: '90%+', color: 'yellow' },
                { tier: 'SILVER', loads: '20+', otd: '85%+', color: 'gray' },
                { tier: 'BRONZE', loads: '5+', otd: 'Any', color: 'orange' },
                { tier: 'UNQUALIFIED', loads: '<5', otd: 'N/A', color: 'gray' },
              ].map((t) => (
                <div
                  key={t.tier}
                  className={`p-4 rounded-lg border-2 ${
                    carrier.qualificationTier === t.tier
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className={`font-semibold text-${t.color}-600`}>{t.tier}</div>
                  <div className="text-sm text-gray-600">{t.loads} loads</div>
                  <div className="text-sm text-gray-600">{t.otd} OTD</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {carrier.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Notes</h4>
          <p className="text-yellow-700">{carrier.notes}</p>
        </div>
      )}
    </div>
  );
}
