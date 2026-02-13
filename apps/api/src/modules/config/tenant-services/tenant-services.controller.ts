import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { UpdateTenantServiceDto } from '../dto';
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
}
