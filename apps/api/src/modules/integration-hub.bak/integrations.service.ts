import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  ProviderQueryDto,
  ProviderResponseDto,
  IntegrationQueryDto,
  CreateIntegrationDto,
  UpdateIntegrationDto,
  IntegrationResponseDto,
  IntegrationListResponseDto,
  IntegrationHealthDto,
  IntegrationStatsDto,
} from './dto';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // PROVIDERS
  // ============================================
  async findAllProviders(category?: string): Promise<ProviderResponseDto[]> {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    const providers = await this.prisma.integrationProvider.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return providers.map(p => this.toProviderDto(p));
  }

  async findProviderByCode(code: string): Promise<ProviderResponseDto> {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { code },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return this.toProviderDto(provider);
  }

  // ============================================
  // INTEGRATIONS
  // ============================================
  async findAll(tenantId: string, query: IntegrationQueryDto): Promise<IntegrationListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.providerId) {
      where.providerId = query.providerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.environment) {
      where.environment = query.environment;
    }

    if (query.isEnabled !== undefined) {
      where.isEnabled = query.isEnabled;
    }

    const [integrations, total] = await Promise.all([
      this.prisma.integration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          provider: { select: { code: true, name: true, category: true } },
        },
      }),
      this.prisma.integration.count({ where }),
    ]);

    return {
      data: integrations.map(i => this.toIntegrationDto(i)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string): Promise<IntegrationResponseDto> {
    const integration = await this.prisma.integration.findFirst({
      where: { id, tenantId },
      include: {
        provider: { select: { code: true, name: true, category: true } },
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return this.toIntegrationDto(integration);
  }

  async create(
    tenantId: string,
    userId: string,
    dto: CreateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    // Verify provider exists
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const integration = await this.prisma.integration.create({
      data: {
        tenantId,
        providerId: dto.providerId,
        name: dto.name,
        description: dto.description,
        config: (dto.config || {}) as any,
        environment: dto.environment || 'PRODUCTION',
        authType: dto.authType,
        apiKeyEncrypted: dto.apiKey, // In production, encrypt this
        oauthTokens: dto.oauthTokens as any,
        syncFrequency: dto.syncFrequency,
        maxRetries: dto.maxRetries ?? 3,
        timeoutSecs: dto.timeoutSecs ?? 30,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        provider: { select: { code: true, name: true, category: true } },
      },
    });

    // Create circuit breaker state
    await this.prisma.circuitBreakerState.create({
      data: {
        integrationId: integration.id,
        state: 'CLOSED',
      },
    });

    return this.toIntegrationDto(integration);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    await this.findOne(tenantId, id);

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.config !== undefined) updateData.config = dto.config;
    if (dto.apiKey !== undefined) updateData.apiKeyEncrypted = dto.apiKey;
    if (dto.syncFrequency !== undefined) updateData.syncFrequency = dto.syncFrequency;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;
    if (dto.retryEnabled !== undefined) updateData.retryEnabled = dto.retryEnabled;
    if (dto.maxRetries !== undefined) updateData.maxRetries = dto.maxRetries;
    if (dto.timeoutSecs !== undefined) updateData.timeoutSecs = dto.timeoutSecs;

    await this.prisma.integration.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);

    await this.prisma.integration.delete({ where: { id } });
  }

  async testConnection(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.findOne(tenantId, id);

    // Simulate connection test
    const success = Math.random() > 0.2; // 80% success rate for demo

    await this.prisma.integration.update({
      where: { id },
      data: success
        ? { lastSuccessfulCall: new Date(), status: 'ACTIVE', errorCount: 0 }
        : { lastErrorAt: new Date(), lastError: 'Connection test failed', errorCount: { increment: 1 } },
    });

    return {
      success,
      message: success ? 'Connection successful' : 'Connection failed',
    };
  }

  async enable(tenantId: string, id: string): Promise<IntegrationResponseDto> {
    await this.findOne(tenantId, id);

    await this.prisma.integration.update({
      where: { id },
      data: { isEnabled: true, status: 'ACTIVE' },
    });

    return this.findOne(tenantId, id);
  }

  async disable(tenantId: string, id: string): Promise<IntegrationResponseDto> {
    await this.findOne(tenantId, id);

    await this.prisma.integration.update({
      where: { id },
      data: { isEnabled: false, status: 'PAUSED' },
    });

    return this.findOne(tenantId, id);
  }

  async refreshOAuth(tenantId: string, id: string): Promise<IntegrationResponseDto> {
    const integration = await this.findOne(tenantId, id);

    // Simulate OAuth refresh
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 1);

    await this.prisma.integration.update({
      where: { id },
      data: {
        oauthExpiresAt: newExpiresAt,
        lastSuccessfulCall: new Date(),
      },
    });

    return this.findOne(tenantId, id);
  }

  async getHealth(tenantId: string, id: string): Promise<IntegrationHealthDto> {
    const integration = await this.prisma.integration.findFirst({
      where: { id, tenantId },
      include: {
        circuitBreaker: true,
        rateLimitBuckets: {
          where: {
            windowEnd: { gte: new Date() },
          },
          orderBy: { windowEnd: 'desc' },
          take: 1,
        },
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const rateBucket = integration.rateLimitBuckets[0];

    return {
      integrationId: id,
      status: integration.status,
      lastSuccessfulCall: integration.lastSuccessfulCall || undefined,
      lastError: integration.lastError || undefined,
      errorCount: integration.errorCount,
      circuitBreakerState: integration.circuitBreaker?.state,
      rateLimitUsage: rateBucket?.requestCount,
      rateLimitMax: rateBucket?.maxRequests,
    };
  }

  async getStats(tenantId: string, id: string): Promise<IntegrationStatsDto> {
    await this.findOne(tenantId, id);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, successful, failed, today, week, month, avgTime] = await Promise.all([
      this.prisma.apiRequestLog.count({ where: { integrationId: id } }),
      this.prisma.apiRequestLog.count({ where: { integrationId: id, status: 'SUCCESS' } }),
      this.prisma.apiRequestLog.count({ where: { integrationId: id, status: { not: 'SUCCESS' } } }),
      this.prisma.apiRequestLog.count({ where: { integrationId: id, createdAt: { gte: startOfDay } } }),
      this.prisma.apiRequestLog.count({ where: { integrationId: id, createdAt: { gte: startOfWeek } } }),
      this.prisma.apiRequestLog.count({ where: { integrationId: id, createdAt: { gte: startOfMonth } } }),
      this.prisma.apiRequestLog.aggregate({
        where: { integrationId: id, responseTimeMs: { not: null } },
        _avg: { responseTimeMs: true },
      }),
    ]);

    return {
      integrationId: id,
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      averageResponseTime: avgTime._avg.responseTimeMs || 0,
      requestsToday: today,
      requestsThisWeek: week,
      requestsThisMonth: month,
    };
  }

  private toProviderDto(provider: any): ProviderResponseDto {
    return {
      id: provider.id,
      code: provider.code,
      name: provider.name,
      category: provider.category,
      description: provider.description,
      configSchema: JSON.parse(JSON.stringify(provider.configSchema || {})),
      authType: provider.authType,
      oauthConfig: provider.oauthConfig ? JSON.parse(JSON.stringify(provider.oauthConfig)) : undefined,
      baseUrl: provider.baseUrl,
      apiVersion: provider.apiVersion,
      documentationUrl: provider.documentationUrl,
      supportsWebhooks: provider.supportsWebhooks,
      supportsBatch: provider.supportsBatch,
      supportsRealtime: provider.supportsRealtime,
      rateLimitRequests: provider.rateLimitRequests,
      rateLimitWindow: provider.rateLimitWindow,
      status: provider.status,
    };
  }

  private toIntegrationDto(integration: any): IntegrationResponseDto {
    return {
      id: integration.id,
      name: integration.name,
      description: integration.description,
      providerId: integration.providerId,
      providerCode: integration.provider?.code,
      providerName: integration.provider?.name,
      config: JSON.parse(JSON.stringify(integration.config || {})),
      environment: integration.environment,
      authType: integration.authType,
      hasApiKey: !!integration.apiKeyEncrypted,
      hasOauthTokens: !!integration.oauthTokens,
      oauthExpiresAt: integration.oauthExpiresAt,
      status: integration.status,
      lastSuccessfulCall: integration.lastSuccessfulCall,
      lastError: integration.lastError,
      lastErrorAt: integration.lastErrorAt,
      errorCount: integration.errorCount,
      isEnabled: integration.isEnabled,
      retryEnabled: integration.retryEnabled,
      maxRetries: integration.maxRetries,
      timeoutSecs: integration.timeoutSecs,
      syncFrequency: integration.syncFrequency,
      lastSyncAt: integration.lastSyncAt,
      nextSyncAt: integration.nextSyncAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}
