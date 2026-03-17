'use client';

import { useState } from 'react';
import {
  Contract,
  RateTable,
  Amendment,
  SLA,
  VolumeCommitment,
} from '@/lib/api/contracts/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Table2,
  MapPin,
  BookOpen,
  BarChart3,
  Package,
  FileStack,
} from 'lucide-react';
import ContractOverviewTab from './ContractOverviewTab';
import RateTablesTab from './RateTablesTab';
import LaneRatesTab from './LaneRatesTab';
import AmendmentsTab from './AmendmentsTab';
import SLAsTab from './SLAsTab';
import VolumeCommitmentsTab from './VolumeCommitmentsTab';
import DocumentsTab from './DocumentsTab';

interface ContractDetailTabsProps {
  contract: Contract;
  rateTables: RateTable[];
  amendments: Amendment[];
  slas: SLA[];
  volumeCommitments: VolumeCommitment[];
  isLoading: boolean;
}

export default function ContractDetailTabs({
  contract,
  rateTables,
  amendments,
  slas,
  volumeCommitments,
  isLoading,
}: ContractDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
        <TabsTrigger value="overview" className="gap-2">
          <FileText className="size-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="rate-tables" className="gap-2">
          <Table2 className="size-4" />
          <span className="hidden sm:inline">Rate Tables</span>
        </TabsTrigger>
        <TabsTrigger value="lanes" className="gap-2">
          <MapPin className="size-4" />
          <span className="hidden sm:inline">Lanes</span>
        </TabsTrigger>
        <TabsTrigger value="amendments" className="gap-2">
          <BookOpen className="size-4" />
          <span className="hidden sm:inline">Amendments</span>
        </TabsTrigger>
        <TabsTrigger value="slas" className="gap-2">
          <BarChart3 className="size-4" />
          <span className="hidden sm:inline">SLAs</span>
        </TabsTrigger>
        <TabsTrigger value="volume" className="gap-2">
          <Package className="size-4" />
          <span className="hidden sm:inline">Volume</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-2">
          <FileStack className="size-4" />
          <span className="hidden sm:inline">Docs</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <ContractOverviewTab contract={contract} />
      </TabsContent>

      <TabsContent value="rate-tables" className="space-y-6">
        <RateTablesTab rateTables={rateTables} contractId={contract.id} />
      </TabsContent>

      <TabsContent value="lanes" className="space-y-6">
        <LaneRatesTab rateTables={rateTables} />
      </TabsContent>

      <TabsContent value="amendments" className="space-y-6">
        <AmendmentsTab
          amendments={amendments}
          contractId={contract.id}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="slas" className="space-y-6">
        <SLAsTab slas={slas} contractId={contract.id} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="volume" className="space-y-6">
        <VolumeCommitmentsTab
          volumeCommitments={volumeCommitments}
          contractId={contract.id}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="documents" className="space-y-6">
        <DocumentsTab attachments={contract.attachments || []} />
      </TabsContent>
    </Tabs>
  );
}
