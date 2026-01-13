import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IntegrationsService } from './integrations.service';
import { WebhooksService } from './webhooks.service';
import { SyncService } from './sync.service';
import { IntegrationProvidersController, IntegrationsController } from './integrations.controller';
import { WebhookEndpointsController, WebhookSubscriptionsController } from './webhooks.controller';
import { ApiLogsController, SyncJobsController, TransformationsController } from './sync.controller';

@Module({
  controllers: [
    IntegrationProvidersController,
    IntegrationsController,
    WebhookEndpointsController,
    WebhookSubscriptionsController,
    SyncJobsController,
    ApiLogsController,
    TransformationsController,
  ],
  providers: [PrismaService, IntegrationsService, WebhooksService, SyncService],
})
export class IntegrationHubModule {}
