import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { CreateProviderConfigDto } from './dto/create-provider-config.dto';
import { UpdateProviderConfigDto } from './dto/update-provider-config.dto';
import { ProvidersService } from './providers.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Market Rates')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  @Get('api/v1/rates/providers')
  @ApiOperation({ summary: 'List rate data providers' })
  @ApiStandardResponse('Provider list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post('api/v1/rates/providers')
  @ApiOperation({ summary: 'Create rate data provider' })
  @ApiStandardResponse('Provider created')
  @ApiErrorResponses()
  @Roles('admin')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProviderConfigDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch('api/v1/rates/providers/:id')
  @ApiOperation({ summary: 'Update rate data provider' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiStandardResponse('Provider updated')
  @ApiErrorResponses()
  @Roles('admin')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateProviderConfigDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Post('api/v1/rates/providers/:id/test')
  @ApiOperation({ summary: 'Test provider connection' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiStandardResponse('Provider connection tested')
  @ApiErrorResponses()
  @Roles('admin')
  test(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.test(tenantId, id);
  }
}
