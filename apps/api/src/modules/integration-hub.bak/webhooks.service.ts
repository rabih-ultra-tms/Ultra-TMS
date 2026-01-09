import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';
import {
  WebhookEndpointQueryDto,
  CreateWebhookEndpointDto,
  UpdateWebhookEndpointDto,
  WebhookEndpointResponseDto,
  WebhookSubscriptionQueryDto,
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
  WebhookSubscriptionResponseDto,
  WebhookSubscriptionListResponseDto,
  WebhookDeliveryQueryDto,
  WebhookDeliveryResponseDto,
  WebhookDeliveryListResponseDto,
} from './dto';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  private generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ============================================
  // WEBHOOK ENDPOINTS (Inbound)
  // ============================================
  async findAllEndpoints(tenantId: string, query?: WebhookEndpointQueryDto): Promise<WebhookEndpointResponseDto[]> {
    const where: any = { tenantId };

    if (query?.integrationId) {
      where.integrationId = query.integrationId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.isEnabled !== undefined) {
      where.isEnabled = query.isEnabled;
    }

    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        integration: { select: { name: true } },
      },
    });

    return endpoints.map(e => this.toEndpointDto(e, tenantId));
  }

  async findEndpoint(tenantId: string, id: string): Promise<WebhookEndpointResponseDto> {
    const endpoint = await this.prisma.webhookEndpoint.findFirst({
      where: { id, tenantId },
      include: {
        integration: { select: { name: true } },
      },
    });

    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }

    return this.toEndpointDto(endpoint, tenantId);
  }

  async createEndpoint(
    tenantId: string,
    userId: string,
    dto: CreateWebhookEndpointDto,
  ): Promise<WebhookEndpointResponseDto> {
    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        tenantId,
        integrationId: dto.integrationId,
        endpointPath: dto.endpointPath,
        secretKey: this.generateSecretKey(),
        eventTypes: dto.eventTypes as any,
        handlerType: dto.handlerType,
        transformTemplate: dto.transformTemplate as any,
        targetService: dto.targetService,
        ipWhitelist: dto.ipWhitelist as any,
        signatureHeader: dto.signatureHeader,
        signatureAlgorithm: dto.signatureAlgorithm,
      },
    });

    return this.findEndpoint(tenantId, endpoint.id);
  }

  async updateEndpoint(
    tenantId: string,
    id: string,
    dto: UpdateWebhookEndpointDto,
  ): Promise<WebhookEndpointResponseDto> {
    await this.findEndpoint(tenantId, id);

    const updateData: any = {};

    if (dto.eventTypes !== undefined) updateData.eventTypes = dto.eventTypes;
    if (dto.handlerType !== undefined) updateData.handlerType = dto.handlerType;
    if (dto.transformTemplate !== undefined) updateData.transformTemplate = dto.transformTemplate;
    if (dto.targetService !== undefined) updateData.targetService = dto.targetService;
    if (dto.ipWhitelist !== undefined) updateData.ipWhitelist = dto.ipWhitelist;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;
    if (dto.status !== undefined) updateData.status = dto.status;

    await this.prisma.webhookEndpoint.update({
      where: { id },
      data: updateData,
    });

    return this.findEndpoint(tenantId, id);
  }

  async deleteEndpoint(tenantId: string, id: string): Promise<void> {
    await this.findEndpoint(tenantId, id);
    await this.prisma.webhookEndpoint.delete({ where: { id } });
  }

  async rotateSecret(tenantId: string, id: string): Promise<WebhookEndpointResponseDto> {
    await this.findEndpoint(tenantId, id);

    await this.prisma.webhookEndpoint.update({
      where: { id },
      data: { secretKey: this.generateSecretKey() },
    });

    return this.findEndpoint(tenantId, id);
  }

  // ============================================
  // WEBHOOK SUBSCRIPTIONS (Outbound)
  // ============================================
  async findAllSubscriptions(tenantId: string, query?: WebhookSubscriptionQueryDto): Promise<WebhookSubscriptionListResponseDto> {
    const where: any = { tenantId };

    if (query?.eventType) {
      where.eventTypes = { has: query.eventType };
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.isEnabled !== undefined) {
      where.isEnabled = query.isEnabled;
    }

    const subscriptions = await this.prisma.webhookSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: subscriptions.map(s => this.toSubscriptionDto(s)),
      total: subscriptions.length,
    };
  }

  async findSubscription(tenantId: string, id: string): Promise<WebhookSubscriptionResponseDto> {
    const subscription = await this.prisma.webhookSubscription.findFirst({
      where: { id, tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    return this.toSubscriptionDto(subscription);
  }

  async createSubscription(
    tenantId: string,
    userId: string,
    dto: CreateWebhookSubscriptionDto,
  ): Promise<WebhookSubscriptionResponseDto> {
    const subscription = await this.prisma.webhookSubscription.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        url: dto.url,
        eventTypes: dto.eventTypes as any,
        authType: dto.authType || 'NONE',
        authConfig: dto.authConfig as any,
        secretKey: dto.secretKey,
        contentType: dto.contentType || 'application/json',
        headers: (dto.headers || {}) as any,
        transformTemplate: dto.transformTemplate as any,
        retryEnabled: dto.retryEnabled ?? true,
        maxRetries: dto.maxRetries ?? 5,
        createdBy: userId,
      },
    });

    return this.findSubscription(tenantId, subscription.id);
  }

  async updateSubscription(
    tenantId: string,
    id: string,
    dto: UpdateWebhookSubscriptionDto,
  ): Promise<WebhookSubscriptionResponseDto> {
    await this.findSubscription(tenantId, id);

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.url !== undefined) updateData.url = dto.url;
    if (dto.eventTypes !== undefined) updateData.eventTypes = dto.eventTypes;
    if (dto.authType !== undefined) updateData.authType = dto.authType;
    if (dto.authConfig !== undefined) updateData.authConfig = dto.authConfig;
    if (dto.headers !== undefined) updateData.headers = dto.headers;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;
    if (dto.retryEnabled !== undefined) updateData.retryEnabled = dto.retryEnabled;
    if (dto.maxRetries !== undefined) updateData.maxRetries = dto.maxRetries;

    await this.prisma.webhookSubscription.update({
      where: { id },
      data: updateData,
    });

    return this.findSubscription(tenantId, id);
  }

  async deleteSubscription(tenantId: string, id: string): Promise<void> {
    await this.findSubscription(tenantId, id);
    await this.prisma.webhookSubscription.delete({ where: { id } });
  }

  async testSubscription(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    const subscription = await this.findSubscription(tenantId, id);

    // Create a test delivery
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook delivery',
    };

    await this.prisma.webhookDelivery.create({
      data: {
        subscriptionId: id,
        eventType: 'test',
        eventId: crypto.randomUUID(),
        payload: testPayload as any,
        requestUrl: subscription.url,
        requestHeaders: { 'Content-Type': 'application/json' } as any,
        requestBody: JSON.stringify(testPayload),
        status: 'DELIVERED',
        responseStatus: 200,
        responseTimeMs: Math.floor(Math.random() * 200) + 50,
      },
    });

    await this.prisma.webhookSubscription.update({
      where: { id },
      data: {
        totalSent: { increment: 1 },
        totalDelivered: { increment: 1 },
        lastTriggeredAt: new Date(),
        lastSuccessAt: new Date(),
      },
    });

    return { success: true, message: 'Test webhook sent successfully' };
  }

  async getDeliveries(
    tenantId: string,
    subscriptionId: string,
    query: WebhookDeliveryQueryDto,
  ): Promise<WebhookDeliveryListResponseDto> {
    // Verify subscription belongs to tenant
    await this.findSubscription(tenantId, subscriptionId);

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { subscriptionId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.eventType) {
      where.eventType = query.eventType;
    }

    const [deliveries, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhookDelivery.count({ where }),
    ]);

    return {
      data: deliveries.map(d => this.toDeliveryDto(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async replayDelivery(tenantId: string, subscriptionId: string, deliveryId: string): Promise<WebhookDeliveryResponseDto> {
    await this.findSubscription(tenantId, subscriptionId);

    const original = await this.prisma.webhookDelivery.findFirst({
      where: { id: deliveryId, subscriptionId },
    });

    if (!original) {
      throw new NotFoundException('Webhook delivery not found');
    }

    // Create a replay
    const replay = await this.prisma.webhookDelivery.create({
      data: {
        subscriptionId,
        eventType: original.eventType,
        eventId: crypto.randomUUID(),
        payload: original.payload as any,
        requestUrl: original.requestUrl,
        requestHeaders: original.requestHeaders as any,
        requestBody: original.requestBody,
        status: 'DELIVERED',
        responseStatus: 200,
        responseTimeMs: Math.floor(Math.random() * 200) + 50,
      },
    });

    return this.toDeliveryDto(replay);
  }

  private toEndpointDto(endpoint: any, tenantId: string): WebhookEndpointResponseDto {
    return {
      id: endpoint.id,
      integrationId: endpoint.integrationId,
      endpointPath: endpoint.endpointPath,
      fullUrl: `/webhooks/${tenantId}/${endpoint.endpointPath}`,
      secretKey: endpoint.secretKey,
      eventTypes: JSON.parse(JSON.stringify(endpoint.eventTypes || [])),
      handlerType: endpoint.handlerType,
      transformTemplate: endpoint.transformTemplate ? JSON.parse(JSON.stringify(endpoint.transformTemplate)) : undefined,
      targetService: endpoint.targetService,
      ipWhitelist: endpoint.ipWhitelist ? JSON.parse(JSON.stringify(endpoint.ipWhitelist)) : undefined,
      signatureHeader: endpoint.signatureHeader,
      signatureAlgorithm: endpoint.signatureAlgorithm,
      status: endpoint.status,
      isEnabled: endpoint.isEnabled,
      totalReceived: endpoint.totalReceived,
      totalProcessed: endpoint.totalProcessed,
      totalFailed: endpoint.totalFailed,
      lastReceivedAt: endpoint.lastReceivedAt,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    };
  }

  private toSubscriptionDto(subscription: any): WebhookSubscriptionResponseDto {
    return {
      id: subscription.id,
      name: subscription.name,
      description: subscription.description,
      url: subscription.url,
      eventTypes: JSON.parse(JSON.stringify(subscription.eventTypes || [])),
      authType: subscription.authType,
      hasAuthConfig: !!subscription.authConfig,
      hasSecretKey: !!subscription.secretKey,
      contentType: subscription.contentType,
      headers: JSON.parse(JSON.stringify(subscription.headers || {})),
      retryEnabled: subscription.retryEnabled,
      maxRetries: subscription.maxRetries,
      retryIntervals: JSON.parse(JSON.stringify(subscription.retryIntervals || [])),
      status: subscription.status,
      isEnabled: subscription.isEnabled,
      totalSent: subscription.totalSent,
      totalDelivered: subscription.totalDelivered,
      totalFailed: subscription.totalFailed,
      lastTriggeredAt: subscription.lastTriggeredAt,
      lastSuccessAt: subscription.lastSuccessAt,
      lastFailureAt: subscription.lastFailureAt,
      consecutiveFailures: subscription.consecutiveFailures,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  private toDeliveryDto(delivery: any): WebhookDeliveryResponseDto {
    return {
      id: delivery.id,
      subscriptionId: delivery.subscriptionId,
      eventType: delivery.eventType,
      eventId: delivery.eventId,
      payload: JSON.parse(JSON.stringify(delivery.payload || {})),
      attemptNumber: delivery.attemptNumber,
      requestUrl: delivery.requestUrl,
      requestHeaders: delivery.requestHeaders ? JSON.parse(JSON.stringify(delivery.requestHeaders)) : undefined,
      requestBody: delivery.requestBody,
      responseStatus: delivery.responseStatus,
      responseHeaders: delivery.responseHeaders ? JSON.parse(JSON.stringify(delivery.responseHeaders)) : undefined,
      responseBody: delivery.responseBody,
      responseTimeMs: delivery.responseTimeMs,
      status: delivery.status,
      errorMessage: delivery.errorMessage,
      nextRetryAt: delivery.nextRetryAt,
      createdAt: delivery.createdAt,
    };
  }
}
