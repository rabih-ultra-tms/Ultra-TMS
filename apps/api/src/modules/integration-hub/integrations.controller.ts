import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('integration-hub/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Integration Hub')
@ApiBearerAuth('JWT-auth')
export class IntegrationProvidersController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'List integration providers' })
  @ApiStandardResponse('Integration providers list')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listProviders(
    @CurrentTenant() tenantId: string,
    @Query() query: ProviderQueryDto,
  ) {
    return this.integrationsService.listProviders(tenantId, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List provider categories' })
  @ApiStandardResponse('Provider categories list')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listCategories(@CurrentTenant() tenantId: string) {
    return this.integrationsService.listProviderCategories(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiStandardResponse('Provider details')
  @ApiErrorResponses()
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
@ApiTags('Integration Hub')
@ApiBearerAuth('JWT-auth')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'List integrations' })
  @ApiStandardResponse('Integrations list')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async listIntegrations(
    @CurrentTenant() tenantId: string,
    @Query() query: IntegrationQueryDto,
  ) {
    return this.integrationsService.listIntegrations(tenantId, query);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check integrations health' })
  @ApiStandardResponse('Integrations health')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async healthAll(@CurrentTenant() tenantId: string) {
    return this.integrationsService.healthAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration details')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Create integration' })
  @ApiStandardResponse('Integration created')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN')
  async createIntegration(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.createIntegration(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Update integration credentials' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration credentials updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Delete integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration deleted')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN')
  async deleteIntegration(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.integrationsService.deleteIntegration(tenantId, id);
    return { success: true };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration connection tested')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN')
  async testConnection(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.testConnection(tenantId, id);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Toggle integration status' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration status updated')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN')
  async toggleStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ToggleStatusDto,
  ) {
    return this.integrationsService.toggleStatus(tenantId, id, dto);
  }

  @Post(':id/oauth/authorize')
  @ApiOperation({ summary: 'Start OAuth authorization' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('OAuth authorization started')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN')
  async oauthAuthorize(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.oauthAuthorize(tenantId, id);
  }

  @Post(':id/oauth/callback')
  @ApiOperation({ summary: 'Handle OAuth callback' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('OAuth callback processed')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN')
  async oauthCallback(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() tokens: Record<string, unknown>,
  ) {
    return this.integrationsService.oauthCallback(tenantId, id, tokens);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get integration health' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration health')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async health(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.health(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get integration stats' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration stats')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async stats(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.stats(tenantId, id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'List integration logs' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiStandardResponse('Integration logs list')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listLogs(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.integrationsService.listLogs(tenantId, id, query);
  }
}
