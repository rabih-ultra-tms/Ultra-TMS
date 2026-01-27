import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { LoadPlannerQuotesService } from './load-planner-quotes.service';
import {
  CreateLoadPlannerQuoteDto,
  UpdateLoadPlannerQuoteDto,
  UpdateQuoteStatusDto,
  ListLoadPlannerQuotesDto,
} from './dto';

@Controller('operations/load-planner-quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Operations - Load Planner Quotes')
@ApiBearerAuth('JWT-auth')
export class LoadPlannerQuotesController {
  constructor(
    private readonly loadPlannerQuotesService: LoadPlannerQuotesService
  ) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  @ApiOperation({ summary: 'Create a new load planner quote' })
  @ApiResponse({
    status: 201,
    description: 'Quote created successfully',
  })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateLoadPlannerQuoteDto
  ) {
    return this.loadPlannerQuotesService.create(tenantId, dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  @ApiOperation({ summary: 'List load planner quotes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'pickupState', required: false, type: String })
  @ApiQuery({ name: 'dropoffState', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Quotes retrieved successfully',
  })
  async list(
    @CurrentTenant() tenantId: string,
    @Query() query: ListLoadPlannerQuotesDto
  ) {
    return this.loadPlannerQuotesService.list(tenantId, query);
  }

  @Get('stats')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  @ApiOperation({ summary: 'Get quote statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@CurrentTenant() tenantId: string) {
    return this.loadPlannerQuotesService.getStats(tenantId);
  }

  @Get('public/:publicToken')
  @ApiOperation({ summary: 'Get quote by public token (no auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Quote retrieved successfully',
  })
  async getPublic(@Param('publicToken') publicToken: string) {
    return this.loadPlannerQuotesService.getByPublicToken(publicToken);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  @ApiOperation({ summary: 'Get a quote by ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote retrieved successfully',
  })
  async getById(
    @CurrentTenant() tenantId: string,
    @Param('id') quoteId: string
  ) {
    return this.loadPlannerQuotesService.getById(tenantId, quoteId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Update a quote' })
  @ApiResponse({
    status: 200,
    description: 'Quote updated successfully',
  })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') quoteId: string,
    @Body() dto: UpdateLoadPlannerQuoteDto
  ) {
    return this.loadPlannerQuotesService.update(tenantId, quoteId, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Update quote status' })
  @ApiResponse({
    status: 200,
    description: 'Quote status updated successfully',
  })
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') quoteId: string,
    @Body() dto: UpdateQuoteStatusDto
  ) {
    return this.loadPlannerQuotesService.updateStatus(
      tenantId,
      quoteId,
      dto
    );
  }

  @Post(':id/duplicate')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Duplicate a quote' })
  @ApiResponse({
    status: 201,
    description: 'Quote duplicated successfully',
  })
  async duplicate(
    @CurrentTenant() tenantId: string,
    @Param('id') quoteId: string
  ) {
    return this.loadPlannerQuotesService.duplicate(tenantId, quoteId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a quote (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Quote deleted successfully',
  })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') quoteId: string
  ) {
    return this.loadPlannerQuotesService.delete(tenantId, quoteId);
  }
}
