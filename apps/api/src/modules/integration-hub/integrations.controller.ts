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
import { IntegrationsService } from './integrations.service';
import {
  IntegrationQueryDto,
  CreateIntegrationDto,
  UpdateIntegrationDto,
} from './dto';

@Controller('integration-hub/providers')
@UseGuards(JwtAuthGuard)
export class IntegrationProvidersController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async findAllProviders(@Query('category') category?: string) {
    return this.integrationsService.findAllProviders(category);
  }

  @Get(':code')
  async findProviderByCode(@Param('code') code: string) {
    return this.integrationsService.findProviderByCode(code);
  }
}

@Controller('integration-hub/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: IntegrationQueryDto,
  ) {
    return this.integrationsService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.integrationsService.delete(tenantId, id);
    return { success: true };
  }

  @Post(':id/test')
  async testConnection(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.testConnection(tenantId, id);
  }

  @Post(':id/enable')
  async enable(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.enable(tenantId, id);
  }

  @Post(':id/disable')
  async disable(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.disable(tenantId, id);
  }

  @Post(':id/refresh-oauth')
  async refreshOAuth(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.refreshOAuth(tenantId, id);
  }

  @Get(':id/health')
  async getHealth(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.getHealth(tenantId, id);
  }

  @Get(':id/stats')
  async getStats(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.getStats(tenantId, id);
  }
}
