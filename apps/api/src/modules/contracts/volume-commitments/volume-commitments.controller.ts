import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { VolumeCommitmentsService } from './volume-commitments.service';
import { CreateVolumeCommitmentDto } from './dto/create-volume-commitment.dto';
import { UpdateVolumeCommitmentDto } from './dto/update-volume-commitment.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class VolumeCommitmentsController {
  constructor(private readonly service: VolumeCommitmentsService) {}

  @Get('contracts/:contractId/volume-commitments')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/volume-commitments')
  create(@Param('contractId') contractId: string, @Body() dto: CreateVolumeCommitmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('volume-commitments/:id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put('volume-commitments/:id')
  update(@Param('id') id: string, @Body() dto: UpdateVolumeCommitmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete('volume-commitments/:id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }

  @Get('volume-commitments/:id/performance')
  performance(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.performance(id, user.tenantId);
  }
}
