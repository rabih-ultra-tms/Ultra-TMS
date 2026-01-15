import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { IntegrationsService } from './integrations.service';
import {
  ApiLogQueryDto,
  CreateIntegrationDto,
  IntegrationQueryDto,
  ProviderQueryDto,
  ToggleStatusDto,
  UpdateIntegrationDto,
  UpdateIntegrationCredentialsDto,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Audit } from '../audit/decorators/audit.decorator';
import { AuditAction, AuditActionCategory, AuditSeverity } from '@prisma/client';

@Controller('integration-hub/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationProvidersController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listProviders(
    @CurrentTenant() tenantId: string,
    @Query() query: ProviderQueryDto,
  ) {
    return this.integrationsService.listProviders(tenantId, query);
  }

  @Get('categories')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listCategories(@CurrentTenant() tenantId: string) {
    return this.integrationsService.listProviderCategories(tenantId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getProvider(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.getProvider(tenantId, id);
  }
}

@Controller('integration-hub/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async listIntegrations(
    @CurrentTenant() tenantId: string,
    @Query() query: IntegrationQueryDto,
  ) {
    return this.integrationsService.listIntegrations(tenantId, query);
  }

  @Get('health')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async healthAll(@CurrentTenant() tenantId: string) {
    return this.integrationsService.healthAll(tenantId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Audit({
    action: AuditAction.READ,
    category: AuditActionCategory.DATA,
    severity: AuditSeverity.WARNING,
    entityType: 'INTEGRATION',
    entityIdParam: 'id',
    sensitiveFields: ['credentials'],
    description: 'Viewed integration details',
  })
  async getIntegration(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.getIntegration(tenantId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  async createIntegration(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.createIntegration(tenantId, userId, dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  async updateIntegration(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.updateIntegration(tenantId, id, userId, dto);
  }

  @Put(':id/credentials')
  @Roles('SUPER_ADMIN')
  @Audit({
    action: AuditAction.UPDATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.CRITICAL,
    entityType: 'INTEGRATION_CREDENTIALS',
    entityIdParam: 'id',
    sensitiveFields: ['apiKey', 'apiSecret', 'oauthTokens'],
    description: 'Updated integration credentials',
  })
  async updateCredentials(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateIntegrationCredentialsDto,
  ) {
    await this.integrationsService.updateCredentials(tenantId, id, userId, dto);
    return { success: true };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async deleteIntegration(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.integrationsService.deleteIntegration(tenantId, id);
    return { success: true };
  }

  @Post(':id/test')
  @Roles('SUPER_ADMIN')
  async testConnection(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.testConnection(tenantId, id);
  }

  @Post(':id/status')
  @Roles('SUPER_ADMIN')
  async toggleStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ToggleStatusDto,
  ) {
    return this.integrationsService.toggleStatus(tenantId, id, dto);
  }

  @Post(':id/oauth/authorize')
  @Roles('SUPER_ADMIN')
  async oauthAuthorize(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.oauthAuthorize(tenantId, id);
  }

  @Post(':id/oauth/callback')
  @Roles('SUPER_ADMIN')
  async oauthCallback(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() tokens: Record<string, unknown>,
  ) {
    return this.integrationsService.oauthCallback(tenantId, id, tokens);
  }

  @Get(':id/health')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async health(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.health(tenantId, id);
  }

  @Get(':id/stats')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async stats(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.stats(tenantId, id);
  }

  @Get(':id/logs')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listLogs(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.integrationsService.listLogs(tenantId, id, query);
  }
}
