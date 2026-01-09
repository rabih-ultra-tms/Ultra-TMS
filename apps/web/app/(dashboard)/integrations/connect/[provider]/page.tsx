'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  KeyIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock provider data
const mockProvider = {
  code: 'DAT',
  name: 'DAT Load Board',
  description: 'Connect to the DAT load board to search for loads, post trucks, and access carrier information.',
  logo: '🚚',
  category: 'LOAD_BOARD',
  authType: 'API_KEY',
  documentationUrl: 'https://developer.dat.com',
  configSchema: {
    apiKey: { type: 'string', label: 'API Key', required: true },
    apiSecret: { type: 'password', label: 'API Secret', required: true },
    environment: { type: 'select', label: 'Environment', options: ['production', 'sandbox'], required: true },
  },
  features: [
    'Search millions of loads',
    'Post available trucks',
    'Access carrier ratings',
    'Real-time notifications',
    'Webhook support',
  ],
};

const steps = [
  { id: 1, name: 'Introduction', description: 'Learn about the integration' },
  { id: 2, name: 'Authentication', description: 'Enter your credentials' },
  { id: 3, name: 'Configuration', description: 'Configure sync settings' },
  { id: 4, name: 'Test Connection', description: 'Verify everything works' },
  { id: 5, name: 'Complete', description: 'Start using the integration' },
];

export default function ConnectIntegrationPage({ params }: { params: { provider: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: `${mockProvider.name} - Production`,
    apiKey: '',
    apiSecret: '',
    environment: 'production',
    syncFrequency: 'REALTIME',
    enableWebhooks: true,
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTestConnection = async () => {
    setIsConnecting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResult({
      success: formData.apiKey.length > 0 && formData.apiSecret.length > 0,
      message: formData.apiKey.length > 0 && formData.apiSecret.length > 0
        ? 'Connection successful! Your credentials are valid.'
        : 'Connection failed. Please check your credentials.',
    });
    setIsConnecting(false);
  };

  const handleFinish = () => {
    // In real app, save integration and redirect
    window.location.href = '/integrations/my';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/integrations" className="hover:text-blue-600 flex items-center gap-1">
          <ChevronLeftIcon className="h-4 w-4" />
          Integrations
        </Link>
        <span>/</span>
        <span>Connect {mockProvider.name}</span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${currentStep > step.id 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }
              `}>
                {currentStep > step.id ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : ''}`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 hidden md:block">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 md:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-8">
        {/* Step 1: Introduction */}
        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">{mockProvider.logo}</div>
              <div>
                <h2 className="text-2xl font-bold">{mockProvider.name}</h2>
                <Badge variant="blue">{mockProvider.category.replace(/_/g, ' ')}</Badge>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {mockProvider.description}
            </p>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 mb-6">
              {mockProvider.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <KeyIcon className="h-4 w-4 inline mr-2" />
                You&apos;ll need your {mockProvider.name} API credentials to continue. 
                <a href={mockProvider.documentationUrl} target="_blank" className="underline ml-1">
                  Get your API keys →
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Authentication */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <KeyIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Authentication</h2>
                <p className="text-gray-500">Enter your API credentials</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Integration Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Key *</label>
                <input
                  type="text"
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Secret *</label>
                <input
                  type="password"
                  value={formData.apiSecret}
                  onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                  placeholder="Enter your API secret"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => handleInputChange('environment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Configuration</h2>
                <p className="text-gray-500">Configure sync and notification settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sync Frequency</label>
                <select
                  value={formData.syncFrequency}
                  onChange={(e) => handleInputChange('syncFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="REALTIME">Real-time</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="DAILY">Daily</option>
                  <option value="MANUAL">Manual only</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How often to sync data with {mockProvider.name}</p>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                <div>
                  <p className="font-medium">Enable Webhooks</p>
                  <p className="text-sm text-gray-500">Receive real-time updates from {mockProvider.name}</p>
                </div>
                <button
                  onClick={() => handleInputChange('enableWebhooks', !formData.enableWebhooks)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enableWebhooks ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enableWebhooks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Test Connection */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ArrowPathIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Test Connection</h2>
                <p className="text-gray-500">Verify your credentials and connection</p>
              </div>
            </div>
            
            <div className="text-center py-8">
              {!testResult ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click the button below to test your connection to {mockProvider.name}
                  </p>
                  <Button onClick={handleTestConnection} disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className={`p-6 rounded-lg ${testResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  {testResult.success ? (
                    <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  ) : (
                    <ArrowPathIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  )}
                  <p className={`text-lg font-medium ${testResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                    {testResult.message}
                  </p>
                  {!testResult.success && (
                    <Button variant="outline" className="mt-4" onClick={() => setCurrentStep(2)}>
                      Go Back to Credentials
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {currentStep === 5 && (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-20 w-20 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Integration Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your {mockProvider.name} integration is now connected and ready to use.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h3 className="font-medium mb-2">Summary</h3>
              <div className="text-sm text-left space-y-1">
                <p><span className="text-gray-500">Name:</span> {formData.name}</p>
                <p><span className="text-gray-500">Environment:</span> {formData.environment}</p>
                <p><span className="text-gray-500">Sync Frequency:</span> {formData.syncFrequency}</p>
                <p><span className="text-gray-500">Webhooks:</span> {formData.enableWebhooks ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < steps.length ? (
            <Button 
              onClick={handleNext}
              disabled={currentStep === 4 && (!testResult || !testResult.success)}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish}>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Finish Setup
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
