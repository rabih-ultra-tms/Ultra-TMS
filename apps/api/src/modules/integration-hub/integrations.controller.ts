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
} from './dto';

@Controller('integration-hub/providers')
@UseGuards(JwtAuthGuard)
export class IntegrationProvidersController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async listProviders(
    @CurrentTenant() tenantId: string,
    @Query() query: ProviderQueryDto,
  ) {
    return this.integrationsService.listProviders(tenantId, query);
  }

  @Get('categories')
  async listCategories(@CurrentTenant() tenantId: string) {
    return this.integrationsService.listProviderCategories(tenantId);
  }

  @Get(':id')
  async getProvider(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.getProvider(tenantId, id);
  }
}

@Controller('integration-hub/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async listIntegrations(
    @CurrentTenant() tenantId: string,
    @Query() query: IntegrationQueryDto,
  ) {
    return this.integrationsService.listIntegrations(tenantId, query);
  }

  @Get('health')
  async healthAll(@CurrentTenant() tenantId: string) {
    return this.integrationsService.healthAll(tenantId);
  }

  @Get(':id')
  async getIntegration(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.getIntegration(tenantId, id);
  }

  @Post()
  async createIntegration(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.createIntegration(tenantId, userId, dto);
  }

  @Put(':id')
  async updateIntegration(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.updateIntegration(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async deleteIntegration(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.integrationsService.deleteIntegration(tenantId, id);
    return { success: true };
  }

  @Post(':id/test')
  async testConnection(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.testConnection(tenantId, id);
  }

  @Post(':id/status')
  async toggleStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ToggleStatusDto,
  ) {
    return this.integrationsService.toggleStatus(tenantId, id, dto);
  }

  @Post(':id/oauth/authorize')
  async oauthAuthorize(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.oauthAuthorize(tenantId, id);
  }

  @Post(':id/oauth/callback')
  async oauthCallback(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() tokens: Record<string, unknown>,
  ) {
    return this.integrationsService.oauthCallback(tenantId, id, tokens);
  }

  @Get(':id/health')
  async health(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.health(tenantId, id);
  }

  @Get(':id/stats')
  async stats(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.stats(tenantId, id);
  }

  @Get(':id/logs')
  async listLogs(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.integrationsService.listLogs(tenantId, id, query);
  }
}
