/**
 * React Query hooks for Operations Dashboard
 * Connects to 5 dashboard endpoints: KPIs, charts, alerts, activity, needs-attention
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/lib/socket/socket-provider';
import { useEffect } from 'react';

// ===========================
// Types
// ===========================

export type Period = 'today' | 'thisWeek' | 'thisMonth';
export type ComparisonPeriod = 'yesterday' | 'lastWeek' | 'lastMonth';
export type Scope = 'personal' | 'team';

export interface DashboardKPIs {
  activeLoads: number;
  activeLoadsChange: number;
  dispatchedToday: number;
  dispatchedTodayChange: number;
  deliveredToday: number;
  deliveredTodayChange: number;
  onTimePercentage: number;
  onTimePercentageChange: number;
  averageMargin: number;
  averageMarginChange: number;
  revenueMTD: number;
  revenueMTDChange: number;
  sparklines: {
    activeLoads: number[];
    dispatchedToday: number[];
    deliveredToday: number[];
    onTimePercentage: number[];
    averageMargin: number[];
    revenueMTD: number[];
  };
}

export interface LoadsByStatus {
  status: string;
  count: number;
  color: string;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface DashboardCharts {
  loadsByStatus: LoadsByStatus[];
  revenueTrend: RevenueTrendPoint[];
}

export interface DashboardAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  entityType: 'load' | 'order' | 'carrier';
  entityId: string;
  entityNumber: string;
  message: string;
  createdAt: string;
  actionType?: 'call' | 'update' | 'log' | 'view';
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  userName: string;
  userId: string;
  entityType: 'load' | 'order';
  entityId: string;
  entityNumber: string;
  action: string;
  description: string;
}

export interface NeedsAttentionLoad {
  id: string;
  loadNumber: string;
  origin: string;
  destination: string;
  issue: string;
  severity: 'critical' | 'warning';
  issueType: 'no_check_call' | 'eta_past_due' | 'detention' | 'no_carrier' | 'exception';
  timeSinceIssue?: string;
}

// ===========================
// Query Keys
// ===========================

export const dashboardKeys = {
  all: ['operations', 'dashboard'] as const,
  kpis: (period: Period, scope: Scope, comparison: ComparisonPeriod) =>
    [...dashboardKeys.all, 'kpis', period, scope, comparison] as const,
  charts: (period: Period) => [...dashboardKeys.all, 'charts', period] as const,
  alerts: () => [...dashboardKeys.all, 'alerts'] as const,
  activity: (period: Period) => [...dashboardKeys.all, 'activity', period] as const,
  needsAttention: () => [...dashboardKeys.all, 'needs-attention'] as const,
};

// ===========================
// API Fetchers
// ===========================

async function fetchDashboardKPIs(
  period: Period,
  scope: Scope,
  comparison: ComparisonPeriod
): Promise<DashboardKPIs> {
  const params = new URLSearchParams({ period, scope, comparisonPeriod: comparison });
  const response = await fetch(`/api/v1/operations/dashboard?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard KPIs: ${response.statusText}`);
  }

  const body = await response.json();
  return body.data ?? body;
}

async function fetchDashboardCharts(period: Period): Promise<DashboardCharts> {
  const params = new URLSearchParams({ period });
  const response = await fetch(`/api/v1/operations/dashboard/charts?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard charts: ${response.statusText}`);
  }

  const body = await response.json();
  return body.data ?? body;
}

async function fetchDashboardAlerts(): Promise<DashboardAlert[]> {
  const response = await fetch('/api/v1/operations/dashboard/alerts', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard alerts: ${response.statusText}`);
  }

  const body = await response.json();
  return body.data ?? body;
}

async function fetchDashboardActivity(period: Period): Promise<ActivityItem[]> {
  const params = new URLSearchParams({ period });
  const response = await fetch(`/api/v1/operations/dashboard/activity?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard activity: ${response.statusText}`);
  }

  const body = await response.json();
  return body.data ?? body;
}

async function fetchNeedsAttention(): Promise<NeedsAttentionLoad[]> {
  const response = await fetch('/api/v1/operations/dashboard/needs-attention', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch needs attention: ${response.statusText}`);
  }

  const body = await response.json();
  return body.data ?? body;
}

// ===========================
// Hooks
// ===========================

export function useDashboardKPIs(
  period: Period = 'today',
  scope: Scope = 'personal',
  comparison: ComparisonPeriod = 'yesterday'
) {
  return useQuery({
    queryKey: dashboardKeys.kpis(period, scope, comparison),
    queryFn: () => fetchDashboardKPIs(period, scope, comparison),
    staleTime: 60_000, // 60s
    refetchInterval: 120_000, // 2 minutes
  });
}

export function useDashboardCharts(period: Period = 'today') {
  return useQuery({
    queryKey: dashboardKeys.charts(period),
    queryFn: () => fetchDashboardCharts(period),
    staleTime: 120_000, // 120s
    refetchInterval: 300_000, // 5 minutes
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: fetchDashboardAlerts,
    staleTime: 30_000, // 30s
    refetchInterval: 60_000, // 1 minute
  });
}

export function useDashboardActivity(period: Period = 'today') {
  return useQuery({
    queryKey: dashboardKeys.activity(period),
    queryFn: () => fetchDashboardActivity(period),
    staleTime: 30_000, // 30s
    refetchInterval: 60_000, // 1 minute
  });
}

export function useNeedsAttention() {
  return useQuery({
    queryKey: dashboardKeys.needsAttention(),
    queryFn: fetchNeedsAttention,
    staleTime: 30_000, // 30s
    refetchInterval: 60_000, // 1 minute
  });
}

// ===========================
// WebSocket Live Updates Hook
// ===========================

export function useDashboardLiveUpdates(
  period: Period = 'today',
  scope: Scope = 'personal',
  comparison: ComparisonPeriod = 'yesterday'
) {
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !connected) return;

    const handleLoadStatusChanged = () => {
      // Invalidate KPIs, charts, and activity
      queryClient.invalidateQueries({ queryKey: dashboardKeys.kpis(period, scope, comparison) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.charts(period) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(period) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.needsAttention() });
    };

    const handleLoadCreated = () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.kpis(period, scope, comparison) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.charts(period) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(period) });
    };

    const handleOrderCreated = () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(period) });
    };

    const handleOrderStatusChanged = () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(period) });
    };

    const handleCheckCallReceived = () => {
      // Remove resolved alert if it was a "missing check call" alert
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(period) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.needsAttention() });
    };

    const handleNotificationNew = (data: { type: string; severity: string }) => {
      if (
        (data.severity === 'critical' || data.severity === 'warning') &&
        data.type.startsWith('operations')
      ) {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      }
    };

    // Subscribe to events
    socket.on('load:status:changed', handleLoadStatusChanged);
    socket.on('load:created', handleLoadCreated);
    socket.on('order:created', handleOrderCreated);
    socket.on('order:status:changed', handleOrderStatusChanged);
    socket.on('checkcall:received', handleCheckCallReceived);
    socket.on('notification:new', handleNotificationNew);

    return () => {
      socket.off('load:status:changed', handleLoadStatusChanged);
      socket.off('load:created', handleLoadCreated);
      socket.off('order:created', handleOrderCreated);
      socket.off('order:status:changed', handleOrderStatusChanged);
      socket.off('checkcall:received', handleCheckCallReceived);
      socket.off('notification:new', handleNotificationNew);
    };
  }, [socket, connected, queryClient, period, scope, comparison]);
}
