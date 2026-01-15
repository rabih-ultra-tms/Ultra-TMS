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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoadPostingsService } from '../services';
import { CreateLoadPostingDto, UpdateLoadPostingDto, SearchLoadPostingDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('load-postings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoadPostingsController {
  constructor(private readonly loadPostingsService: LoadPostingsService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async create(@Request() req: any, @Body() createDto: CreateLoadPostingDto) {
    return this.loadPostingsService.create(req.user.tenantId, createDto, req.user.sub);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findAll(@Request() req: any, @Query() searchDto: SearchLoadPostingDto) {
    return this.loadPostingsService.findAll(req.user.tenantId, searchDto);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadPostingDto) {
    return this.loadPostingsService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.remove(req.user.tenantId, id);
  }

  @Put(':id/expire')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async expire(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.expire(req.user.tenantId, id);
  }

  @Put(':id/refresh')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async refresh(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.refresh(req.user.tenantId, id);
  }

  @Post(':id/track-view')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER', 'CARRIER')
  async trackView(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { carrierId: string; source?: string },
  ) {
    return this.loadPostingsService.trackView(req.user.tenantId, id, body.carrierId, body.source);
  }

  @Get(':id/metrics')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async getMetrics(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.getMetrics(req.user.tenantId, id);
  }
}
