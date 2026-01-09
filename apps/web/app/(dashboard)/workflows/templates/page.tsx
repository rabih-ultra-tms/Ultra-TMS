'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  DocumentDuplicateIcon,
  PlusIcon,
  PlayIcon,
  CubeTransparentIcon,
  MagnifyingGlassIcon,
  TagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock templates data
const mockTemplates = [
  {
    id: 't1',
    name: 'Load Approval Workflow',
    description: 'Standard workflow for approving new load orders based on value thresholds and customer credit.',
    category: 'LOAD_PROCESSING',
    isSystem: true,
    isPopular: true,
    stepsCount: 5,
    usageCount: 156,
    tags: ['loads', 'approval', 'automation'],
    previewSteps: ['Check Value', 'Auto-Approve', 'Manager Review', 'Notify', 'Update Status'],
  },
  {
    id: 't2',
    name: 'Carrier Onboarding',
    description: 'Complete carrier registration workflow including document verification, compliance check, and approval chain.',
    category: 'CARRIER_MANAGEMENT',
    isSystem: true,
    isPopular: true,
    stepsCount: 8,
    usageCount: 89,
    tags: ['carrier', 'onboarding', 'compliance'],
    previewSteps: ['Collect Docs', 'Verify Insurance', 'Check Authority', 'Compliance Review', 'Final Approval'],
  },
  {
    id: 't3',
    name: 'Invoice Processing',
    description: 'Automated invoice generation and approval workflow with multi-level approval based on amount.',
    category: 'ACCOUNTING',
    isSystem: true,
    isPopular: false,
    stepsCount: 6,
    usageCount: 67,
    tags: ['invoice', 'accounting', 'finance'],
    previewSteps: ['Generate Invoice', 'Calculate Totals', 'Check Threshold', 'Get Approval', 'Send Invoice'],
  },
  {
    id: 't4',
    name: 'Document Verification',
    description: 'Verify and process uploaded driver documents with automatic expiration tracking.',
    category: 'DOCUMENT_WORKFLOW',
    isSystem: true,
    isPopular: false,
    stepsCount: 4,
    usageCount: 234,
    tags: ['documents', 'verification', 'drivers'],
    previewSteps: ['Receive Document', 'Validate Format', 'Extract Data', 'Update Records'],
  },
  {
    id: 't5',
    name: 'Customer Credit Review',
    description: 'Periodic credit review workflow for existing customers based on payment history and usage.',
    category: 'CUSTOMER',
    isSystem: true,
    isPopular: true,
    stepsCount: 7,
    usageCount: 45,
    tags: ['credit', 'customer', 'review'],
    previewSteps: ['Pull Credit Report', 'Analyze History', 'Calculate Score', 'Determine Action', 'Notify'],
  },
  {
    id: 't6',
    name: 'Claims Processing',
    description: 'Handle cargo claims from initial report through investigation and resolution.',
    category: 'CLAIMS',
    isSystem: true,
    isPopular: false,
    stepsCount: 9,
    usageCount: 23,
    tags: ['claims', 'investigation', 'resolution'],
    previewSteps: ['Log Claim', 'Gather Evidence', 'Investigate', 'Determine Liability', 'Resolve'],
  },
];

const categoryColors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'> = {
  LOAD_PROCESSING: 'blue',
  CARRIER_MANAGEMENT: 'green',
  ACCOUNTING: 'yellow',
  DOCUMENT_WORKFLOW: 'purple',
  CUSTOMER: 'red',
  CLAIMS: 'gray',
};

export default function WorkflowTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesPopular = !showPopularOnly || template.isPopular;
    return matchesSearch && matchesCategory && matchesPopular;
  });

  const categories = [...new Set(mockTemplates.map(t => t.category))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Templates"
        subtitle="Pre-built workflow templates to get you started quickly"
      >
        <Link href="/workflows">
          <Button variant="outline">
            <CubeTransparentIcon className="h-4 w-4 mr-2" />
            My Workflows
          </Button>
        </Link>
        <Link href="/workflows/templates/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <Button 
            variant={showPopularOnly ? 'primary' : 'outline'}
            onClick={() => setShowPopularOnly(!showPopularOnly)}
          >
            <StarIcon className="h-4 w-4 mr-2" />
            Popular
          </Button>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant={categoryColors[template.category] || 'gray'}>
                  {template.category.replace(/_/g, ' ')}
                </Badge>
                {template.isSystem && (
                  <Badge variant="blue">System</Badge>
                )}
              </div>
              {template.isPopular && (
                <StarIconSolid className="h-5 w-5 text-yellow-400" />
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {template.description}
            </p>

            {/* Steps Preview */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Steps preview:</p>
              <div className="flex flex-wrap gap-1">
                {template.previewSteps.slice(0, 4).map((step, i) => (
                  <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {step}
                  </span>
                ))}
                {template.previewSteps.length > 4 && (
                  <span className="text-xs text-gray-500">+{template.previewSteps.length - 4} more</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.map(tag => (
                <span key={tag} className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                  <TagIcon className="h-3 w-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{template.stepsCount} steps</span>
              <span>{template.usageCount} uses</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/workflows/templates/${template.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Preview
                </Button>
              </Link>
              <Link href={`/workflows/new?template=${template.id}`} className="flex-1">
                <Button className="w-full">
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Use
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <DocumentDuplicateIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters
          </p>
          <Button onClick={() => { setSearchTerm(''); setSelectedCategory(''); setShowPopularOnly(false); }}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
