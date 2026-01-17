import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './prisma.service';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AuditInterceptor } from './modules/audit/interceptors/audit.interceptor';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';

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
import { HealthModule } from './modules/health/health.module';

// Support services - commented out until schemas are added
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
// import { WorkflowModule } from './modules/workflow/workflow.module';

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

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
    ThrottlerModule.forRoot(
      isTestEnv
        ? [
            {
              name: 'short',
              ttl: 1,
              limit: 1000000,
            },
          ]
        : [
            {
              name: 'short',
              ttl: 1000,
              limit: 3,
            },
            {
              name: 'medium',
              ttl: 10000,
              limit: 20,
            },
            {
              name: 'long',
              ttl: 60000,
              limit: 100,
            },
          ],
    ),
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
    HealthModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
