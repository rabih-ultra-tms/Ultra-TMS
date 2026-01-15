import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RateLanesService } from './rate-lanes.service';
import { CreateRateLaneDto } from './dto/create-rate-lane.dto';
import { UpdateRateLaneDto } from './dto/update-rate-lane.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { Roles } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('rate-tables/:rateTableId/lanes')
@UseGuards(JwtAuthGuard)
@ApiTags('Contract Rates')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class RateLanesController {
  constructor(private readonly service: RateLanesService) {}

  @Get()
  @ApiOperation({ summary: 'List rate lanes' })
  @ApiParam({ name: 'rateTableId', description: 'Rate table ID' })
  @ApiStandardResponse('Rate lanes list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@Param('rateTableId') rateTableId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, rateTableId);
  }

  @Post()
  @ApiOperation({ summary: 'Create rate lane' })
  @ApiParam({ name: 'rateTableId', description: 'Rate table ID' })
  @ApiStandardResponse('Rate lane created')
  @ApiErrorResponses()
  create(@Param('rateTableId') rateTableId: string, @Body() dto: CreateRateLaneDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, rateTableId, user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rate lane by ID' })
  @ApiParam({ name: 'id', description: 'Rate lane ID' })
  @ApiStandardResponse('Rate lane details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update rate lane' })
  @ApiParam({ name: 'id', description: 'Rate lane ID' })
  @ApiStandardResponse('Rate lane updated')
  @ApiErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateRateLaneDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete rate lane' })
  @ApiParam({ name: 'id', description: 'Rate lane ID' })
  @ApiStandardResponse('Rate lane deleted')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }
}
