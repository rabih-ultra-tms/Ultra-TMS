"use client";

import { useLoads, useLoadStats } from "@/lib/hooks/tms/use-loads";
import { LoadsDataTable } from "@/components/tms/loads/loads-data-table";
import { LoadsFilterBar } from "@/components/tms/loads/loads-filter-bar";
import { KPIStatCards } from "@/components/tms/loads/kpi-stat-cards";
import { LoadDrawer } from "@/components/tms/loads/load-drawer";
import { ColumnSettingsDrawer } from "@/components/tms/loads/column-settings-drawer";
import { useState } from "react";
import { Load, LoadStatus } from "@/types/loads";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { PaginationState, VisibilityState } from "@tanstack/react-table";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function LoadsListPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // -- State --
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Table State
    // Default visibility based on design (showing key fields)
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        // all visible by default
    });

    // -- Data Fetching --
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    // Construct query from URL params
    const query = {
        page,
        limit,
        status: (searchParams.get("status") as LoadStatus | "all") || undefined,
        carrierId: searchParams.get("carrierId") || undefined,
        search: searchParams.get("search") || undefined,
    };

    const { data, isLoading } = useLoads(query);
    const { data: stats, isLoading: statsLoading } = useLoadStats();

    // -- Handlers --
    const handleRowClick = (load: Load) => {
        setSelectedLoad(load);
        setIsDrawerOpen(true);
    };

    const handleEdit = (load: Load) => {
        // Navigate to edit page (Future Comp)
        console.log("Edit load", load.id);
    };

    const handleViewDetails = (load: Load) => {
        router.push(`/operations/loads/${load.id}`);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
            {/* Header Area */}
            <div className="flex flex-col">
                <div className="px-6 py-2 border-b bg-background flex items-center justify-between">
                    <h1 className="text-lg font-bold text-foreground">Dispatch Board</h1>
                    <div className="flex items-center gap-2">
                        {/* Global Actions like Refresh, Notifications could go here */}
                    </div>
                </div>

                {/* Filters */}
                <LoadsFilterBar />

                {/* Stats */}
                <div className="px-6 py-4 border-b bg-background/50">
                    <KPIStatCards stats={stats} isLoading={statsLoading} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col relative">
                <div className="flex-1 overflow-auto rounded-lg border bg-background shadow-sm relative">
                    <LoadsDataTable
                        data={data?.data || []}
                        isLoading={isLoading}
                        onRowClick={handleRowClick}
                    />
                </div>

                {/* Floating Settings Trigger (Bottom Right) */}
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-6 right-6 h-12 w-12 rounded-xl shadow-lg border-muted-foreground/20 bg-background hover:bg-slate-100 hover:text-blue-600 transition-all hover:scale-105 z-10"
                    onClick={() => setIsSettingsOpen(true)}
                >
                    <Settings className="h-6 w-6" />
                </Button>
            </div>

            {/* Drawers */}
            <LoadDrawer
                load={selectedLoad}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
            />

            <ColumnSettingsDrawer
                open={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentVisibility={columnVisibility}
                onVisibilityChange={setColumnVisibility}
            />
        </div>
    );
}
