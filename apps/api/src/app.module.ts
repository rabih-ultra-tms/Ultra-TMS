import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Feature modules - Phase 1 (Services 1-6 with schema)
import { AuthModule } from './modules/auth/auth.module';
import { CrmModule } from './modules/crm/crm.module';
import { SalesModule } from './modules/sales/sales.module';
import { TmsModule } from './modules/tms/tms.module';
import { CarrierModule } from './modules/carrier/carrier.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { LoadBoardModule } from './modules/load-board/load-board.module';
import { CommissionModule } from './modules/commission/commission.module';

// Support services - commented out until schemas are added
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { DocumentsModule } from './modules/documents/documents.module';
// import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
// import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    // Core services (01-06)
    AuthModule,
    CrmModule,
    SalesModule,
    TmsModule,
    CarrierModule,
    AccountingModule,
    LoadBoardModule,
    CommissionModule,
    // Support services - enable after adding schemas:
    // AnalyticsModule,
    // DocumentsModule,
    // IntegrationHubModule,
    // WorkflowModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
