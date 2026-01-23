import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards';
import { TenantService } from './tenant.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * GET /api/v1/tenant
   * Get current tenant information
   */
  @Get()
  @ApiOperation({ summary: 'Get tenant' })
  @ApiStandardResponse('Tenant details')
  @ApiErrorResponses()
  async getTenant(@CurrentTenant() tenantId: string) {
    return this.tenantService.getTenant(tenantId);
  }

  /**
   * PUT /api/v1/tenant
   * Update tenant information
   */
  @Put()
  @ApiOperation({ summary: 'Update tenant' })
  @ApiStandardResponse('Tenant updated')
  @ApiErrorResponses()
  async updateTenant(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.tenantService.updateTenant(tenantId, userId, data);
  }

  /**
   * GET /api/v1/tenant/settings
   * Get tenant settings
   */
  @Get('settings')
  @ApiOperation({ summary: 'Get tenant settings' })
  @ApiStandardResponse('Tenant settings')
  @ApiErrorResponses()
  async getSettings(@CurrentTenant() tenantId: string) {
    return this.tenantService.getSettings(tenantId);
  }

  /**
   * PUT /api/v1/tenant/settings
   * Update tenant settings
   */
  @Put('settings')
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiStandardResponse('Tenant settings updated')
  @ApiErrorResponses()
  async updateSettings(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body('settings') settings: any,
    @Body('features') features?: any,
  ) {
    return this.tenantService.updateSettings(tenantId, userId, settings, features);
  }
}
