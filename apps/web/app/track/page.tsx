'use client';

'use client';

import { useState } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function TrackingSearchPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      // Verify the tracking code exists before navigating
      const res = await fetch(`/api/v1/public/tracking/${code}`);
      if (res.ok) {
        router.push(`/track/${code}`);
      } else {
        window.alert(
          'Shipment not found. Please check the tracking code and try again.'
        );
      }
    } catch (_error) {
      window.alert('Error verifying tracking code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              Track Your Shipment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="tracking-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tracking Code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="tracking-code"
                    type="text"
                    placeholder="e.g., LD-202602-00145"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!code.trim() || isLoading}
                    className="px-4"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Enter your shipment tracking code to see real-time updates on
                your delivery
              </p>
            </form>

            <div className="mt-8 space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                How it works
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                    1
                  </div>
                  <p>Enter your tracking code in the field above</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                    2
                  </div>
                  <p>View real-time updates on your shipment status</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                    3
                  </div>
                  <p>See estimated delivery times and current location</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-gray-600">
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
}
