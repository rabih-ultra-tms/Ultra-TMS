import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    // Support services - enable after adding schemas:
    // AnalyticsModule,
    // IntegrationHubModule,
    // WorkflowModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
