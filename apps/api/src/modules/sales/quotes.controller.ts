import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('salesRepId') salesRepId?: string,
    @Query('search') search?: string,
  ) {
    return this.quotesService.findAll(tenantId, { page, limit, status, companyId, salesRepId, search });
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.quotesService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.delete(tenantId, id, userId);
  }

  @Post(':id/convert')
  async convertToOrder(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.convertToOrder(tenantId, id, userId);
  }
}
