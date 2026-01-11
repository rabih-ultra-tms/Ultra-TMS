import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateTradingPartnerDto } from './dto/create-trading-partner.dto';
import { TradingPartnerQueryDto } from './dto/trading-partner-query.dto';
import { UpdateTradingPartnerDto } from './dto/update-trading-partner.dto';
import { TradingPartnersService } from './trading-partners.service';

@Controller('edi/trading-partners')
@UseGuards(JwtAuthGuard)
export class TradingPartnersController {
  constructor(private readonly service: TradingPartnersService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: TradingPartnerQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTradingPartnerDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTradingPartnerDto,
  ) {
    return this.service.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, user.id, id);
  }

  @Post(':id/test')
  testConnection(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.testConnection(tenantId, id);
  }

  @Patch(':id/status')
  toggle(@CurrentTenant() tenantId: string, @CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.toggleStatus(tenantId, user.id, id);
  }

  @Get(':id/activity')
  activity(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.activity(tenantId, id);
  }
}
