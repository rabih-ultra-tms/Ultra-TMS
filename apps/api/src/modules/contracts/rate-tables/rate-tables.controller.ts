import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RateTablesService } from './rate-tables.service';
import { CreateRateTableDto } from './dto/create-rate-table.dto';
import { UpdateRateTableDto } from './dto/update-rate-table.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Contract Rates')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
export class RateTablesController {
  constructor(private readonly service: RateTablesService) {}

  @Get('contracts/:contractId/rate-tables')
  @ApiOperation({ summary: 'List contract rate tables' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Rate tables list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/rate-tables')
  @ApiOperation({ summary: 'Create contract rate table' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Rate table created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER')
  create(@Param('contractId') contractId: string, @Body() dto: CreateRateTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('rate-tables/:id')
  @ApiOperation({ summary: 'Get rate table by ID' })
  @ApiParam({ name: 'id', description: 'Rate table ID' })
  @ApiStandardResponse('Rate table details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(id, user.tenantId);
  }

  @Put('rate-tables/:id')
  @ApiOperation({ summary: 'Update rate table' })
  @ApiParam({ name: 'id', description: 'Rate table ID' })
  @ApiStandardResponse('Rate table updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateRateTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Delete('rate-tables/:id')
  @ApiOperation({ summary: 'Delete rate table' })
  @ApiParam({ name: 'id', description: 'Rate table ID' })
  @ApiStandardResponse('Rate table deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(id, user.tenantId);
  }

  @Post('rate-tables/:id/import')
  @ApiOperation({ summary: 'Import rate table rows' })
  @ApiParam({ name: 'id', description: 'Rate table ID' })
  @ApiStandardResponse('Rate table rows imported')
  @ApiErrorResponses()
  @Roles('ADMIN')
  importCsv(@Param('id') id: string, @Body('rows') rows: any[], @CurrentUser() user: CurrentUserData) {
    return this.service.importCsv(id, user.tenantId, rows || []);
  }

  @Get('rate-tables/:id/export')
  @ApiOperation({ summary: 'Export rate table' })
  @ApiParam({ name: 'id', description: 'Rate table ID' })
  @ApiQuery({ name: 'format', required: false, description: 'Export format (csv or xlsx)' })
  @ApiStandardResponse('Rate table export')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  exportCsv(@Param('id') id: string, @Query('format') format: string | undefined, @CurrentUser() user: CurrentUserData) {
    return this.service.exportCsv(id, user.tenantId, format);
  }
}
