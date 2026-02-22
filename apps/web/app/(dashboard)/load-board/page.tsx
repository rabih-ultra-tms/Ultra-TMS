"use client";

import Link from "next/link";
import { Plus, Search, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    useLoadBoardDashboardStats,
    useRecentPostings,
} from "@/lib/hooks/load-board";
import { LbDashboardStats } from "@/components/load-board/lb-dashboard-stats";
import { LbRecentPostings } from "@/components/load-board/lb-recent-postings";

export default function LoadBoardDashboardPage() {
    const { data: stats, isLoading: statsLoading } =
        useLoadBoardDashboardStats();
    const { data: postings, isLoading: postingsLoading } =
        useRecentPostings(10);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Load Board
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Post loads and manage carrier bids
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/load-board/search">
                            <Search className="h-4 w-4 mr-2" />
                            Search Available
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/load-board/post">
                            <Plus className="h-4 w-4 mr-2" />
                            Post Load
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <LbDashboardStats stats={stats} isLoading={statsLoading} />

            {/* Quick Links */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link
                    href="/load-board/post"
                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                    <Plus className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium">Post Load</p>
                        <p className="text-xs text-muted-foreground">
                            Create a new posting
                        </p>
                    </div>
                </Link>
                <Link
                    href="/load-board/search"
                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                    <Search className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium">Search Available</p>
                        <p className="text-xs text-muted-foreground">
                            Find loads by lane
                        </p>
                    </div>
                </Link>
                <Link
                    href="/load-board"
                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium">My Postings</p>
                        <p className="text-xs text-muted-foreground">
                            View your active postings
                        </p>
                    </div>
                </Link>
            </div>

            {/* Recent Postings */}
            <LbRecentPostings
                postings={postings}
                isLoading={postingsLoading}
            />
        </div>
    );
}
