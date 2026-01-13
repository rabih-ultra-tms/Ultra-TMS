import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AdminService } from './admin.service';
import { CreateSynonymDto, QueueQueryDto } from '../dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  health(): Promise<any> {
    return this.adminService.health();
  }

  @Get('indexes')
  listIndexes(@CurrentTenant() tenantId: string) {
    return this.adminService.listIndexes(tenantId);
  }

  @Post('indexes/:name/reindex')
  reindex(@CurrentTenant() tenantId: string, @Param('name') name: string) {
    return this.adminService.reindex(tenantId, name);
  }

  @Get('indexes/:name/status')
  indexStatus(@CurrentTenant() tenantId: string, @Param('name') name: string) {
    return this.adminService.indexStatus(tenantId, name);
  }

  @Post('indexes/:name/init')
  initIndex(@CurrentTenant() tenantId: string, @Param('name') name: string) {
    return this.adminService.ensureIndex(tenantId, name);
  }

  @Get('synonyms')
  listSynonyms(@CurrentTenant() tenantId: string) {
    return this.adminService.listSynonyms(tenantId);
  }

  @Post('synonyms')
  createSynonym(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSynonymDto,
  ) {
    return this.adminService.createSynonym(tenantId, userId, dto);
  }

  @Delete('synonyms/:id')
  deleteSynonym(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.adminService.deleteSynonym(tenantId, id);
  }

  @Get('analytics')
  analytics(@CurrentTenant() tenantId: string) {
    return this.adminService.analytics(tenantId);
  }

  @Get('queue')
  queue(
    @CurrentTenant() tenantId: string,
    @Query() query: QueueQueryDto,
  ) {
    return this.adminService.queueStatus(tenantId, query);
  }
}
