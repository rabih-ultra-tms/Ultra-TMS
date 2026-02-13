"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { DetailPageSkeleton } from "@/components/shared/detail-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Detail Page Pattern
//
// Standard layout for entity detail views.
// Includes: Breadcrumbs, Header (Title/Subtitle/Status/Actions), Tabs, Content.
// ---------------------------------------------------------------------------

export interface DetailTab {
    value: string;
    label: React.ReactNode;
    icon?: React.ElementType; // Icon component
    content: React.ReactNode;
}

export interface DetailPageProps {
    /** Page title (H1) */
    title: React.ReactNode;
    /** Subtitle or secondary info */
    subtitle?: React.ReactNode;
    /** Badges or status indicators */
    tags?: React.ReactNode;

    /** Primary actions (top right) */
    actions?: React.ReactNode;

    /** Breadcrumb navigation element */
    breadcrumb?: React.ReactNode;
    /** Back link URL (renders back button if provided) */
    backLink?: string;
    /** Back link label */
    backLabel?: string;

    /** Tab definitions */
    tabs: DetailTab[];
    /** Default active tab (if uncontrolled) */
    defaultTab?: string;
    /** Controlled active tab */
    activeTab?: string;
    /** Callback when tab changes */
    onTabChange?: (value: string) => void;

    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Retry callback */
    onRetry?: () => void;

    className?: string;
}

export function DetailPage({
    title,
    subtitle,
    tags,
    actions,
    breadcrumb,
    backLink,
    backLabel = "Back",
    tabs,
    defaultTab,
    activeTab,
    onTabChange,
    isLoading,
    error,
    onRetry,
    className,
}: DetailPageProps) {
    // Sync with URL hash if uncontrolled
    const [internalTab, setInternalTab] = React.useState(
        activeTab || defaultTab || tabs[0]?.value
    );

    React.useEffect(() => {
        if (typeof window !== "undefined" && !activeTab) {
            const hash = window.location.hash.replace("#", "");
            if (hash && tabs.some((t) => t.value === hash)) {
                setInternalTab(hash);
            }
        }
    }, [tabs, activeTab]);

    const handleTabChange = (value: string) => {
        if (onTabChange) {
            onTabChange(value);
        } else {
            setInternalTab(value);
            if (typeof window !== "undefined") {
                window.location.hash = value;
            }
        }
    };

    const currentTab = activeTab || internalTab;

    // --- Loading ---
    if (isLoading) {
        return (
            <div className={cn("p-6 space-y-6", className)}>
                <DetailPageSkeleton />
            </div>
        );
    }

    // --- Error ---
    if (error) {
        return (
            <div className={cn("p-6 space-y-6", className)}>
                {breadcrumb}
                <ErrorState
                    title="Failed to load details"
                    message={error.message}
                    retry={onRetry}
                    backButton={backLink ? <Button variant="outline" asChild><Link href={backLink}>{backLabel}</Link></Button> : undefined}
                />
            </div>
        );
    }

    return (
        <div className={cn("p-6 space-y-6 animate-in fade-in duration-300", className)}>
            {/* Top Nav: Breadcrumb + Back */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {breadcrumb}
                </div>
                {backLink && (
                    <Button variant="ghost" size="sm" asChild className="-mr-2">
                        <Link href={backLink}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {backLabel}
                        </Link>
                    </Button>
                )}
            </div>

            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                    {(subtitle || tags) && (
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {subtitle}
                            {tags && (
                                <>
                                    {subtitle && <span className="text-border mx-1">|</span>}
                                    {tags}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {tabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="space-y-4 focus-visible:outline-none">
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
