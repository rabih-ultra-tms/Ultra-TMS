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

@Controller('load-postings')
@UseGuards(JwtAuthGuard)
export class LoadPostingsController {
  constructor(private readonly loadPostingsService: LoadPostingsService) {}

  @Post()
  async create(@Request() req: any, @Body() createDto: CreateLoadPostingDto) {
    return this.loadPostingsService.create(req.user.tenantId, createDto, req.user.sub);
  }

  @Get()
  async findAll(@Request() req: any, @Query() searchDto: SearchLoadPostingDto) {
    return this.loadPostingsService.findAll(req.user.tenantId, searchDto);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadPostingDto) {
    return this.loadPostingsService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.remove(req.user.tenantId, id);
  }

  @Put(':id/expire')
  async expire(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.expire(req.user.tenantId, id);
  }

  @Put(':id/refresh')
  async refresh(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.refresh(req.user.tenantId, id);
  }

  @Post(':id/track-view')
  async trackView(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { carrierId: string; source?: string },
  ) {
    return this.loadPostingsService.trackView(req.user.tenantId, id, body.carrierId, body.source);
  }

  @Get(':id/metrics')
  async getMetrics(@Request() req: any, @Param('id') id: string) {
    return this.loadPostingsService.getMetrics(req.user.tenantId, id);
  }
}
