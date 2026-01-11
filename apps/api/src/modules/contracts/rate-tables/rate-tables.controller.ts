import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RateTablesService } from './rate-tables.service';
import { CreateRateTableDto } from './dto/create-rate-table.dto';
import { UpdateRateTableDto } from './dto/update-rate-table.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser, CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class RateTablesController {
  constructor(private readonly service: RateTablesService) {}

  @Get('contracts/:contractId/rate-tables')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/rate-tables')
  create(@Param('contractId') contractId: string, @Body() dto: CreateRateTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('rate-tables/:id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put('rate-tables/:id')
  update(@Param('id') id: string, @Body() dto: UpdateRateTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete('rate-tables/:id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }

  @Post('rate-tables/:id/import')
  importCsv(@Param('id') id: string, @Body('rows') rows: any[], @CurrentUser() user: CurrentUserData) {
    return this.service.importCsv(id, user.tenantId, rows || []);
  }

  @Get('rate-tables/:id/export')
  exportCsv(@Param('id') id: string, @Query('format') format: string | undefined, @CurrentUser() user: CurrentUserData) {
    return this.service.exportCsv(id, user.tenantId, format);
  }
}
