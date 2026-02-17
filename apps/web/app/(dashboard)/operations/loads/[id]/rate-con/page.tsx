"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoad } from "@/lib/hooks/tms/use-loads";
import { useRateConfirmation } from "@/lib/hooks/tms/use-rate-confirmation";
import { RateConPreview } from "@/components/tms/documents/rate-con-preview";
import { DocumentActions } from "@/components/tms/documents/document-actions";
import { DetailPageSkeleton } from "@/components/shared/detail-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useState } from "react";

export default function RateConfirmationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const loadId = params.id;

  const { data: load, isLoading: loadLoading, error: loadError, refetch } = useLoad(loadId);

  const {
    pdfUrl,
    generate,
    isGenerating,
    generateError,
    emailToCarrier,
    isEmailing,
    download,
    cleanup,
    hasGenerated,
  } = useRateConfirmation(loadId);

  const [includeAccessorials, setIncludeAccessorials] = useState(true);
  const [includeTerms, setIncludeTerms] = useState(true);
  const [customMessage, setCustomMessage] = useState("");

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (loadLoading) {
    return (
      <div className="p-6">
        <DetailPageSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load load details"
          message={loadError.message}
          retry={refetch}
        />
      </div>
    );
  }

  if (!load) {
    return <div className="p-6">Load not found</div>;
  }

  const handleGenerate = () => {
    generate({
      includeAccessorials,
      includeTerms,
      customMessage: customMessage || undefined,
    });
  };

  const handleEmailCarrier = () => {
    emailToCarrier({
      includeAccessorials,
      includeTerms,
      customMessage: customMessage || undefined,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/operations/loads/${loadId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Load
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">
                Rate Confirmation
              </h1>
              <p className="text-sm text-text-muted">
                {load.loadNumber}
                {load.carrier?.legalName ? ` — ${load.carrier.legalName}` : ""}
              </p>
            </div>
          </div>

          <DocumentActions
            onGenerate={handleGenerate}
            onDownload={download}
            onEmailCarrier={handleEmailCarrier}
            hasGenerated={hasGenerated}
            isGenerating={isGenerating}
            isEmailing={isEmailing}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Options sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                PDF Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="accessorials"
                  checked={includeAccessorials}
                  onCheckedChange={(checked) =>
                    setIncludeAccessorials(checked === true)
                  }
                />
                <Label htmlFor="accessorials" className="text-sm">
                  Include accessorials
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={includeTerms}
                  onCheckedChange={(checked) =>
                    setIncludeTerms(checked === true)
                  }
                />
                <Label htmlFor="terms" className="text-sm">
                  Include terms &amp; conditions
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm">
                  Custom message (optional)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Add a note to the carrier..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Load summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Load Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Load #</span>
                <span className="font-medium">{load.loadNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="font-medium">{load.status}</span>
              </div>
              {load.carrier?.legalName && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Carrier</span>
                  <span className="font-medium">{load.carrier.legalName}</span>
                </div>
              )}
              {load.carrierRate != null && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Carrier Rate</span>
                  <span className="font-medium">
                    ${Number(load.carrierRate).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {load.equipmentType && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Equipment</span>
                  <span className="font-medium">{load.equipmentType}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PDF Preview */}
        <div className="xl:col-span-3">
          <RateConPreview
            pdfUrl={pdfUrl}
            isLoading={isGenerating}
            error={generateError}
          />
        </div>
      </div>
    </div>
  );
}
