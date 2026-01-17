import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { BulkPreferencesDto, SetPreferenceDto } from '../dto';
import { PreferencesService } from './preferences.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class PreferencesController {
  constructor(private readonly service: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'List user preferences' })
  @ApiStandardResponse('User preferences list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.list(tenantId, userId);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Set user preference' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  @ApiStandardResponse('User preference updated')
  @ApiErrorResponses()
  set(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('key') key: string,
    @Body() dto: SetPreferenceDto,
  ) {
    return this.service.set(tenantId, userId, { ...dto, key });
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Reset user preference' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  @ApiStandardResponse('User preference reset')
  @ApiErrorResponses()
  reset(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('key') key: string) {
    return this.service.reset(tenantId, userId, key);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update user preferences' })
  @ApiStandardResponse('User preferences updated')
  @ApiErrorResponses()
  bulk(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BulkPreferencesDto,
  ) {
    return this.service.bulk(tenantId, userId, dto);
  }
}
