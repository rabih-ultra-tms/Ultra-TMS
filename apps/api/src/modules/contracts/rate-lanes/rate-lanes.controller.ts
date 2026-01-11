import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RateLanesService } from './rate-lanes.service';
import { CreateRateLaneDto } from './dto/create-rate-lane.dto';
import { UpdateRateLaneDto } from './dto/update-rate-lane.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser, CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller('rate-tables/:rateTableId/lanes')
@UseGuards(JwtAuthGuard)
export class RateLanesController {
  constructor(private readonly service: RateLanesService) {}

  @Get()
  list(@Param('rateTableId') rateTableId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, rateTableId);
  }

  @Post()
  create(@Param('rateTableId') rateTableId: string, @Body() dto: CreateRateLaneDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, rateTableId, user.userId, dto);
  }

  @Get(':id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRateLaneDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }
}
