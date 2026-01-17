import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('integration-hub/webhooks/endpoints')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@ApiTags('Integration Hub')
@ApiBearerAuth('JWT-auth')
export class WebhookEndpointsController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhook endpoints' })
  @ApiStandardResponse('Webhook endpoints list')
  @ApiErrorResponses()
  async listEndpoints(
    @CurrentTenant() tenantId: string,
    @Query() query: WebhookEndpointQueryDto,
  ) {
    return this.webhooksService.listEndpoints(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook endpoint by ID' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiStandardResponse('Webhook endpoint details')
  @ApiErrorResponses()
  async getEndpoint(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.getEndpoint(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create webhook endpoint' })
  @ApiStandardResponse('Webhook endpoint created')
  @ApiErrorResponses()
  async createEndpoint(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWebhookEndpointDto,
  ) {
    const { endpoint, secret } = await this.webhooksService.createEndpoint(tenantId, userId, dto);
    return {
      ...endpoint,
      secret,
      secretHint: 'Save this secret now. It will not be shown again.',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update webhook endpoint' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiStandardResponse('Webhook endpoint updated')
  @ApiErrorResponses()
  async updateEndpoint(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateWebhookEndpointDto,
  ) {
    return this.webhooksService.updateEndpoint(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete webhook endpoint' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiStandardResponse('Webhook endpoint deleted')
  @ApiErrorResponses()
  async deleteEndpoint(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.webhooksService.deleteEndpoint(tenantId, id);
    return { success: true };
  }

  @Post(':id/rotate-secret')
  @ApiOperation({ summary: 'Rotate webhook endpoint secret' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiStandardResponse('Webhook secret rotated')
  @ApiErrorResponses()
  async rotateSecret(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const { endpoint, secret } = await this.webhooksService.rotateSecret(tenantId, id, userId);
    return {
      ...endpoint,
      secret,
      secretHint: 'Save this new secret. The old secret is now invalid.',
    };
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'List webhook deliveries' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiStandardResponse('Webhook deliveries list')
  @ApiErrorResponses()
  async listDeliveries(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: WebhookDeliveryQueryDto,
  ) {
    return this.webhooksService.listDeliveries(tenantId, id, query);
  }

  @Post(':id/deliveries/:deliveryId/replay')
  @ApiOperation({ summary: 'Replay webhook delivery' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiParam({ name: 'deliveryId', description: 'Delivery ID' })
  @ApiStandardResponse('Webhook delivery replayed')
  @ApiErrorResponses()
  async replayDelivery(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.webhooksService.replayDelivery(tenantId, id, deliveryId);
  }
}

@Controller('integration-hub/webhooks/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@ApiTags('Integration Hub')
@ApiBearerAuth('JWT-auth')
export class WebhookSubscriptionsController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhook subscriptions' })
  @ApiStandardResponse('Webhook subscriptions list')
  @ApiErrorResponses()
  async listSubscriptions(
    @CurrentTenant() tenantId: string,
    @Query() query: WebhookSubscriptionQueryDto,
  ) {
    return this.webhooksService.listSubscriptions(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook subscription by ID' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiStandardResponse('Webhook subscription details')
  @ApiErrorResponses()
  async getSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.getSubscription(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create webhook subscription' })
  @ApiStandardResponse('Webhook subscription created')
  @ApiErrorResponses()
  async createSubscription(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.createSubscription(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update webhook subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiStandardResponse('Webhook subscription updated')
  @ApiErrorResponses()
  async updateSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.updateSubscription(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete webhook subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiStandardResponse('Webhook subscription deleted')
  @ApiErrorResponses()
  async deleteSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.webhooksService.deleteSubscription(tenantId, id);
    return { success: true };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test webhook subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiStandardResponse('Webhook subscription tested')
  @ApiErrorResponses()
  async testSubscription(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.webhooksService.testSubscription(tenantId, id);
  }
}
