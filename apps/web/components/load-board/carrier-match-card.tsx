"use client";

import { Send, Shield, ShieldAlert, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarrierMatch } from "@/types/load-board";

interface CarrierMatchCardProps {
    match: CarrierMatch;
    onTender: () => void;
    isTendering: boolean;
}

function scoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
}

function scoreBg(score: number): string {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
}

const INSURANCE_CONFIG: Record<
    string,
    { icon: React.ElementType; label: string; className: string }
> = {
    valid: {
        icon: ShieldCheck,
        label: "Insured",
        className: "text-green-600",
    },
    expired: {
        icon: ShieldAlert,
        label: "Expired",
        className: "text-red-600",
    },
    pending: {
        icon: Shield,
        label: "Pending",
        className: "text-yellow-600",
    },
};

export function CarrierMatchCard({
    match,
    onTender,
    isTendering,
}: CarrierMatchCardProps) {
    const fallback = { icon: Shield, label: "Pending", className: "text-yellow-600" };
    const insurance = INSURANCE_CONFIG[match.insuranceStatus] ?? fallback;
    const InsuranceIcon = insurance.icon;

    return (
        <div className="flex items-center justify-between rounded-md border p-3">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        {match.companyName || match.carrierName}
                    </span>
                    {match.mcNumber && (
                        <span className="text-xs text-muted-foreground">
                            MC#{match.mcNumber}
                        </span>
                    )}
                    <div
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${scoreBg(match.matchScore)}`}
                    >
                        <span className={scoreColor(match.matchScore)}>
                            {match.matchScore}
                        </span>
                        <span className="text-muted-foreground">/100</span>
                    </div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {match.onTimePercentage != null && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {match.onTimePercentage.toFixed(0)}% on-time
                        </span>
                    )}
                    {match.claimsRate != null && (
                        <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {match.claimsRate.toFixed(1)}% claims
                        </span>
                    )}
                    <span
                        className={`flex items-center gap-1 ${insurance.className}`}
                    >
                        <InsuranceIcon className="h-3 w-3" />
                        {insurance.label}
                    </span>
                </div>
            </div>
            <Button
                size="sm"
                variant="outline"
                onClick={onTender}
                disabled={isTendering}
                className="shrink-0 ml-3"
            >
                <Send className="h-3.5 w-3.5 mr-1" />
                Tender
            </Button>
        </div>
    );
}
