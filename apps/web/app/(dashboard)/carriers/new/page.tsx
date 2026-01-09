'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'company', title: 'Company Info', description: 'Basic company details' },
  { id: 'contact', title: 'Contact Info', description: 'Primary contacts' },
  { id: 'equipment', title: 'Equipment', description: 'Fleet information' },
  { id: 'insurance', title: 'Insurance', description: 'Insurance certificates' },
  { id: 'documents', title: 'Documents', description: 'Required documents' },
  { id: 'review', title: 'Review', description: 'Final review' },
];

export default function CarrierOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Company Info
    mcNumber: '',
    dotNumber: '',
    legalName: '',
    dbaName: '',
    companyType: 'LLC',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    // Contact
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    contactRole: 'OWNER',
    // Equipment
    equipmentTypes: [] as string[],
    truckCount: 0,
    trailerCount: 0,
    serviceStates: [] as string[],
    // Payment
    paymentMethod: 'CHECK',
    paymentTerms: 30,
  });

  const [lookingUp, setLookingUp] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookupMC = async () => {
    if (!formData.mcNumber) return;
    setLookingUp(true);
    // Simulate FMCSA lookup
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormData((prev) => ({
      ...prev,
      dotNumber: '1234567',
      legalName: 'Sample Carrier LLC',
      address: '123 Main Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      phone: '312-555-0100',
    }));
    setLookingUp(false);
  };

  const handleEquipmentToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      equipmentTypes: prev.equipmentTypes.includes(type)
        ? prev.equipmentTypes.filter((t) => t !== type)
        : [...prev.equipmentTypes, type],
    }));
  };

  const handleStateToggle = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceStates: prev.serviceStates.includes(state)
        ? prev.serviceStates.filter((s) => s !== state)
        : [...prev.serviceStates, state],
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Submit carrier data
    console.log('Submitting carrier:', formData);
    // Redirect to carriers list
    router.push('/carriers');
  };

  const equipmentTypes = [
    'DRY_VAN',
    'REEFER',
    'FLATBED',
    'STEP_DECK',
    'LOWBOY',
    'TANKER',
    'HOPPER',
    'POWER_ONLY',
    'CONTAINER',
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/carriers" className="text-gray-500 hover:text-gray-700">
          ← Back to Carriers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Carrier Onboarding</h1>
        <p className="text-gray-600">Complete the wizard to add a new carrier to your network</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-12 md:w-24 h-1 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="text-center" style={{ width: '100px' }}>
              <div
                className={`text-xs font-medium ${
                  index === currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            
            {/* MC/DOT Lookup */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">MC Number *</label>
                <input
                  type="text"
                  name="mcNumber"
                  value={formData.mcNumber}
                  onChange={handleInputChange}
                  placeholder="MC-123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleLookupMC}
                disabled={lookingUp || !formData.mcNumber}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {lookingUp ? 'Looking up...' : '🔍 Lookup FMCSA'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DOT Number *</label>
                <input
                  type="text"
                  name="dotNumber"
                  value={formData.dotNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name *</label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DBA Name</label>
                <input
                  type="text"
                  name="dbaName"
                  value={formData.dbaName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="LLC">LLC</option>
                  <option value="CORP">Corporation</option>
                  <option value="SOLE_PROP">Sole Proprietorship</option>
                  <option value="PARTNERSHIP">Partnership</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Primary Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="contactFirstName"
                  value={formData.contactFirstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="contactLastName"
                  value={formData.contactLastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="contactRole"
                value={formData.contactRole}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="OWNER">Owner</option>
                <option value="DISPATCHER">Dispatcher</option>
                <option value="ACCOUNTING">Accounting</option>
                <option value="SAFETY">Safety</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Equipment & Service Area</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Types</label>
              <div className="flex flex-wrap gap-2">
                {equipmentTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleEquipmentToggle(type)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${
                      formData.equipmentTypes.includes(type)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Truck Count</label>
                <input
                  type="number"
                  name="truckCount"
                  value={formData.truckCount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trailer Count</label>
                <input
                  type="number"
                  name="trailerCount"
                  value={formData.trailerCount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service States</label>
              <div className="flex flex-wrap gap-1">
                {states.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleStateToggle(state)}
                    className={`px-2 py-1 rounded text-xs ${
                      formData.serviceStates.includes(state)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Insurance Certificates</h2>
            <p className="text-gray-600">Upload insurance certificates for verification.</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-gray-600 mb-2">Drag and drop insurance certificates here</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Browse Files
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800">Required Insurance:</h4>
              <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                <li>• Auto Liability (minimum $1,000,000)</li>
                <li>• Cargo Insurance (minimum $100,000)</li>
                <li>• General Liability (recommended)</li>
                <li>• Workers Compensation (if applicable)</li>
              </ul>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Required Documents</h2>
            <p className="text-gray-600">Upload required compliance documents.</p>
            
            <div className="space-y-4">
              {['W9 Form', 'Carrier Agreement', 'Authority Letter', 'Void Check (for ACH)'].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{doc}</div>
                    <div className="text-sm text-gray-500">Required for onboarding</div>
                  </div>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                    Upload
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
            <p className="text-gray-600">Review the carrier information before submitting.</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Company Info</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">MC Number:</dt>
                    <dd className="font-medium">{formData.mcNumber || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">DOT Number:</dt>
                    <dd className="font-medium">{formData.dotNumber || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Legal Name:</dt>
                    <dd className="font-medium">{formData.legalName || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Location:</dt>
                    <dd className="font-medium">{formData.city}, {formData.state}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Primary Contact</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Name:</dt>
                    <dd className="font-medium">{formData.contactFirstName} {formData.contactLastName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Email:</dt>
                    <dd className="font-medium">{formData.contactEmail || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Phone:</dt>
                    <dd className="font-medium">{formData.contactPhone || 'N/A'}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Equipment</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.equipmentTypes.map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  {formData.truckCount} trucks, {formData.trailerCount} trailers
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Service Area</h3>
                <div className="flex flex-wrap gap-1">
                  {formData.serviceStates.map((state) => (
                    <span key={state} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                ✓ By submitting, you confirm that all information is accurate and the carrier will be added with PENDING status for compliance review.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back
        </button>
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit Carrier
          </button>
        )}
      </div>
    </div>
  );
}
