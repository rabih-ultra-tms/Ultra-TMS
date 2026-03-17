'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load D&B integration
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Please refresh the page or contact support.
        </p>
      </div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  );
}

function DNBContent() {
  const [dunNumber, setDunNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleSearch = async () => {
    if (!dunNumber && !companyName) {
      return;
    }

    setLoading(true);
    // Mock API call - would integrate with actual D&B API
    setTimeout(() => {
      setResult({
        dunNumber,
        companyName,
        businessStatus: 'ACTIVE',
        creditRating: 'GOOD',
        paydexScore: 75,
        riskLevel: 'LOW',
        industryRisk: 'MODERATE',
        paymentTrends: 'IMPROVING',
      });
      setLoading(false);
    }, 1000);
  };

  const handleClear = () => {
    setDunNumber('');
    setCompanyName('');
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dun & Bradstreet Lookup</CardTitle>
            <CardDescription>
              Search for company credit profile and ratings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dun-number">DUNS Number</Label>
                <Input
                  id="dun-number"
                  placeholder="e.g., 01-234-5678"
                  value={dunNumber}
                  onChange={(e) => setDunNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="e.g., Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading || (!dunNumber && !companyName)}
              >
                <Search className="mr-2 size-4" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Credit Profile</CardTitle>
              <CardDescription>{result.companyName as string}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Business Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Business Status
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <p className="font-semibold">
                        {result.businessStatus as string}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Credit Rating
                    </p>
                    <p className="font-semibold mt-2">
                      {result.creditRating as string}
                    </p>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      PAYDEX Score
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {result.paydexScore as string}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      0-100 scale
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <p className="font-semibold mt-2">
                      {result.riskLevel as string}
                    </p>
                  </div>
                </div>

                {/* Industry & Payment Trends */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Industry Risk
                    </p>
                    <p className="font-semibold mt-2">
                      {result.industryRisk as string}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Trends
                    </p>
                    <p className="font-semibold mt-2">
                      {result.paymentTrends as string}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Recommendation
                  </h4>
                  <p className="text-sm text-blue-800">
                    Based on the credit profile, this company is suitable for
                    standard credit terms. Consider setting credit limit based
                    on PAYDEX score and payment history.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!result && dunNumber && !loading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-orange-600">
                <AlertCircle className="size-5" />
                <p className="text-sm">
                  No results found. Please check the DUNS number and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About D&B Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>
              Dun & Bradstreet provides comprehensive credit intelligence for
              business decision-making.
            </p>
            <div>
              <p className="font-semibold text-muted-foreground mb-2">
                What you get:
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Credit ratings and risk assessment</li>
                <li>• PAYDEX score for payment history</li>
                <li>• Business financials and trends</li>
                <li>• Payment performance data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integration Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3 text-muted-foreground">
            <p>
              Use D&B credit profiles to make informed credit decisions and
              adjust limits based on updated risk assessment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreditDNBPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">D&B Integration</h1>
          <p className="text-muted-foreground mt-2">
            Look up company credit profiles using Dun & Bradstreet
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link
            href="/credit"
            className="hover:text-foreground transition-colors"
          >
            Credit
          </Link>
          {' > '}
          <span className="text-foreground font-medium">D&B Integration</span>
        </nav>

        {/* DNB Content */}
        <Suspense fallback={<ListPageSkeleton rows={6} columns={2} />}>
          <DNBContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
