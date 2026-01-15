import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { VolumeCommitmentsService } from './volume-commitments.service';
import { CreateVolumeCommitmentDto } from './dto/create-volume-commitment.dto';
import { UpdateVolumeCommitmentDto } from './dto/update-volume-commitment.dto';
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
export class VolumeCommitmentsController {
  constructor(private readonly service: VolumeCommitmentsService) {}

  @Get('contracts/:contractId/volume-commitments')
  @ApiOperation({ summary: 'List volume commitments' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Volume commitments list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/volume-commitments')
  @ApiOperation({ summary: 'Create volume commitment' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Volume commitment created')
  @ApiErrorResponses()
  create(@Param('contractId') contractId: string, @Body() dto: CreateVolumeCommitmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('volume-commitments/:id')
  @ApiOperation({ summary: 'Get volume commitment by ID' })
  @ApiParam({ name: 'id', description: 'Volume commitment ID' })
  @ApiStandardResponse('Volume commitment details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put('volume-commitments/:id')
  @ApiOperation({ summary: 'Update volume commitment' })
  @ApiParam({ name: 'id', description: 'Volume commitment ID' })
  @ApiStandardResponse('Volume commitment updated')
  @ApiErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateVolumeCommitmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete('volume-commitments/:id')
  @ApiOperation({ summary: 'Delete volume commitment' })
  @ApiParam({ name: 'id', description: 'Volume commitment ID' })
  @ApiStandardResponse('Volume commitment deleted')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }

  @Get('volume-commitments/:id/performance')
  @ApiOperation({ summary: 'Get volume commitment performance' })
  @ApiParam({ name: 'id', description: 'Volume commitment ID' })
  @ApiStandardResponse('Volume commitment performance')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  performance(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.performance(id, user.tenantId);
  }
}
