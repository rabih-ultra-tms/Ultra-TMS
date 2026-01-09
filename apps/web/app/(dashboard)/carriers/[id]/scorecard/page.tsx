'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CarrierScorecard {
  carrier: {
    id: string;
    name: string;
    mcNumber: string;
    dotNumber: string;
    tier: string;
    status: string;
  };
  overallScore: number;
  metrics: {
    onTimePickup: number;
    onTimeDelivery: number;
    tenderAcceptance: number;
    claimRatio: number;
    damageRatio: number;
    trackingCompliance: number;
    documentCompliance: number;
    communicationScore: number;
  };
  trends: {
    period: string;
    score: number;
    loads: number;
  }[];
  comparisons: {
    metric: string;
    carrierValue: number;
    networkAverage: number;
    topPerformer: number;
  }[];
  recentLoads: {
    id: string;
    loadNumber: string;
    origin: string;
    destination: string;
    deliveredAt: string;
    onTimePickup: boolean;
    onTimeDelivery: boolean;
    hasClaim: boolean;
    rating: number | null;
  }[];
}

export default function CarrierScorecardPage() {
  const params = useParams();
  const carrierId = params.id as string;

  const [scorecard, setScorecard] = useState<CarrierScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('90');

  useEffect(() => {
    // Mock data
    setScorecard({
      carrier: {
        id: carrierId,
        name: 'Swift Transport LLC',
        mcNumber: 'MC-123456',
        dotNumber: 'DOT-789012',
        tier: 'PREFERRED',
        status: 'ACTIVE',
      },
      overallScore: 92,
      metrics: {
        onTimePickup: 96,
        onTimeDelivery: 94,
        tenderAcceptance: 88,
        claimRatio: 0.5,
        damageRatio: 0.2,
        trackingCompliance: 98,
        documentCompliance: 95,
        communicationScore: 90,
      },
      trends: [
        { period: 'Oct 2024', score: 89, loads: 45 },
        { period: 'Nov 2024', score: 91, loads: 52 },
        { period: 'Dec 2024', score: 90, loads: 48 },
        { period: 'Jan 2025', score: 92, loads: 38 },
      ],
      comparisons: [
        { metric: 'On-Time Delivery', carrierValue: 94, networkAverage: 87, topPerformer: 98 },
        { metric: 'Tender Acceptance', carrierValue: 88, networkAverage: 75, topPerformer: 95 },
        { metric: 'Claim Ratio', carrierValue: 0.5, networkAverage: 1.2, topPerformer: 0.1 },
        { metric: 'Tracking Compliance', carrierValue: 98, networkAverage: 82, topPerformer: 100 },
      ],
      recentLoads: [
        {
          id: '1',
          loadNumber: 'LD-2025-0150',
          origin: 'Chicago, IL',
          destination: 'Denver, CO',
          deliveredAt: '2025-01-14',
          onTimePickup: true,
          onTimeDelivery: true,
          hasClaim: false,
          rating: 5,
        },
        {
          id: '2',
          loadNumber: 'LD-2025-0142',
          origin: 'Denver, CO',
          destination: 'Los Angeles, CA',
          deliveredAt: '2025-01-12',
          onTimePickup: true,
          onTimeDelivery: false,
          hasClaim: false,
          rating: 4,
        },
        {
          id: '3',
          loadNumber: 'LD-2025-0135',
          origin: 'Los Angeles, CA',
          destination: 'Phoenix, AZ',
          deliveredAt: '2025-01-10',
          onTimePickup: true,
          onTimeDelivery: true,
          hasClaim: false,
          rating: 5,
        },
        {
          id: '4',
          loadNumber: 'LD-2025-0128',
          origin: 'Phoenix, AZ',
          destination: 'Dallas, TX',
          deliveredAt: '2025-01-08',
          onTimePickup: false,
          onTimeDelivery: true,
          hasClaim: false,
          rating: 4,
        },
        {
          id: '5',
          loadNumber: 'LD-2025-0120',
          origin: 'Dallas, TX',
          destination: 'Chicago, IL',
          deliveredAt: '2025-01-05',
          onTimePickup: true,
          onTimeDelivery: true,
          hasClaim: false,
          rating: 5,
        },
      ],
    });
    setLoading(false);
  }, [carrierId, period]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTierBadgeColor = (tier: string) => {
    const colors: Record<string, string> = {
      ELITE: 'bg-purple-100 text-purple-800',
      PREFERRED: 'bg-green-100 text-green-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PROBATIONARY: 'bg-yellow-100 text-yellow-800',
      NEW: 'bg-gray-100 text-gray-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const renderProgressBar = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    return (
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            percentage >= 90 ? 'bg-green-500' :
            percentage >= 75 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  if (loading || !scorecard) {
    return <div className="p-8">Loading scorecard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <Link href={`/carriers/${carrierId}`} className="text-blue-600 hover:text-blue-800">
              ← Back to Carrier
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Performance Scorecard</h1>
          <p className="text-gray-600">{scorecard.carrier.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">{scorecard.carrier.mcNumber}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{scorecard.carrier.dotNumber}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(scorecard.carrier.tier)}`}>
              {scorecard.carrier.tier}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last Year</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Export PDF
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overall Performance Score</h2>
            <p className="text-gray-500 text-sm">Based on all key performance indicators</p>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(scorecard.overallScore)}`}>
              {scorecard.overallScore}
            </div>
            <div className="text-gray-500 text-sm">out of 100</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                scorecard.overallScore >= 90 ? 'bg-green-500' :
                scorecard.overallScore >= 75 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${scorecard.overallScore}%` }}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-red-600">Needs Improvement (0-74)</span>
          <span className="text-yellow-600">Good (75-89)</span>
          <span className="text-green-600">Excellent (90-100)</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(scorecard.metrics.onTimePickup)}`}>
          <div className="text-sm text-gray-600">On-Time Pickup</div>
          <div className={`text-3xl font-bold ${getScoreColor(scorecard.metrics.onTimePickup)}`}>
            {scorecard.metrics.onTimePickup}%
          </div>
          {renderProgressBar(scorecard.metrics.onTimePickup)}
        </div>
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(scorecard.metrics.onTimeDelivery)}`}>
          <div className="text-sm text-gray-600">On-Time Delivery</div>
          <div className={`text-3xl font-bold ${getScoreColor(scorecard.metrics.onTimeDelivery)}`}>
            {scorecard.metrics.onTimeDelivery}%
          </div>
          {renderProgressBar(scorecard.metrics.onTimeDelivery)}
        </div>
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(scorecard.metrics.tenderAcceptance)}`}>
          <div className="text-sm text-gray-600">Tender Acceptance</div>
          <div className={`text-3xl font-bold ${getScoreColor(scorecard.metrics.tenderAcceptance)}`}>
            {scorecard.metrics.tenderAcceptance}%
          </div>
          {renderProgressBar(scorecard.metrics.tenderAcceptance)}
        </div>
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(100 - scorecard.metrics.claimRatio * 20)}`}>
          <div className="text-sm text-gray-600">Claim Ratio</div>
          <div className={`text-3xl font-bold ${scorecard.metrics.claimRatio < 1 ? 'text-green-600' : scorecard.metrics.claimRatio < 2 ? 'text-yellow-600' : 'text-red-600'}`}>
            {scorecard.metrics.claimRatio}%
          </div>
          <div className="text-xs text-gray-500">Lower is better</div>
        </div>
      </div>

      {/* Second Row of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(scorecard.metrics.trackingCompliance)}`}>
          <div className="text-sm text-gray-600">Tracking Compliance</div>
          <div className={`text-3xl font-bold ${getScoreColor(scorecard.metrics.trackingCompliance)}`}>
            {scorecard.metrics.trackingCompliance}%
          </div>
          {renderProgressBar(scorecard.metrics.trackingCompliance)}
        </div>
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(scorecard.metrics.documentCompliance)}`}>
          <div className="text-sm text-gray-600">Document Compliance</div>
          <div className={`text-3xl font-bold ${getScoreColor(scorecard.metrics.documentCompliance)}`}>
            {scorecard.metrics.documentCompliance}%
          </div>
          {renderProgressBar(scorecard.metrics.documentCompliance)}
        </div>
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(scorecard.metrics.communicationScore)}`}>
          <div className="text-sm text-gray-600">Communication</div>
          <div className={`text-3xl font-bold ${getScoreColor(scorecard.metrics.communicationScore)}`}>
            {scorecard.metrics.communicationScore}%
          </div>
          {renderProgressBar(scorecard.metrics.communicationScore)}
        </div>
        <div className={`bg-white rounded-lg shadow p-4 ${getScoreBgColor(100 - scorecard.metrics.damageRatio * 20)}`}>
          <div className="text-sm text-gray-600">Damage Ratio</div>
          <div className={`text-3xl font-bold ${scorecard.metrics.damageRatio < 0.5 ? 'text-green-600' : scorecard.metrics.damageRatio < 1 ? 'text-yellow-600' : 'text-red-600'}`}>
            {scorecard.metrics.damageRatio}%
          </div>
          <div className="text-xs text-gray-500">Lower is better</div>
        </div>
      </div>

      {/* Trend Chart and Network Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Trend</h2>
          <div className="space-y-4">
            {scorecard.trends.map((trend, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-500">{trend.period}</div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-100 rounded relative">
                    <div
                      className={`h-full rounded ${
                        trend.score >= 90 ? 'bg-green-500' :
                        trend.score >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${trend.score}%` }}
                    />
                    <span className="absolute right-2 top-0.5 text-sm font-medium text-gray-700">
                      {trend.score}
                    </span>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-500 text-right">
                  {trend.loads} loads
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Comparison */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Network Comparison</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-2">Metric</th>
                <th className="pb-2 text-center">Carrier</th>
                <th className="pb-2 text-center">Network Avg</th>
                <th className="pb-2 text-center">Top 10%</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {scorecard.comparisons.map((comp, index) => (
                <tr key={index} className="border-t">
                  <td className="py-3 text-gray-700">{comp.metric}</td>
                  <td className="py-3 text-center">
                    <span className={`font-medium ${
                      comp.carrierValue >= comp.networkAverage ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comp.carrierValue}%
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-500">{comp.networkAverage}%</td>
                  <td className="py-3 text-center text-purple-600 font-medium">{comp.topPerformer}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Loads */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Load Performance</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">On-Time PU</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">On-Time DEL</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Claims</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scorecard.recentLoads.map((load) => (
              <tr key={load.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/loads/${load.id}`} className="text-blue-600 hover:underline font-medium">
                    {load.loadNumber}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{load.origin}</div>
                  <div className="text-sm text-gray-500">→ {load.destination}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{load.deliveredAt}</td>
                <td className="px-6 py-4 text-center">
                  {load.onTimePickup ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-red-600">✗</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {load.onTimeDelivery ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-red-600">✗</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {load.hasClaim ? (
                    <span className="text-red-600">Yes</span>
                  ) : (
                    <span className="text-green-600">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {load.rating ? (
                    <span className="text-yellow-500">
                      {'★'.repeat(load.rating)}{'☆'.repeat(5 - load.rating)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
