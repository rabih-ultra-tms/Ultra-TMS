import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { LoadHistoryService } from './load-history.service';
import {
  CreateLoadHistoryDto,
  UpdateLoadHistoryDto,
  ListLoadHistoryDto,
} from './dto';

@ApiTags('Operations - Load History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('operations/load-history')
export class LoadHistoryController {
  constructor(private loadHistoryService: LoadHistoryService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Create load history entry' })
  @ApiResponse({ status: 201, description: 'Load history created successfully' })
  async createLoad(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateLoadHistoryDto
  ) {
    return this.loadHistoryService.create(tenantId, dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'List load history entries' })
  @ApiResponse({ status: 200, description: 'Load history list retrieved' })
  async listLoads(
    @CurrentTenant() tenantId: string,
    @Query() dto: ListLoadHistoryDto
  ) {
    return this.loadHistoryService.list(tenantId, dto);
  }

  @Get('stats')
  @Roles('ADMIN', 'MANAGER', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get load history statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats(@CurrentTenant() tenantId: string) {
    return this.loadHistoryService.getStats(tenantId);
  }

  @Get('lane-stats/:originState/:destinationState')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get statistics for specific lane' })
  @ApiResponse({ status: 200, description: 'Lane statistics retrieved' })
  async getLaneStats(
    @CurrentTenant() tenantId: string,
    @Param('originState') originState: string,
    @Param('destinationState') destinationState: string
  ) {
    return this.loadHistoryService.getLaneStats(tenantId, originState, destinationState);
  }

  @Get('carrier/:carrierId')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get loads by carrier' })
  @ApiResponse({ status: 200, description: 'Carrier loads retrieved' })
  async getCarrierLoads(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.loadHistoryService.getByCarrier(tenantId, carrierId);
  }

  @Get('similar')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get similar loads based on lane and dimensions' })
  @ApiResponse({ status: 200, description: 'Similar loads retrieved' })
  async getSimilarLoads(
    @CurrentTenant() tenantId: string,
    @Query('originState') originState: string,
    @Query('destinationState') destinationState: string,
    @Query('weightLbs') weightLbs: number,
    @Query('lengthIn') lengthIn: number,
    @Query('widthIn') widthIn: number,
    @Query('heightIn') heightIn: number,
    @Query('tolerance') tolerance: number = 0.2
  ) {
    return this.loadHistoryService.getSimilarLoads(
      tenantId,
      originState,
      destinationState,
      weightLbs,
      lengthIn,
      widthIn,
      heightIn,
      tolerance
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get load history by ID' })
  @ApiResponse({ status: 200, description: 'Load history retrieved' })
  async getLoad(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string
  ) {
    return this.loadHistoryService.getById(tenantId, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Update load history entry' })
  @ApiResponse({ status: 200, description: 'Load history updated' })
  async updateLoad(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLoadHistoryDto
  ) {
    return this.loadHistoryService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete load history entry' })
  @ApiResponse({ status: 204, description: 'Load history deleted' })
  async deleteLoad(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string
  ) {
    return this.loadHistoryService.delete(tenantId, id);
  }
}
