import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { WebhooksService } from './webhooks.service';
import {
  WebhookEndpointQueryDto,
  CreateWebhookEndpointDto,
  UpdateWebhookEndpointDto,
  WebhookSubscriptionQueryDto,
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
  WebhookDeliveryQueryDto,
} from './dto';

@Controller('integration-hub/webhooks/endpoints')
@UseGuards(JwtAuthGuard)
export class WebhookEndpointsController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async findAllEndpoints(
    @CurrentTenant() tenantId: string,
    @Query() query: WebhookEndpointQueryDto,
  ) {
    return this.webhooksService.findAllEndpoints(tenantId, query);
  }

  @Get(':id')
  async findEndpoint(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.findEndpoint(tenantId, id);
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
    @Body() dto: UpdateWebhookEndpointDto,
  ) {
    return this.webhooksService.updateEndpoint(tenantId, id, dto);
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
  ) {
    return this.webhooksService.rotateSecret(tenantId, id);
  }
}

@Controller('integration-hub/webhooks/subscriptions')
@UseGuards(JwtAuthGuard)
export class WebhookSubscriptionsController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async findAllSubscriptions(
    @CurrentTenant() tenantId: string,
    @Query() query: WebhookSubscriptionQueryDto,
  ) {
    return this.webhooksService.findAllSubscriptions(tenantId, query);
  }

  @Get(':id')
  async findSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.findSubscription(tenantId, id);
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
    @Body() dto: UpdateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.updateSubscription(tenantId, id, dto);
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

  @Get(':id/deliveries')
  async getDeliveries(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: WebhookDeliveryQueryDto,
  ) {
    return this.webhooksService.getDeliveries(tenantId, id, query);
  }

  @Post(':subscriptionId/deliveries/:deliveryId/replay')
  async replayDelivery(
    @CurrentTenant() tenantId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.webhooksService.replayDelivery(tenantId, subscriptionId, deliveryId);
  }
}
