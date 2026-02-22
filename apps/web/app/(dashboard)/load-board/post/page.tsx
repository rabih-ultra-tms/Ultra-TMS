"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostingForm } from "@/components/load-board/posting-form";

export default function PostLoadPage() {
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
                        Post New Load
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a load board posting to find carriers
                    </p>
                </div>
            </div>

            {/* Form */}
            <PostingForm />
        </div>
    );
}
