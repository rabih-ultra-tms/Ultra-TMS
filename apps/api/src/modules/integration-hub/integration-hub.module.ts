import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IntegrationsService } from './integrations.service';
import { WebhooksService } from './webhooks.service';
import { SyncService } from './sync.service';
import { CredentialMaskerService } from './services/credential-masker.service';
import { EncryptionService } from './services/encryption.service';
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
  providers: [
    PrismaService,
    IntegrationsService,
    WebhooksService,
    SyncService,
    CredentialMaskerService,
    EncryptionService,
  ],
})
export class IntegrationHubModule {}
