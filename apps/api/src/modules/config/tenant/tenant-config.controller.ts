import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { BulkUpdateConfigDto, SetTenantConfigDto } from '../dto';
import { TenantConfigService } from './tenant-config.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('config/tenant')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class TenantConfigController {
  constructor(private readonly service: TenantConfigService) {}

  @Get()
  @ApiOperation({ summary: 'List tenant configuration' })
  @ApiStandardResponse('Tenant configuration list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get tenant config value' })
  @ApiParam({ name: 'key', description: 'Config key' })
  @ApiStandardResponse('Tenant config value')
  @ApiErrorResponses()
  get(@CurrentTenant() tenantId: string, @Param('key') key: string) {
    return this.service.get(tenantId, key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Set tenant config value' })
  @ApiParam({ name: 'key', description: 'Config key' })
  @ApiStandardResponse('Tenant config updated')
  @ApiErrorResponses()
  set(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('key') key: string,
    @Body() dto: SetTenantConfigDto,
  ) {
    return this.service.set(tenantId, userId, { ...dto, key });
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Reset tenant config value' })
  @ApiParam({ name: 'key', description: 'Config key' })
  @ApiStandardResponse('Tenant config reset')
  @ApiErrorResponses()
  reset(@CurrentTenant() tenantId: string, @Param('key') key: string) {
    return this.service.reset(tenantId, key);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update tenant config' })
  @ApiStandardResponse('Tenant config updated')
  @ApiErrorResponses()
  bulk(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BulkUpdateConfigDto,
  ) {
    return this.service.bulk(tenantId, userId, dto);
  }
}
