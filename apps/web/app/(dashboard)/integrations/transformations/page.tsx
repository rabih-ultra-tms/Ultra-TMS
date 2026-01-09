'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  PlusIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CodeBracketIcon,
  ArrowsRightLeftIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock transformations
const mockTransformations = [
  {
    id: '1',
    name: 'DAT Load to TMS Load',
    description: 'Transform DAT load board format to internal TMS load structure',
    sourceIntegration: 'DAT Load Board',
    sourceLogo: '🚚',
    targetEntity: 'Load',
    isActive: true,
    mappings: 12,
    lastUsed: new Date(Date.now() - 3600000),
    executionCount: 4523,
    errorRate: 0.2,
  },
  {
    id: '2',
    name: 'QuickBooks Invoice Sync',
    description: 'Map TMS invoice fields to QuickBooks invoice format',
    sourceIntegration: 'QuickBooks Online',
    sourceLogo: '💰',
    targetEntity: 'Invoice',
    isActive: true,
    mappings: 18,
    lastUsed: new Date(Date.now() - 86400000),
    executionCount: 890,
    errorRate: 0,
  },
  {
    id: '3',
    name: 'HubSpot Contact Mapping',
    description: 'Transform HubSpot contacts to TMS customer format',
    sourceIntegration: 'HubSpot CRM',
    sourceLogo: '🎯',
    targetEntity: 'Customer',
    isActive: false,
    mappings: 15,
    lastUsed: new Date(Date.now() - 604800000),
    executionCount: 234,
    errorRate: 5.2,
  },
  {
    id: '4',
    name: 'ELD Driver Hours',
    description: 'Parse Samsara ELD data into driver hours format',
    sourceIntegration: 'Samsara ELD',
    sourceLogo: '📍',
    targetEntity: 'DriverHours',
    isActive: true,
    mappings: 8,
    lastUsed: new Date(Date.now() - 7200000),
    executionCount: 12450,
    errorRate: 0.1,
  },
];

const mockTransformationDetail = {
  id: '1',
  name: 'DAT Load to TMS Load',
  mappings: [
    { id: '1', source: 'load_id', target: 'externalId', type: 'direct' },
    { id: '2', source: 'origin_city', target: 'origin.city', type: 'direct' },
    { id: '3', source: 'origin_state', target: 'origin.state', type: 'direct' },
    { id: '4', source: 'origin_zip', target: 'origin.postalCode', type: 'direct' },
    { id: '5', source: 'dest_city', target: 'destination.city', type: 'direct' },
    { id: '6', source: 'dest_state', target: 'destination.state', type: 'direct' },
    { id: '7', source: 'equipment_type', target: 'equipmentType', type: 'lookup', lookup: 'EQUIPMENT_TYPES' },
    { id: '8', source: 'rate', target: 'agreedRate', type: 'transform', transform: 'parseFloat' },
    { id: '9', source: 'pickup_date', target: 'pickupDate', type: 'transform', transform: 'parseDate' },
    { id: '10', source: 'delivery_date', target: 'deliveryDate', type: 'transform', transform: 'parseDate' },
    { id: '11', source: 'weight', target: 'weight', type: 'transform', transform: 'parseInt' },
    { id: '12', source: 'miles', target: 'distance', type: 'transform', transform: 'parseInt' },
  ],
};

const typeColors: Record<string, string> = {
  direct: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  lookup: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  transform: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  computed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function TransformationsPage() {
  const [selectedTransformation, setSelectedTransformation] = useState<typeof mockTransformations[0] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const handlePreview = () => {
    setShowPreview(true);
    // Mock preview result
    setPreviewResult(JSON.stringify({
      externalId: 'DAT-12345',
      origin: { city: 'Los Angeles', state: 'CA', postalCode: '90001' },
      destination: { city: 'Chicago', state: 'IL', postalCode: '60601' },
      equipmentType: 'DRY_VAN',
      agreedRate: 2500.00,
      pickupDate: '2024-02-15T08:00:00Z',
      deliveryDate: '2024-02-18T14:00:00Z',
      weight: 42000,
      distance: 2015,
    }, null, 2));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Transformations"
        subtitle="Configure how data is mapped between integrations and TMS"
      >
        <Link href="/integrations">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Integrations
          </Button>
        </Link>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Transformation
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transformations List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Transformations</h3>
          
          {mockTransformations.map(transformation => (
            <Card 
              key={transformation.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedTransformation?.id === transformation.id 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : ''
              }`}
              onClick={() => setSelectedTransformation(transformation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{transformation.sourceLogo}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{transformation.name}</h4>
                      <Badge variant={transformation.isActive ? 'green' : 'gray'}>
                        {transformation.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{transformation.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{transformation.mappings} mappings</span>
                      <span>{transformation.executionCount.toLocaleString()} executions</span>
                      <span className={transformation.errorRate > 1 ? 'text-red-500' : ''}>
                        {transformation.errorRate}% errors
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Transformation Detail / Editor */}
        <div>
          {selectedTransformation ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTransformation.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedTransformation.sourceIntegration} → {selectedTransformation.targetEntity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreview}>
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Field Mappings */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">Field Mappings</span>
                </div>

                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Source</th>
                        <th className="px-3 py-2 text-center w-12">→</th>
                        <th className="px-3 py-2 text-left font-medium">Target</th>
                        <th className="px-3 py-2 text-left font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {mockTransformationDetail.mappings.map(mapping => (
                        <tr key={mapping.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-3 py-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                              {mapping.source}
                            </code>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <ArrowRightIcon className="h-4 w-4 text-gray-400 mx-auto" />
                          </td>
                          <td className="px-3 py-2">
                            <code className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded text-blue-700 dark:text-blue-300">
                              {mapping.target}
                            </code>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${typeColors[mapping.type]}`}>
                              {mapping.type}
                              {mapping.transform && `: ${mapping.transform}`}
                              {mapping.lookup && `: ${mapping.lookup}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button variant="outline" size="sm" className="mt-3">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Mapping
                </Button>
              </div>

              {/* Preview Result */}
              {showPreview && previewResult && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CodeBracketIcon className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">Preview Result</span>
                    </div>
                    <Badge variant="green">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                    {previewResult}
                  </pre>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <ArrowsRightLeftIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Transformation</h3>
              <p className="text-gray-500 mb-4">
                Choose a transformation from the list to view and edit its field mappings.
              </p>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Transformation
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Transformation Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{mockTransformations.length}</p>
            <p className="text-sm text-gray-500">Total Transformations</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {mockTransformations.filter(t => t.isActive).length}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {mockTransformations.reduce((sum, t) => sum + t.executionCount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Executions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {(mockTransformations.reduce((sum, t) => sum + t.errorRate, 0) / mockTransformations.length).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Avg Error Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
