import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { BulkUpdateConfigDto, SetTenantConfigDto } from '../dto';
import { TenantConfigService } from './tenant-config.service';

@Controller('config/tenant')
@UseGuards(JwtAuthGuard)
export class TenantConfigController {
  constructor(private readonly service: TenantConfigService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':key')
  get(@CurrentTenant() tenantId: string, @Param('key') key: string) {
    return this.service.get(tenantId, key);
  }

  @Put(':key')
  set(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('key') key: string,
    @Body() dto: SetTenantConfigDto,
  ) {
    return this.service.set(tenantId, userId, { ...dto, key });
  }

  @Delete(':key')
  reset(@CurrentTenant() tenantId: string, @Param('key') key: string) {
    return this.service.reset(tenantId, key);
  }

  @Post('bulk')
  bulk(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BulkUpdateConfigDto,
  ) {
    return this.service.bulk(tenantId, userId, dto);
  }
}
