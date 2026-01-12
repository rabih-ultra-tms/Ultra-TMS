import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateProviderConfigDto } from './dto/create-provider-config.dto';
import { UpdateProviderConfigDto } from './dto/update-provider-config.dto';
import { ProvidersService } from './providers.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  @Get('api/v1/rates/providers')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post('api/v1/rates/providers')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProviderConfigDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch('api/v1/rates/providers/:id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateProviderConfigDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Post('api/v1/rates/providers/:id/test')
  test(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.test(tenantId, id);
  }
}
