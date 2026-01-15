import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WebhookStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma.service';
import { CredentialMaskerService } from './services/credential-masker.service';
import {
  CreateWebhookEndpointDto,
  CreateWebhookSubscriptionDto,
  UpdateWebhookEndpointDto,
  UpdateWebhookSubscriptionDto,
  WebhookDeliveryListResponseDto,
  WebhookDeliveryQueryDto,
  WebhookDeliveryResponseDto,
  WebhookEndpointListResponseDto,
  WebhookEndpointQueryDto,
  WebhookEndpointResponseDto,
  WebhookSubscriptionListResponseDto,
  WebhookSubscriptionQueryDto,
  WebhookSubscriptionResponseDto,
} from './dto';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialMasker: CredentialMaskerService,
  ) {}

  private generateSecret(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  // Inbound endpoints
  async listEndpoints(
    tenantId: string,
    query: WebhookEndpointQueryDto,
  ): Promise<WebhookEndpointListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WebhookEndpointWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.webhookEndpoint.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.webhookEndpoint.count({ where }),
    ]);

    return {
      data: rows.map(r => this.toEndpointDto(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEndpoint(tenantId: string, id: string): Promise<WebhookEndpointResponseDto> {
    const endpoint = await this.prisma.webhookEndpoint.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return this.toEndpointDto(endpoint);
  }

  async createEndpoint(
    tenantId: string,
    userId: string,
    dto: CreateWebhookEndpointDto,
  ): Promise<{ endpoint: WebhookEndpointResponseDto; secret: string }> {
    const secret = this.generateSecret();
    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        tenantId,
        name: dto.name,
        url: dto.url,
        description: dto.description,
        events: dto.events,
        secret,
        status: 'ACTIVE',
        createdById: userId,
        updatedById: userId,
      },
    });

    return { endpoint: this.toEndpointDto(endpoint, true), secret };
  }

  async updateEndpoint(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateWebhookEndpointDto,
  ): Promise<WebhookEndpointResponseDto> {
    await this.getEndpoint(tenantId, id);

    const data: Prisma.WebhookEndpointUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.events !== undefined ? { events: dto.events } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      updatedById: userId,
    };

    await this.prisma.webhookEndpoint.update({ where: { id }, data });
    return this.getEndpoint(tenantId, id);
  }

  async deleteEndpoint(tenantId: string, id: string): Promise<void> {
    await this.getEndpoint(tenantId, id);
    await this.prisma.webhookEndpoint.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DISABLED' },
    });
  }

  async rotateSecret(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<{ endpoint: WebhookEndpointResponseDto; secret: string }> {
    await this.getEndpoint(tenantId, id);
    const secret = this.generateSecret();
    await this.prisma.webhookEndpoint.update({
      where: { id },
      data: { secret, updatedById: userId },
    });
    const endpoint = await this.prisma.webhookEndpoint.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return { endpoint: this.toEndpointDto(endpoint, true), secret };
  }

  // Outbound subscriptions
  async listSubscriptions(
    tenantId: string,
    query: WebhookSubscriptionQueryDto,
    endpointId?: string,
  ): Promise<WebhookSubscriptionListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WebhookSubscriptionWhereInput = {
      tenantId,
      deletedAt: null,
      ...(endpointId ? { webhookEndpointId: endpointId } : {}),
      ...(query.eventType ? { eventType: query.eventType } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.webhookSubscription.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.webhookSubscription.count({ where }),
    ]);

    return {
      data: rows.map(r => this.toSubscriptionDto(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSubscription(tenantId: string, id: string): Promise<WebhookSubscriptionResponseDto> {
    const subscription = await this.prisma.webhookSubscription.findFirst({
      where: { id, tenantId, deletedAt: null },
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
    await this.ensureEndpoint(tenantId, dto.webhookEndpointId);

    const subscription = await this.prisma.webhookSubscription.create({
      data: {
        tenantId,
        webhookEndpointId: dto.webhookEndpointId,
        eventType: dto.eventType,
        filterConditions: (dto.filterConditions ?? {}) as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.getSubscription(tenantId, subscription.id);
  }

  async updateSubscription(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateWebhookSubscriptionDto,
  ): Promise<WebhookSubscriptionResponseDto> {
    await this.getSubscription(tenantId, id);

    const data: Prisma.WebhookSubscriptionUpdateInput = {
      ...(dto.eventType !== undefined ? { eventType: dto.eventType } : {}),
      ...(dto.filterConditions !== undefined
        ? { filterConditions: dto.filterConditions as Prisma.InputJsonValue }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      updatedById: userId,
    };

    await this.prisma.webhookSubscription.update({ where: { id }, data });
    return this.getSubscription(tenantId, id);
  }

  async deleteSubscription(tenantId: string, id: string): Promise<void> {
    await this.getSubscription(tenantId, id);
    await this.prisma.webhookSubscription.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async testSubscription(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    const subscription = await this.prisma.webhookSubscription.findFirst({ where: { id, tenantId, deletedAt: null } });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    await this.prisma.webhookDelivery.create({
      data: {
        tenantId,
        endpointId: subscription.webhookEndpointId,
        event: 'TEST',
        payload: { message: 'Test webhook delivery' } as Prisma.InputJsonValue,
        status: WebhookStatus.DELIVERED,
        responseStatus: 200,
        attempts: 1,
        lastAttempt: new Date(),
      },
    });

    return { success: true, message: 'Test webhook queued successfully' };
  }

  // Deliveries (historical)
  async listDeliveries(
    tenantId: string,
    endpointId: string,
    query: WebhookDeliveryQueryDto,
  ): Promise<WebhookDeliveryListResponseDto> {
    await this.ensureEndpoint(tenantId, endpointId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WebhookDeliveryWhereInput = {
      tenantId,
      endpointId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.event ? { event: query.event } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.webhookDelivery.count({ where }),
    ]);

    return {
      data: rows.map(r => this.toDeliveryDto(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async replayDelivery(
    tenantId: string,
    endpointId: string,
    deliveryId: string,
  ): Promise<WebhookDeliveryResponseDto> {
    await this.ensureEndpoint(tenantId, endpointId);

    const delivery = await this.prisma.webhookDelivery.findFirst({
      where: { id: deliveryId, endpointId, tenantId, deletedAt: null },
    });

    if (!delivery) {
      throw new NotFoundException('Webhook delivery not found');
    }

    const replay = await this.prisma.webhookDelivery.create({
      data: {
        tenantId,
        endpointId,
        integrationId: delivery.integrationId,
        event: delivery.event,
        payload: delivery.payload as Prisma.InputJsonValue,
        requestHeaders: delivery.requestHeaders as Prisma.InputJsonValue,
        requestBody: delivery.requestBody as Prisma.InputJsonValue,
        status: WebhookStatus.RETRYING,
        attempts: 0,
      },
    });

    return this.toDeliveryDto(replay);
  }

  private async ensureEndpoint(tenantId: string, endpointId: string) {
    const endpoint = await this.prisma.webhookEndpoint.findFirst({ where: { id: endpointId, tenantId, deletedAt: null } });
    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return endpoint;
  }

  private toEndpointDto(endpoint: any, includeSecret = false): WebhookEndpointResponseDto {
    return {
      id: endpoint.id,
      name: endpoint.name,
      url: endpoint.url,
      events: [...(endpoint.events ?? [])],
      description: endpoint.description,
      secret: includeSecret
        ? endpoint.secret
        : this.credentialMasker.maskSecret(endpoint.secret),
      status: endpoint.status,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    };
  }

  private toSubscriptionDto(subscription: any): WebhookSubscriptionResponseDto {
    return {
      id: subscription.id,
      webhookEndpointId: subscription.webhookEndpointId,
      eventType: subscription.eventType,
      filterConditions: JSON.parse(JSON.stringify(subscription.filterConditions ?? {})),
      isActive: subscription.isActive,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  private toDeliveryDto(delivery: any): WebhookDeliveryResponseDto {
    return {
      id: delivery.id,
      event: delivery.event,
      status: delivery.status,
      responseStatus: delivery.responseStatus ?? undefined,
      attempts: delivery.attempts,
      lastAttempt: delivery.lastAttempt ?? undefined,
      nextRetry: delivery.nextRetry ?? undefined,
      createdAt: delivery.createdAt,
    };
  }
}
