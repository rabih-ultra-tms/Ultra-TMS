import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards';
import { TenantService } from './tenant.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * GET /api/v1/tenant
   * Get current tenant information
   */
  @Get()
  async getTenant(@CurrentTenant() tenantId: string) {
    return this.tenantService.getTenant(tenantId);
  }

  /**
   * PUT /api/v1/tenant
   * Update tenant information
   */
  @Put()
  async updateTenant(
    @CurrentTenant() tenantId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() data: any,
  ) {
    return this.tenantService.updateTenant(tenantId, data);
  }

  /**
   * GET /api/v1/tenant/settings
   * Get tenant settings
   */
  @Get('settings')
  async getSettings(@CurrentTenant() tenantId: string) {
    return this.tenantService.getSettings(tenantId);
  }

  /**
   * PUT /api/v1/tenant/settings
   * Update tenant settings
   */
  @Put('settings')
  async updateSettings(
    @CurrentTenant() tenantId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body('settings') settings: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body('features') features?: any,
  ) {
    return this.tenantService.updateSettings(tenantId, settings, features);
  }
}
