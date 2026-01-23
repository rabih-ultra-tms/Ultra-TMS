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
@Roles('USER', 'MANAGER', 'ADMIN')
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  @Get('rates/providers')
  @ApiOperation({ summary: 'List rate data providers' })
  @ApiStandardResponse('Provider list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post('rates/providers')
  @ApiOperation({ summary: 'Create rate data provider' })
  @ApiStandardResponse('Provider created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProviderConfigDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch('rates/providers/:id')
  @ApiOperation({ summary: 'Update rate data provider' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiStandardResponse('Provider updated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateProviderConfigDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Post('rates/providers/:id/test')
  @ApiOperation({ summary: 'Test provider connection' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiStandardResponse('Provider connection tested')
  @ApiErrorResponses()
  @Roles('ADMIN')
  test(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.test(tenantId, id);
  }
}
