"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Load } from "@/types/loads";
import { ChevronDown, Edit, ArrowLeft, MoreHorizontal, Printer, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadStatusBadge } from "./load-status-badge";

interface LoadDetailHeaderProps {
    load: Load;
}

export function LoadDetailHeader({ load }: LoadDetailHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-4 border-b bg-background px-6 py-4 shadow-sm">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/operations/loads" className="hover:text-foreground">Operations</Link>
                <span>/</span>
                <Link href="/operations/loads" className="hover:text-foreground">Loads</Link>
                <span>/</span>
                <span className="text-foreground font-medium">{load.loadNumber}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">{load.loadNumber}</h1>
                    <LoadStatusBadge status={load.status} />

                    {load.carrier ? (
                        <Link href={`/carriers/${load.carrier.id}`} className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                            {load.carrier.legalName}
                        </Link>
                    ) : (
                        <span className="text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded text-sm">Unassigned</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/operations/loads/${load.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Load
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Actions <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" /> Copy Load Number
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" /> Print Summary
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                Delete Load
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
