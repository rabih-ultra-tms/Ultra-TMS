import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// Services
import { IntegrationsService } from './integrations.service';
import { WebhooksService } from './webhooks.service';
import { SyncService } from './sync.service';

// Controllers
import { IntegrationProvidersController, IntegrationsController } from './integrations.controller';
import { WebhookEndpointsController, WebhookSubscriptionsController } from './webhooks.controller';
import { SyncJobsController, ApiLogsController, TransformationsController } from './sync.controller';

@Module({
  providers: [
    PrismaService,
    IntegrationsService,
    WebhooksService,
    SyncService,
  ],
  controllers: [
    IntegrationProvidersController,
    IntegrationsController,
    WebhookEndpointsController,
    WebhookSubscriptionsController,
    SyncJobsController,
    ApiLogsController,
    TransformationsController,
  ],
  exports: [
    IntegrationsService,
    WebhooksService,
    SyncService,
  ],
})
export class IntegrationHubModule {}
