"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadsTable } from "@/components/crm/leads/leads-table";
import { LeadsPipeline } from "@/components/crm/leads/leads-pipeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useLeads, useLeadsPipeline } from "@/lib/hooks/crm/use-leads";
import { useCRMStore } from "@/lib/stores/crm-store";
import { useDebounce } from "@/lib/hooks";

const stageOptions = [
  { label: "All", value: "all" },
  { label: "Lead", value: "LEAD" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Proposal", value: "PROPOSAL" },
  { label: "Negotiation", value: "NEGOTIATION" },
  { label: "Won", value: "WON" },
  { label: "Lost", value: "LOST" },
];

export default function LeadsPage() {
  const router = useRouter();
  const { leadFilters, setLeadFilter, leadsViewMode, setLeadsViewMode } = useCRMStore();
  const debouncedSearch = useDebounce(leadFilters.search, 300);
  const [page, setPage] = React.useState(1);

  const leadsQuery = useLeads({
    page,
    limit: 20,
    search: debouncedSearch,
    stage: leadFilters.stage || undefined,
    ownerId: leadFilters.ownerId || undefined,
  });

  const pipelineQuery = useLeadsPipeline();

  const handleCreate = () => router.push("/leads/new");
  const handleView = (id: string) => router.push(`/leads/${id}`);

  const leads = leadsQuery.data?.data || [];
  const pipeline = pipelineQuery.data?.data || {};
  const errorMessage = leadsQuery.error instanceof Error
    ? leadsQuery.error.message
    : "Failed to load leads";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Track your sales pipeline"
        actions={
          <>
            <Button variant="outline" onClick={() => leadsQuery.refetch()} disabled={leadsQuery.isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${leadsQuery.isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Deal
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-md border bg-card p-4 md:flex-row md:items-center">
        <Input
          placeholder="Search deals"
          value={leadFilters.search}
          onChange={(event) => setLeadFilter("search", event.target.value)}
          className="md:w-72"
        />
        <Select
          value={leadFilters.stage || "all"}
          onValueChange={(value) => setLeadFilter("stage", value === "all" ? "" : (value as typeof leadFilters.stage))}
        >
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Owner ID"
          value={leadFilters.ownerId}
          onChange={(event) => setLeadFilter("ownerId", event.target.value)}
          className="md:w-48"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={leadsViewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setLeadsViewMode("table")}
          >
            <List className="mr-2 h-4 w-4" />
            Table
          </Button>
          <Button
            variant={leadsViewMode === "pipeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setLeadsViewMode("pipeline")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Pipeline
          </Button>
        </div>
      </div>

      {leadsQuery.isLoading && !leadsQuery.data ? (
        <LoadingState message="Loading deals..." />
      ) : leadsQuery.error ? (
        <ErrorState title="Failed to load deals" message={errorMessage} retry={() => leadsQuery.refetch()} />
      ) : leads.length === 0 && leadsViewMode === "table" ? (
        <EmptyState
          title="No deals found"
          description="Create a deal to start tracking opportunities."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Deal
            </Button>
          }
        />
      ) : leadsViewMode === "table" ? (
        <LeadsTable
          leads={leads}
          pagination={leadsQuery.data?.pagination}
          onPageChange={setPage}
          onView={handleView}
          isLoading={leadsQuery.isLoading}
        />
      ) : pipelineQuery.isLoading && !pipelineQuery.data ? (
        <LoadingState message="Loading pipeline..." />
      ) : pipelineQuery.error ? (
        <ErrorState
          title="Failed to load pipeline"
          message={
            pipelineQuery.error instanceof Error
              ? pipelineQuery.error.message
              : "Failed to load pipeline"
          }
          retry={() => pipelineQuery.refetch()}
        />
      ) : (
        <LeadsPipeline pipeline={pipeline} onSelectLead={handleView} />
      )}
    </div>
  );
}
