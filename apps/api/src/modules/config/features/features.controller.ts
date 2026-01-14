import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateFeatureFlagDto, SetFeatureFlagOverrideDto, UpdateFeatureFlagDto } from '../dto';
import { FeaturesService } from './features.service';

@Controller('features')
@UseGuards(JwtAuthGuard)
export class FeaturesController {
  constructor(private readonly service: FeaturesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':code')
  get(@Param('code') code: string) {
    return this.service.get(code);
  }

  @Post()
  create(@Body() dto: CreateFeatureFlagDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Put(':code')
  update(@Param('code') code: string, @Body() dto: UpdateFeatureFlagDto, @CurrentUser('id') userId: string) {
    return this.service.update(code, dto, userId);
  }

  @Get(':code/enabled')
  isEnabled(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.checkEnabled(code, tenantId, userId);
  }

  @Put(':code/override')
  setOverride(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: SetFeatureFlagOverrideDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.setOverride(code, tenantId, dto, userId);
  }

  @Delete(':code/override')
  removeOverride(@Param('code') code: string, @CurrentTenant() tenantId: string) {
    return this.service.removeOverride(code, tenantId);
  }
}
