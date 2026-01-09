'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TruckIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock integration providers
const mockProviders = [
  {
    code: 'DAT',
    name: 'DAT Load Board',
    category: 'LOAD_BOARD',
    description: 'Access millions of loads and trucks from the largest load board network.',
    logo: '🚚',
    authType: 'API_KEY',
    supportsWebhooks: true,
    supportsRealtime: true,
    isPopular: true,
    isConnected: true,
  },
  {
    code: 'TRUCKSTOP',
    name: 'Truckstop.com',
    category: 'LOAD_BOARD',
    description: 'Connect to Truckstop.com for load posting and truck search.',
    logo: '📦',
    authType: 'API_KEY',
    supportsWebhooks: true,
    supportsRealtime: true,
    isPopular: true,
    isConnected: false,
  },
  {
    code: 'QUICKBOOKS',
    name: 'QuickBooks Online',
    category: 'ACCOUNTING',
    description: 'Sync invoices, payments, and customers with QuickBooks Online.',
    logo: '💰',
    authType: 'OAUTH2',
    supportsWebhooks: true,
    supportsRealtime: false,
    isPopular: true,
    isConnected: true,
  },
  {
    code: 'SAMSARA',
    name: 'Samsara ELD',
    category: 'ELD',
    description: 'Real-time GPS tracking, ELD compliance, and fleet management.',
    logo: '📍',
    authType: 'API_KEY',
    supportsWebhooks: true,
    supportsRealtime: true,
    isPopular: true,
    isConnected: false,
  },
  {
    code: 'KEEPTRUCKIN',
    name: 'KeepTruckin (Motive)',
    category: 'ELD',
    description: 'ELD compliance, GPS tracking, and fleet operations platform.',
    logo: '🛰️',
    authType: 'OAUTH2',
    supportsWebhooks: true,
    supportsRealtime: true,
    isPopular: false,
    isConnected: false,
  },
  {
    code: 'HUBSPOT',
    name: 'HubSpot CRM',
    category: 'CRM',
    description: 'Sync contacts, companies, and deals with HubSpot CRM.',
    logo: '🎯',
    authType: 'OAUTH2',
    supportsWebhooks: true,
    supportsRealtime: false,
    isPopular: true,
    isConnected: true,
  },
  {
    code: 'TWILIO',
    name: 'Twilio',
    category: 'COMMUNICATION',
    description: 'SMS and voice communication for load notifications and updates.',
    logo: '📱',
    authType: 'API_KEY',
    supportsWebhooks: true,
    supportsRealtime: true,
    isPopular: false,
    isConnected: false,
  },
  {
    code: 'STRIPE',
    name: 'Stripe',
    category: 'PAYMENT',
    description: 'Accept credit card payments and manage billing.',
    logo: '💳',
    authType: 'API_KEY',
    supportsWebhooks: true,
    supportsRealtime: true,
    isPopular: true,
    isConnected: false,
  },
  {
    code: 'RMIS',
    name: 'RMIS',
    category: 'RATING',
    description: 'Carrier ratings, safety scores, and compliance data.',
    logo: '⭐',
    authType: 'API_KEY',
    supportsWebhooks: false,
    supportsRealtime: false,
    isPopular: false,
    isConnected: false,
  },
  {
    code: 'DOCUSIGN',
    name: 'DocuSign',
    category: 'DOCUMENT',
    description: 'Electronic signatures for rate confirmations and contracts.',
    logo: '✍️',
    authType: 'OAUTH2',
    supportsWebhooks: true,
    supportsRealtime: false,
    isPopular: false,
    isConnected: false,
  },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  LOAD_BOARD: TruckIcon,
  ACCOUNTING: CurrencyDollarIcon,
  ELD: GlobeAltIcon,
  CRM: ChartBarIcon,
  COMMUNICATION: ChatBubbleLeftRightIcon,
  PAYMENT: CurrencyDollarIcon,
  RATING: StarIcon,
  DOCUMENT: DocumentTextIcon,
};

const categoryColors: Record<string, string> = {
  LOAD_BOARD: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  ACCOUNTING: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  ELD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  CRM: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  COMMUNICATION: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  PAYMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  RATING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  DOCUMENT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export default function IntegrationsMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || provider.category === selectedCategory;
    const matchesConnected = !showConnectedOnly || provider.isConnected;
    return matchesSearch && matchesCategory && matchesConnected;
  });

  const categories = [...new Set(mockProviders.map(p => p.category))];
  const connectedCount = mockProviders.filter(p => p.isConnected).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect Ultra-TMS with your favorite tools and services"
      >
        <Link href="/integrations/my">
          <Button variant="outline">
            <PuzzlePieceIcon className="h-4 w-4 mr-2" />
            My Integrations ({connectedCount})
          </Button>
        </Link>
      </PageHeader>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {categories.map(cat => {
          const Icon = categoryIcons[cat] || PuzzlePieceIcon;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <Button 
            variant={showConnectedOnly ? 'primary' : 'outline'}
            onClick={() => setShowConnectedOnly(!showConnectedOnly)}
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Connected Only
          </Button>
        </div>
      </Card>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map(provider => (
          <Card key={provider.code} className="p-6 hover:shadow-lg transition-shadow relative">
            {provider.isConnected && (
              <div className="absolute top-4 right-4">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">{provider.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{provider.name}</h3>
                  {provider.isPopular && (
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${categoryColors[provider.category]}`}>
                  {provider.category.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {provider.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {provider.authType.replace(/_/g, ' ')}
              </span>
              {provider.supportsWebhooks && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  Webhooks
                </span>
              )}
              {provider.supportsRealtime && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  Realtime
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {provider.isConnected ? (
                <>
                  <Link href={`/integrations/${provider.code.toLowerCase()}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Manage
                    </Button>
                  </Link>
                  <Link href={`/integrations/${provider.code.toLowerCase()}/settings`}>
                    <Button variant="ghost">
                      Settings
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/integrations/connect/${provider.code.toLowerCase()}`} className="flex-1">
                  <Button className="w-full">
                    Connect
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <Card className="p-12 text-center">
          <PuzzlePieceIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No integrations found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters
          </p>
          <Button onClick={() => { setSearchTerm(''); setSelectedCategory(''); setShowConnectedOnly(false); }}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
