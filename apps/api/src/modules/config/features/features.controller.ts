import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateFeatureFlagDto, SetFeatureFlagOverrideDto, UpdateFeatureFlagDto } from '../dto';
import { FeaturesService } from './features.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('features')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class FeaturesController {
  constructor(private readonly service: FeaturesService) {}

  @Get()
  @ApiOperation({ summary: 'List feature flags' })
  @ApiStandardResponse('Feature flags list')
  @ApiErrorResponses()
  list() {
    return this.service.list();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get feature flag by code' })
  @ApiParam({ name: 'code', description: 'Feature flag code' })
  @ApiStandardResponse('Feature flag details')
  @ApiErrorResponses()
  get(@Param('code') code: string) {
    return this.service.get(code);
  }

  @Post()
  @ApiOperation({ summary: 'Create feature flag' })
  @ApiStandardResponse('Feature flag created')
  @ApiErrorResponses()
  create(@Body() dto: CreateFeatureFlagDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Put(':code')
  @ApiOperation({ summary: 'Update feature flag' })
  @ApiParam({ name: 'code', description: 'Feature flag code' })
  @ApiStandardResponse('Feature flag updated')
  @ApiErrorResponses()
  update(@Param('code') code: string, @Body() dto: UpdateFeatureFlagDto, @CurrentUser('id') userId: string) {
    return this.service.update(code, dto, userId);
  }

  @Get(':code/enabled')
  @ApiOperation({ summary: 'Check feature flag enabled' })
  @ApiParam({ name: 'code', description: 'Feature flag code' })
  @ApiStandardResponse('Feature flag enabled status')
  @ApiErrorResponses()
  isEnabled(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.checkEnabled(code, tenantId, userId);
  }

  @Put(':code/override')
  @ApiOperation({ summary: 'Set feature flag override' })
  @ApiParam({ name: 'code', description: 'Feature flag code' })
  @ApiStandardResponse('Feature flag override set')
  @ApiErrorResponses()
  setOverride(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: SetFeatureFlagOverrideDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.setOverride(code, tenantId, dto, userId);
  }

  @Delete(':code/override')
  @ApiOperation({ summary: 'Remove feature flag override' })
  @ApiParam({ name: 'code', description: 'Feature flag code' })
  @ApiStandardResponse('Feature flag override removed')
  @ApiErrorResponses()
  removeOverride(@Param('code') code: string, @CurrentTenant() tenantId: string) {
    return this.service.removeOverride(code, tenantId);
  }
}
