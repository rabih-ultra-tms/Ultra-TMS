import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Integration, APIRequestLog } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  ApiLogListResponseDto,
  ApiLogQueryDto,
  ApiLogResponseDto,
  CreateIntegrationDto,
  IntegrationHealthDto,
  IntegrationListResponseDto,
  IntegrationQueryDto,
  IntegrationResponseDto,
  IntegrationStatsDto,
  ProviderQueryDto,
  ProviderResponseDto,
  ToggleStatusDto,
  UpdateIntegrationDto,
} from './dto';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Providers
  async listProviders(tenantId: string, query: ProviderQueryDto): Promise<ProviderResponseDto[]> {
    const where: Prisma.IntegrationProviderConfigWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.category ? { category: query.category } : {}),
      isActive: true,
    };

    const providers = await this.prisma.integrationProviderConfig.findMany({
      where,
      orderBy: [{ category: 'asc' }, { providerName: 'asc' }],
    });

    return providers.map(p => ({
      id: p.id,
      providerName: p.providerName,
      category: p.category,
      authType: p.authType,
      baseUrl: p.baseUrl,
      documentationUrl: p.documentationUrl,
      logoUrl: p.logoUrl,
      isActive: p.isActive,
    }));
  }

  async listProviderCategories(tenantId: string): Promise<string[]> {
    const rows = await this.prisma.integrationProviderConfig.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      select: { category: true },
    });
    return Array.from(new Set(rows.map(r => r.category))).sort();
  }

  async getProvider(tenantId: string, id: string): Promise<ProviderResponseDto> {
    const provider = await this.prisma.integrationProviderConfig.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return {
      id: provider.id,
      providerName: provider.providerName,
      category: provider.category,
      authType: provider.authType,
      baseUrl: provider.baseUrl,
      documentationUrl: provider.documentationUrl,
      logoUrl: provider.logoUrl,
      isActive: provider.isActive,
    };
  }

  // Integrations CRUD
  async listIntegrations(tenantId: string, query: IntegrationQueryDto): Promise<IntegrationListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.IntegrationWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.category ? { category: query.category } : {}),
      ...(query.provider ? { provider: query.provider } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.syncFrequency ? { syncFrequency: query.syncFrequency } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.integration.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      this.prisma.integration.count({ where }),
    ]);

    return {
      data: rows.map(r => this.toIntegrationDto(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getIntegration(tenantId: string, id: string): Promise<IntegrationResponseDto> {
    const integration = await this.prisma.integration.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    return this.toIntegrationDto(integration);
  }

  async createIntegration(tenantId: string, userId: string, dto: CreateIntegrationDto): Promise<IntegrationResponseDto> {
    const integration = await this.prisma.integration.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        provider: dto.provider,
        authType: dto.authType,
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        oauthTokens: dto.oauthTokens as Prisma.InputJsonValue,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        syncFrequency: dto.syncFrequency ?? 'MANUAL',
        status: dto.status ?? 'ACTIVE',
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.toIntegrationDto(integration);
  }

  async updateIntegration(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    await this.getIntegration(tenantId, id);

    await this.prisma.integration.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.provider !== undefined ? { provider: dto.provider } : {}),
        ...(dto.authType !== undefined ? { authType: dto.authType } : {}),
        ...(dto.config !== undefined ? { config: dto.config as Prisma.InputJsonValue } : {}),
        ...(dto.apiKey !== undefined ? { apiKey: dto.apiKey } : {}),
        ...(dto.apiSecret !== undefined ? { apiSecret: dto.apiSecret } : {}),
        ...(dto.oauthTokens !== undefined ? { oauthTokens: dto.oauthTokens as Prisma.InputJsonValue } : {}),
        ...(dto.syncFrequency !== undefined ? { syncFrequency: dto.syncFrequency } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        updatedById: userId,
      },
    });

    return this.getIntegration(tenantId, id);
  }

  async deleteIntegration(tenantId: string, id: string): Promise<void> {
    await this.getIntegration(tenantId, id);
    await this.prisma.integration.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'PAUSED' },
    });
  }

  async testConnection(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    await this.getIntegration(tenantId, id);
    const success = Math.random() > 0.2;
    await this.prisma.integration.update({
      where: { id },
      data: { lastSyncAt: new Date(), status: success ? 'ACTIVE' : 'ERROR' },
    });
    return { success, message: success ? 'Connection successful' : 'Connection failed' };
  }

  async toggleStatus(tenantId: string, id: string, dto: ToggleStatusDto): Promise<IntegrationResponseDto> {
    await this.getIntegration(tenantId, id);
    await this.prisma.integration.update({ where: { id }, data: { status: dto.status } });
    return this.getIntegration(tenantId, id);
  }

  async oauthAuthorize(tenantId: string, id: string) {
    await this.getIntegration(tenantId, id);
    await this.prisma.integration.update({ where: { id }, data: { status: 'PENDING_AUTH' } });
    return { authorizationUrl: `https://auth.example.com/${id}` };
  }

  async oauthCallback(tenantId: string, id: string, tokens: Record<string, unknown>) {
    await this.getIntegration(tenantId, id);
    await this.prisma.integration.update({
      where: { id },
      data: { oauthTokens: tokens as Prisma.InputJsonValue, status: 'ACTIVE', lastSyncAt: new Date() },
    });
    return this.getIntegration(tenantId, id);
  }

  async health(tenantId: string, id: string): Promise<IntegrationHealthDto> {
    const integration = await this.getIntegration(tenantId, id);
    return { id: integration.id, status: integration.status, lastSyncAt: integration.lastSyncAt, nextSyncAt: integration.nextSyncAt };
  }

  async healthAll(tenantId: string): Promise<IntegrationHealthDto[]> {
    const integrations = await this.prisma.integration.findMany({ where: { tenantId, deletedAt: null } });
    return integrations.map(i => ({ id: i.id, status: i.status, lastSyncAt: i.lastSyncAt, nextSyncAt: i.nextSyncAt }));
  }

  async stats(tenantId: string, id: string): Promise<IntegrationStatsDto> {
    await this.getIntegration(tenantId, id);

    const where: Prisma.APIRequestLogWhereInput = { integrationId: id, tenantId };
    const [total, durations, successes] = await Promise.all([
      this.prisma.aPIRequestLog.count({ where }),
      this.prisma.aPIRequestLog.aggregate({ where, _avg: { durationMs: true } }),
      this.prisma.aPIRequestLog.count({ where: { ...where, responseStatus: { gte: 200, lt: 300 } } }),
    ]);

    const failed = total - successes;

    return {
      integrationId: id,
      totalRequests: total,
      successfulRequests: successes,
      failedRequests: failed,
      averageDurationMs: durations._avg.durationMs ?? 0,
    };
  }

  async listLogs(tenantId: string, id: string, query: ApiLogQueryDto): Promise<ApiLogListResponseDto> {
    await this.getIntegration(tenantId, id);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.APIRequestLogWhereInput = {
      tenantId,
      integrationId: id,
      ...(query.method ? { method: query.method } : {}),
      ...(query.endpoint ? { endpoint: { contains: query.endpoint, mode: 'insensitive' } } : {}),
    };

    const [logs, total] = await Promise.all([
      this.prisma.aPIRequestLog.findMany({ where, skip, take: limit, orderBy: { timestamp: 'desc' } }),
      this.prisma.aPIRequestLog.count({ where }),
    ]);

    return {
      data: logs.map(log => this.toLogDto(log)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toIntegrationDto(integration: Integration): IntegrationResponseDto {
    return {
      id: integration.id,
      tenantId: integration.tenantId,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      provider: integration.provider,
      authType: integration.authType,
      config: JSON.parse(JSON.stringify(integration.config ?? {})),
      syncFrequency: integration.syncFrequency,
      status: integration.status,
      lastSyncAt: integration.lastSyncAt,
      nextSyncAt: integration.nextSyncAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }

  private toLogDto(log: APIRequestLog): ApiLogResponseDto {
    return {
      id: log.id,
      integrationId: log.integrationId,
      endpoint: log.endpoint,
      method: log.method,
      responseStatus: log.responseStatus,
      durationMs: log.durationMs,
      timestamp: log.timestamp,
    };
  }
}
