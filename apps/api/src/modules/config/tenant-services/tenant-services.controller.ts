import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { UpdateTenantServiceDto, UpdateTenantServiceForTenantDto } from '../dto';
import { TenantServicesService } from './tenant-services.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('tenant-services')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class TenantServicesController {
  constructor(private readonly service: TenantServicesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all tenant services with enabled status' })
  @ApiStandardResponse('Tenant services list')
  @ApiErrorResponses()
  async list(@CurrentTenant() tenantId: string) {
    const data = await this.service.list(tenantId);
    return { data };
  }

  @Get('tenants')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List tenant services grouped by tenant' })
  @ApiStandardResponse('Tenant services grouped by tenant')
  @ApiErrorResponses()
  async listAll() {
    const data = await this.service.listAllTenants();
    return { data };
  }

  @Get('enabled')
  @ApiOperation({ summary: 'Get enabled service keys for the current tenant' })
  @ApiStandardResponse('Enabled service keys')
  @ApiErrorResponses()
  async getEnabled(@CurrentTenant() tenantId: string) {
    const data = await this.service.getEnabled(tenantId);
    return { data };
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a tenant service enabled status' })
  @ApiStandardResponse('Tenant service updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTenantServiceDto,
  ) {
    const data = await this.service.update(tenantId, userId, dto);
    return { data };
  }

  @Put('tenants')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a tenant service for a specific tenant' })
  @ApiStandardResponse('Tenant service updated for tenant')
  @ApiErrorResponses()
  async updateForTenant(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTenantServiceForTenantDto,
  ) {
    const data = await this.service.updateForTenant(userId, dto);
    return { data };
  }
}
