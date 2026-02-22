"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchPostings } from "@/lib/hooks/load-board";
import { LoadSearchFilters } from "@/components/load-board/load-search-filters";
import { LoadSearchResults } from "@/components/load-board/load-search-results";
import type { LoadPostingSearchFilters } from "@/types/load-board";

const EMPTY_FILTERS: LoadPostingSearchFilters = {
    page: 1,
    limit: 25,
};

export default function AvailableLoadsSearchPage() {
    const [filters, setFilters] =
        useState<LoadPostingSearchFilters>(EMPTY_FILTERS);

    const { data, isLoading, isError, refetch } = useSearchPostings(filters);

    function handleClear() {
        setFilters(EMPTY_FILTERS);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/load-board">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Available Loads
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Search available loads by origin, destination, and
                        equipment
                    </p>
                </div>
            </div>

            {/* Filters */}
            <LoadSearchFilters
                filters={filters}
                onFilterChange={setFilters}
                onClear={handleClear}
            />

            {/* Results */}
            <LoadSearchResults
                postings={data?.data}
                isLoading={isLoading}
                isError={isError}
                onRetry={() => void refetch()}
            />
        </div>
    );
}
