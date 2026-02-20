"use client";

import { useState, useEffect } from "react";
import { useLoad } from "@/lib/hooks/tms/use-loads";
import { LoadDetailHeader } from "@/components/tms/loads/load-detail-header";
import { LoadSummaryCard } from "@/components/tms/loads/load-summary-card";
import { LoadTrackingCard } from "@/components/tms/loads/load-tracking-card";
import { LoadRouteTab } from "@/components/tms/loads/load-route-tab";
import { LoadCarrierTab } from "@/components/tms/loads/load-carrier-tab";
import { LoadDocumentsTab } from "@/components/tms/loads/load-documents-tab";
import { LoadTimelineTab } from "@/components/tms/loads/load-timeline-tab";
import { LoadCheckCallsTab } from "@/components/tms/loads/load-check-calls-tab";
import { DetailPageSkeleton } from "@/components/shared/detail-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List, FileText, Activity, Phone } from "lucide-react";

const VALID_TABS = ["route", "carrier", "documents", "timeline", "check-calls"];

export function LoadDetailClient({ id }: { id: string }) {
    const { data: load, isLoading, error, refetch } = useLoad(id);

    // Persist active tab in URL hash
    const [activeTab, setActiveTab] = useState("route");
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash.replace("#", "");
            if (hash && VALID_TABS.includes(hash)) {
                setActiveTab(hash);
            }
        }
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (typeof window !== "undefined") {
            window.location.hash = value;
        }
    };

    if (isLoading) {
        return <div className="p-6"><DetailPageSkeleton /></div>;
    }

    if (error) {
        return <div className="p-6"><ErrorState title="Failed to load load details" message={error.message} retry={refetch} /></div>;
    }

    if (!load) {
        // In client components, notFound() might not work as expected during initial render if data isn't there, 
        // but react-query usually handles this. 
        // Alternatively render a dedicated Not Found state.
        return <div className="p-6">Load not found</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/10">
            {/* Header */}
            <LoadDetailHeader load={load} />

            <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Left Column: Summary (25%) */}
                <div className="xl:col-span-1 space-y-6">
                    <LoadSummaryCard load={load} />
                </div>

                {/* Center Column: Tabs (50%) */}
                <div className="xl:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                            <TabsTrigger value="route" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2">
                                <Map className="h-4 w-4 mr-2" /> Route & Stops
                            </TabsTrigger>
                            <TabsTrigger value="carrier" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2">
                                <List className="h-4 w-4 mr-2" /> Carrier & Rate
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2">
                                <FileText className="h-4 w-4 mr-2" /> Documents
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2">
                                <Activity className="h-4 w-4 mr-2" /> Timeline
                            </TabsTrigger>
                            <TabsTrigger value="check-calls" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2">
                                <Phone className="h-4 w-4 mr-2" /> Check Calls
                            </TabsTrigger>
                        </TabsList>

                        <div className="pt-6">
                            <TabsContent value="route" className="mt-0 space-y-4">
                                <LoadRouteTab load={load} />
                            </TabsContent>
                            <TabsContent value="carrier" className="mt-0">
                                <LoadCarrierTab load={load} />
                            </TabsContent>
                            <TabsContent value="documents" className="mt-0">
                                <LoadDocumentsTab loadId={load.id} load={load} />
                            </TabsContent>
                            <TabsContent value="timeline" className="mt-0">
                                <LoadTimelineTab loadId={load.id} />
                            </TabsContent>
                            <TabsContent value="check-calls" className="mt-0">
                                <LoadCheckCallsTab loadId={load.id} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Right Column: Tracking & Actions (25%) */}
                <div className="xl:col-span-1 space-y-6">
                    <LoadTrackingCard load={load} />
                </div>

            </div>
        </div>
    );
}
