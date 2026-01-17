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
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, UpdateQuoteDto, QuickQuoteDto, CalculateRateDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Quotes')
@ApiBearerAuth('JWT-auth')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List quotes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'salesRepId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardResponse('Quotes list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'PRICING_ANALYST')
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
  @ApiOperation({ summary: 'Get quote by ID' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'PRICING_ANALYST')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.quotesService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create quote' })
  @ApiStandardResponse('Quote created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.delete(tenantId, id, userId);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert quote to order' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote converted to order')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async convertToOrder(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.convertToOrder(tenantId, id, userId);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote duplicated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async duplicate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.duplicate(tenantId, id, userId);
  }

  @Post(':id/new-version')
  @ApiOperation({ summary: 'Create new quote version' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote version created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async createNewVersion(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.createNewVersion(tenantId, id, userId);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote sent')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async send(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.send(tenantId, id, userId);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download quote PDF' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote PDF')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'PRICING_ANALYST')
  async generatePdf(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.quotesService.generatePdf(tenantId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=quote-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Post('quick')
  @ApiOperation({ summary: 'Create quick quote' })
  @ApiStandardResponse('Quick quote created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async quickQuote(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: QuickQuoteDto,
  ) {
    return this.quotesService.quickQuote(tenantId, userId, dto);
  }

  @Post('calculate-rate')
  @ApiOperation({ summary: 'Calculate rate' })
  @ApiStandardResponse('Rate calculated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'PRICING_ANALYST')
  async calculateRate(
    @CurrentTenant() tenantId: string,
    @Body() dto: CalculateRateDto,
  ) {
    return this.quotesService.calculateRate(tenantId, dto);
  }
}
