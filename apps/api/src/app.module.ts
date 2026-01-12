import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './prisma.service';

// Core infrastructure modules
import { RedisModule } from './modules/redis/redis.module';
import { EmailModule } from './modules/email/email.module';
import { StorageModule } from './modules/storage/storage.module';

// Feature modules - Phase 1 (Services 1-6 with schema)
import { AuthModule } from './modules/auth/auth.module';
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

// Support services - commented out until schemas are added
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
// import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    // Configuration module - loads .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Event system for inter-module communication
    EventEmitterModule.forRoot(),
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
    // Support services - enable after adding schemas:
    // IntegrationHubModule,
    // WorkflowModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
