import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Query } from '@nestjs/common';
import { SlasService } from './slas.service';
import { CreateSlaDto } from './dto/create-sla.dto';
import { UpdateSlaDto } from './dto/update-sla.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class SlasController {
  constructor(private readonly service: SlasService) {}

  @Get('contracts/:contractId/slas')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/slas')
  create(@Param('contractId') contractId: string, @Body() dto: CreateSlaDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('slas/:id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put('slas/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSlaDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete('slas/:id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }

  @Get('slas/:id/performance')
  performance(@Param('id') id: string, @Query('actual') actual: string | undefined, @CurrentUser() user: CurrentUserData) {
    const actualValue = actual !== undefined ? Number(actual) : undefined;
    return this.service.performance(id, user.tenantId, actualValue);
  }
}
