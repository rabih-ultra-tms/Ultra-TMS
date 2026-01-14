import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './prisma.service';

// Core infrastructure modules
import { RedisModule } from './modules/redis/redis.module';
import { EmailModule } from './modules/email/email.module';
import { StorageModule } from './modules/storage/storage.module';

// Feature modules - Phase 1 (Services 1-6 with schema)
import { AuthModule } from './modules/auth/auth.module';
import { HelpDeskModule } from './modules/help-desk/help-desk.module';
import { CrmModule } from './modules/crm/crm.module';
import { SalesModule } from './modules/sales/sales.module';
import { TmsModule } from './modules/tms/tms.module';
import { CarrierModule } from './modules/carrier/carrier.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { LoadBoardModule } from './modules/load-board/load-board.module';
import { CommissionModule } from './modules/commission/commission.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { CreditModule } from './modules/credit/credit.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { CustomerPortalModule } from './modules/customer-portal/customer-portal.module';
import { CarrierPortalModule } from './modules/carrier-portal/carrier-portal.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { AgentsModule } from './modules/agents/agents.module';
import { FactoringModule } from './modules/factoring/factoring.module';
import { EdiModule } from './modules/edi/edi.module';
import { SafetyModule } from './modules/safety/safety.module';
import { RateIntelligenceModule } from './modules/rate-intelligence/rate-intelligence.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
import { SearchModule } from './modules/search/search.module';
import { AuditModule } from './modules/audit/audit.module';
import { ConfigModule } from './modules/config/config.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { CacheModule } from './modules/cache/cache.module';
import { HrModule } from './modules/hr/hr.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

// Support services - commented out until schemas are added
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
// import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    // Configuration module - loads .env
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot({
      // Enable wildcard listeners so audit can capture *.created/updated/deleted events
      wildcard: true,
      delimiter: '.',
    }),
    // Infrastructure
    RedisModule,
    EmailModule,
    StorageModule,
    // Core services (01-06)
    AuthModule,
    CrmModule,
    SalesModule,
    TmsModule,
    CarrierModule,
    AccountingModule,
    LoadBoardModule,
    CommissionModule,
    DocumentsModule,
    CommunicationModule,
    CreditModule,
    ClaimsModule,
    CustomerPortalModule,
    CarrierPortalModule,
    ContractsModule,
    AgentsModule,
    FactoringModule,
    EdiModule,
    SafetyModule,
    RateIntelligenceModule,
    AnalyticsModule,
    WorkflowModule,
    IntegrationHubModule,
    SearchModule,
    AuditModule,
    ConfigModule,
    SchedulerModule,
    CacheModule,
    HrModule,
    HelpDeskModule,
    FeedbackModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
