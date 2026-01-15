import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SlasService } from './slas.service';
import { CreateSlaDto } from './dto/create-sla.dto';
import { UpdateSlaDto } from './dto/update-sla.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { Roles } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Contracts')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class SlasController {
  constructor(private readonly service: SlasService) {}

  @Get('contracts/:contractId/slas')
  @ApiOperation({ summary: 'List contract SLAs' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Contract SLAs list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/slas')
  @ApiOperation({ summary: 'Create contract SLA' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Contract SLA created')
  @ApiErrorResponses()
  create(@Param('contractId') contractId: string, @Body() dto: CreateSlaDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('slas/:id')
  @ApiOperation({ summary: 'Get SLA by ID' })
  @ApiParam({ name: 'id', description: 'SLA ID' })
  @ApiStandardResponse('SLA details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put('slas/:id')
  @ApiOperation({ summary: 'Update SLA' })
  @ApiParam({ name: 'id', description: 'SLA ID' })
  @ApiStandardResponse('SLA updated')
  @ApiErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateSlaDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete('slas/:id')
  @ApiOperation({ summary: 'Delete SLA' })
  @ApiParam({ name: 'id', description: 'SLA ID' })
  @ApiStandardResponse('SLA deleted')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }

  @Get('slas/:id/performance')
  @ApiOperation({ summary: 'Get SLA performance' })
  @ApiParam({ name: 'id', description: 'SLA ID' })
  @ApiQuery({ name: 'actual', required: false, description: 'Actual value override' })
  @ApiStandardResponse('SLA performance')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  performance(@Param('id') id: string, @Query('actual') actual: string | undefined, @CurrentUser() user: CurrentUserData) {
    const actualValue = actual !== undefined ? Number(actual) : undefined;
    return this.service.performance(id, user.tenantId, actualValue);
  }
}
