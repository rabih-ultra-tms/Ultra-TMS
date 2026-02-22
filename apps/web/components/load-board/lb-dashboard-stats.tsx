"use client";

import { BarChart3, Clock, Target, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/tms/stats/kpi-card";
import type { LoadBoardDashboardStats } from "@/types/load-board";

interface LbDashboardStatsProps {
    stats?: LoadBoardDashboardStats;
    isLoading: boolean;
}

export function LbDashboardStats({ stats, isLoading }: LbDashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                icon={<BarChart3 className="h-4 w-4" />}
                label="Active Postings"
                value={stats?.activePostings ?? 0}
                loading={isLoading}
            />
            <KpiCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Pending Bids"
                value={stats?.pendingBids ?? 0}
                loading={isLoading}
            />
            <KpiCard
                icon={<Clock className="h-4 w-4" />}
                label="Avg Time to Cover"
                value={
                    stats
                        ? `${stats.avgTimeToCover.toFixed(1)}h`
                        : "—"
                }
                loading={isLoading}
            />
            <KpiCard
                icon={<Target className="h-4 w-4" />}
                label="Coverage Rate"
                value={
                    stats
                        ? `${stats.coverageRate.toFixed(0)}%`
                        : "—"
                }
                loading={isLoading}
            />
        </div>
    );
}
