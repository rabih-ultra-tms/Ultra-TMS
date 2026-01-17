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
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoadPostingsService } from '../services';
import {
  CreateLoadPostingDto,
  UpdateLoadPostingDto,
  SearchLoadPostingDto,
  GeoSearchQueryDto,
  LaneSearchDto,
} from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('load-postings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class LoadPostingsController {
  constructor(private readonly loadPostingsService: LoadPostingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create load posting' })
  @ApiStandardResponse('Load posting created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async create(@Request() req: any, @Body() createDto: CreateLoadPostingDto) {
    return this.loadPostingsService.create(req.user.tenantId, createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List load postings' })
  @ApiStandardResponse('Load postings list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findAll(@Request() req: any, @Query() searchDto: SearchLoadPostingDto) {
    return this.loadPostingsService.findAll(req.user.tenantId, searchDto);
  }

  @Get('search/geo')
  @ApiOperation({ summary: 'Search load postings by geo radius' })
  @ApiStandardResponse('Load postings geo search results')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER', 'CARRIER')
  async searchByGeo(@Request() req: any, @Query() query: GeoSearchQueryDto) {
    return this.loadPostingsService.searchByGeo(req.user.tenantId, query);
  }

  @Get('search/lane')
  @ApiOperation({ summary: 'Search load postings by lane' })
  @ApiStandardResponse('Load postings lane search results')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER', 'CARRIER')
  async searchByLane(@Request() req: any, @Query() query: LaneSearchDto) {
    return this.loadPostingsService.searchByLane(req.user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get load posting by ID' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiStandardResponse('Load posting details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update load posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiStandardResponse('Load posting updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadPostingDto) {
    return this.loadPostingsService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete load posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiStandardResponse('Load posting deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.remove(req.user.tenantId, id);
  }

  @Put(':id/expire')
  @ApiOperation({ summary: 'Expire load posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiStandardResponse('Load posting expired')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async expire(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.expire(req.user.tenantId, id);
  }

  @Put(':id/refresh')
  @ApiOperation({ summary: 'Refresh load posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiStandardResponse('Load posting refreshed')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async refresh(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.refresh(req.user.tenantId, id);
  }

  @Post(':id/track-view')
  @ApiOperation({ summary: 'Track load posting view' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiStandardResponse('Load posting view tracked')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER', 'CARRIER')
  async trackView(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { carrierId: string; source?: string },
  ) {
    return this.loadPostingsService.trackView(req.user.tenantId, id, body.carrierId, body.source);
  }

  @Get(':id/metrics')
  @ApiOperation({ summary: 'Get load posting metrics' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiStandardResponse('Load posting metrics')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async getMetrics(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.getMetrics(req.user.tenantId, id);
  }
}
