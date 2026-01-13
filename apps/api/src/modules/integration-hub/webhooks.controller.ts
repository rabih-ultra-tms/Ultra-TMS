import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { WebhooksService } from './webhooks.service';
import {
  CreateWebhookEndpointDto,
  CreateWebhookSubscriptionDto,
  UpdateWebhookEndpointDto,
  UpdateWebhookSubscriptionDto,
  WebhookDeliveryQueryDto,
  WebhookEndpointQueryDto,
  WebhookSubscriptionQueryDto,
} from './dto';

@Controller('integration-hub/webhooks/endpoints')
@UseGuards(JwtAuthGuard)
export class WebhookEndpointsController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async listEndpoints(
    @CurrentTenant() tenantId: string,
    @Query() query: WebhookEndpointQueryDto,
  ) {
    return this.webhooksService.listEndpoints(tenantId, query);
  }

  @Get(':id')
  async getEndpoint(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.getEndpoint(tenantId, id);
  }

  @Post()
  async createEndpoint(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWebhookEndpointDto,
  ) {
    return this.webhooksService.createEndpoint(tenantId, userId, dto);
  }

  @Put(':id')
  async updateEndpoint(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateWebhookEndpointDto,
  ) {
    return this.webhooksService.updateEndpoint(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async deleteEndpoint(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.webhooksService.deleteEndpoint(tenantId, id);
    return { success: true };
  }

  @Post(':id/rotate-secret')
  async rotateSecret(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.webhooksService.rotateSecret(tenantId, id, userId);
  }

  @Get(':id/deliveries')
  async listDeliveries(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: WebhookDeliveryQueryDto,
  ) {
    return this.webhooksService.listDeliveries(tenantId, id, query);
  }

  @Post(':id/deliveries/:deliveryId/replay')
  async replayDelivery(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.webhooksService.replayDelivery(tenantId, id, deliveryId);
  }
}

@Controller('integration-hub/webhooks/subscriptions')
@UseGuards(JwtAuthGuard)
export class WebhookSubscriptionsController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async listSubscriptions(
    @CurrentTenant() tenantId: string,
    @Query() query: WebhookSubscriptionQueryDto,
  ) {
    return this.webhooksService.listSubscriptions(tenantId, query);
  }

  @Get(':id')
  async getSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.getSubscription(tenantId, id);
  }

  @Post()
  async createSubscription(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.createSubscription(tenantId, userId, dto);
  }

  @Put(':id')
  async updateSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.updateSubscription(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async deleteSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.webhooksService.deleteSubscription(tenantId, id);
    return { success: true };
  }

  @Post(':id/test')
  async testSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.testSubscription(tenantId, id);
  }
}
