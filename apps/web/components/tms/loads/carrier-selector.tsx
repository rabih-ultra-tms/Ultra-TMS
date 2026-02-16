"use client";

import * as React from "react";
import { Search, Star, Phone, ExternalLink, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCarriers, CarrierWithScore } from "@/lib/hooks/tms/use-loads";

// ---------------------------------------------------------------------------
// CarrierSelector — Search and select a carrier for a load
// ---------------------------------------------------------------------------

interface CarrierSelectorProps {
    equipmentType?: string;
    originState?: string;
    destState?: string;
    onSelectCarrier: (carrier: CarrierWithScore) => void;
    onSkip: () => void;
    selectedCarrierId?: string;
    className?: string;
}

export function CarrierSelector({
    equipmentType,
    originState,
    destState,
    onSelectCarrier,
    onSkip,
    selectedCarrierId,
    className,
}: CarrierSelectorProps) {
    const [search, setSearch] = React.useState("");
    const [tier, setTier] = React.useState<string>("ALL");
    const [sort, setSort] = React.useState<"score" | "rate" | "recent" | "preferred">("score");

    const { data, isLoading } = useCarriers({
        search,
        equipmentType,
        originState,
        destState,
        tier: tier === "ALL" ? undefined : tier,
        compliance: "COMPLIANT",
        sort,
        limit: 20,
    });

    const carriers = data?.data || [];
    const recommended = carriers.slice(0, 5);
    const allResults = carriers.slice(5);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Search & Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by carrier name, MC#, or DOT#..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            {/* Equipment */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Equipment
                                </label>
                                <div className="px-3 py-2 bg-muted rounded-md text-sm">
                                    {equipmentType || "Any"}
                                </div>
                            </div>

                            {/* Lane */}
                            {originState && destState && (
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                        Lane
                                    </label>
                                    <div className="px-3 py-2 bg-muted rounded-md text-sm">
                                        {originState} → {destState}
                                    </div>
                                </div>
                            )}

                            {/* Tier Filter */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Tier
                                </label>
                                <Select value={tier} onValueChange={setTier}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Tiers</SelectItem>
                                        <SelectItem value="PLATINUM">Platinum</SelectItem>
                                        <SelectItem value="GOLD">Gold</SelectItem>
                                        <SelectItem value="SILVER">Silver</SelectItem>
                                        <SelectItem value="BRONZE">Bronze</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Sort By
                                </label>
                                <Select value={sort} onValueChange={(v: "score" | "rate" | "recent" | "preferred") => setSort(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="score">Best Score</SelectItem>
                                        <SelectItem value="rate">Best Rate</SelectItem>
                                        <SelectItem value="recent">Most Recent</SelectItem>
                                        <SelectItem value="preferred">Preferred</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <CarrierCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Recommended Carriers */}
            {!isLoading && recommended.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-border" />
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            <span>⭐</span>
                            <span>Recommended for this Lane</span>
                        </div>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-3">
                        {recommended.map((carrier) => (
                            <CarrierCard
                                key={carrier.id}
                                carrier={carrier}
                                onSelect={() => onSelectCarrier(carrier)}
                                isSelected={selectedCarrierId === carrier.id}
                                isRecommended
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* All Results */}
            {!isLoading && allResults.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-sm font-semibold">All Results</h3>
                        <div className="text-xs text-muted-foreground">
                            {carriers.length} carrier{carriers.length !== 1 ? "s" : ""} found
                        </div>
                    </div>
                    <div className="space-y-3">
                        {allResults.map((carrier) => (
                            <CarrierCard
                                key={carrier.id}
                                carrier={carrier}
                                onSelect={() => onSelectCarrier(carrier)}
                                isSelected={selectedCarrierId === carrier.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && carriers.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-muted-foreground">
                            <p className="font-medium mb-1">No carriers match your criteria</p>
                            <p className="text-sm">Try broadening your search or filters</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Skip Option */}
            <div className="flex justify-center">
                <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
                    Skip — Create Without Carrier
                </Button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// CarrierCard — Individual carrier result card
// ---------------------------------------------------------------------------

interface CarrierCardProps {
    carrier: CarrierWithScore;
    onSelect: () => void;
    isSelected?: boolean;
    isRecommended?: boolean;
}

function CarrierCard({ carrier, onSelect, isSelected, isRecommended }: CarrierCardProps) {
    const isCompliant = carrier.status === "ACTIVE" && isInsuranceValid(carrier.insuranceExpiryDate);
    const scorecard = carrier.scorecard;

    return (
        <Card
            className={cn(
                "transition-all hover:shadow-md",
                isRecommended && "border-l-4 border-l-amber-400 bg-amber-50/30",
                isSelected && "ring-2 ring-primary",
                !isCompliant && "opacity-60 bg-red-50"
            )}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{carrier.companyName}</h4>
                            {carrier.tier && <TierBadge tier={carrier.tier} />}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-mono">{carrier.mcNumber || "No MC#"}</span>
                        </div>
                    </div>
                    {scorecard && (
                        <div className="flex items-center gap-1 text-sm font-medium">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{scorecard.score.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-2 pb-3">
                {/* Performance Metrics */}
                {scorecard && (
                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                            <span className="text-muted-foreground">On-time: </span>
                            <span
                                className={cn(
                                    "font-medium",
                                    scorecard.onTimePercentage >= 90 && "text-green-600",
                                    scorecard.onTimePercentage >= 80 && scorecard.onTimePercentage < 90 && "text-amber-600",
                                    scorecard.onTimePercentage < 80 && "text-red-600"
                                )}
                            >
                                {scorecard.onTimePercentage}%
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Claims: </span>
                            <span
                                className={cn(
                                    "font-medium",
                                    scorecard.claimsRate < 1 && "text-green-600",
                                    scorecard.claimsRate >= 1 && scorecard.claimsRate < 3 && "text-amber-600",
                                    scorecard.claimsRate >= 3 && "text-red-600"
                                )}
                            >
                                {scorecard.claimsRate.toFixed(1)}%
                            </span>
                        </div>
                        {carrier.lastUsedDate && (
                            <div>
                                <span className="text-muted-foreground">Last used: </span>
                                <span className="font-medium">
                                    {new Date(carrier.lastUsedDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Lane Rate */}
                {carrier.laneRate ? (
                    <div className="text-sm">
                        <span className="font-semibold text-emerald-600">
                            ${carrier.laneRate.toLocaleString()} for this lane
                        </span>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground italic">No rate history for this lane</div>
                )}

                {/* Compliance & Insurance */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                    {isCompliant ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Compliant
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {carrier.status !== "ACTIVE" ? "Inactive" : "Insurance Expired"}
                        </Badge>
                    )}
                    {carrier.insuranceExpiryDate && (
                        <span className="text-muted-foreground">
                            Insurance: {new Date(carrier.insuranceExpiryDate).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {/* Loads Completed */}
                {carrier.loadsCompleted !== undefined && (
                    <div className="text-xs text-muted-foreground">
                        {carrier.loadsCompleted} load{carrier.loadsCompleted !== 1 ? "s" : ""} completed
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {carrier.phone && (
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`tel:${carrier.phone}`}>
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                            </a>
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                        <a href={`/operations/carriers/${carrier.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Profile
                        </a>
                    </Button>
                </div>
                <Button onClick={onSelect} disabled={!isCompliant} variant={isSelected ? "secondary" : "default"}>
                    {isSelected ? "Selected" : "Select Carrier"}
                </Button>
            </CardFooter>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// TierBadge — Carrier tier badge
// ---------------------------------------------------------------------------

function TierBadge({ tier }: { tier: string }) {
    const variants: Record<string, { bg: string; text: string }> = {
        PLATINUM: { bg: "bg-indigo-100", text: "text-indigo-800" },
        GOLD: { bg: "bg-amber-100", text: "text-amber-800" },
        SILVER: { bg: "bg-slate-200", text: "text-slate-800" },
        BRONZE: { bg: "bg-orange-100", text: "text-orange-800" },
    };

    const variant = variants[tier] || { bg: "bg-slate-200", text: "text-slate-800" };

    return (
        <Badge variant="secondary" className={cn(variant.bg, variant.text, "hover:bg-opacity-80")}>
            {tier}
        </Badge>
    );
}

// ---------------------------------------------------------------------------
// CarrierCardSkeleton — Loading skeleton
// ---------------------------------------------------------------------------

function CarrierCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isInsuranceValid(expiryDate: string | undefined): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry > now;
}
