import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { BulkPreferencesDto, SetPreferenceDto } from '../dto';
import { PreferencesService } from './preferences.service';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly service: PreferencesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.list(tenantId, userId);
  }

  @Put(':key')
  set(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('key') key: string,
    @Body() dto: SetPreferenceDto,
  ) {
    return this.service.set(tenantId, userId, { ...dto, key });
  }

  @Delete(':key')
  reset(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('key') key: string) {
    return this.service.reset(tenantId, userId, key);
  }

  @Post('bulk')
  bulk(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BulkPreferencesDto,
  ) {
    return this.service.bulk(tenantId, userId, dto);
  }
}
