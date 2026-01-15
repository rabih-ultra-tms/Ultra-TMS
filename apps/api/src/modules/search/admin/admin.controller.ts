import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { CreateSynonymDto, QueueQueryDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Search')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check search service health' })
  @ApiStandardResponse('Search service health status')
  @ApiErrorResponses()
  @Roles('ADMIN')
  health(): Promise<any> {
    return this.adminService.health();
  }

  @Get('indexes')
  @ApiOperation({ summary: 'List search indexes' })
  @ApiStandardResponse('Search indexes list')
  @ApiErrorResponses()
  @Roles('ADMIN')
  listIndexes(@CurrentTenant() tenantId: string) {
    return this.adminService.listIndexes(tenantId);
  }

  @Post('indexes/:name/reindex')
  @ApiOperation({ summary: 'Reindex a search index' })
  @ApiParam({ name: 'name', description: 'Index name' })
  @ApiStandardResponse('Reindex started')
  @ApiErrorResponses()
  @Roles('ADMIN')
  reindex(@CurrentTenant() tenantId: string, @Param('name') name: string) {
    return this.adminService.reindex(tenantId, name);
  }

  @Get('indexes/:name/status')
  @ApiOperation({ summary: 'Get search index status' })
  @ApiParam({ name: 'name', description: 'Index name' })
  @ApiStandardResponse('Index status')
  @ApiErrorResponses()
  @Roles('ADMIN')
  indexStatus(@CurrentTenant() tenantId: string, @Param('name') name: string) {
    return this.adminService.indexStatus(tenantId, name);
  }

  @Post('indexes/:name/init')
  @ApiOperation({ summary: 'Initialize search index' })
  @ApiParam({ name: 'name', description: 'Index name' })
  @ApiStandardResponse('Index initialized')
  @ApiErrorResponses()
  @Roles('ADMIN')
  initIndex(@CurrentTenant() tenantId: string, @Param('name') name: string) {
    return this.adminService.ensureIndex(tenantId, name);
  }

  @Get('synonyms')
  @ApiOperation({ summary: 'List search synonyms' })
  @ApiStandardResponse('Synonyms list')
  @ApiErrorResponses()
  @Roles('ADMIN')
  listSynonyms(@CurrentTenant() tenantId: string) {
    return this.adminService.listSynonyms(tenantId);
  }

  @Post('synonyms')
  @ApiOperation({ summary: 'Create a search synonym' })
  @ApiStandardResponse('Synonym created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  createSynonym(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSynonymDto,
  ) {
    return this.adminService.createSynonym(tenantId, userId, dto);
  }

  @Delete('synonyms/:id')
  @ApiOperation({ summary: 'Delete a search synonym' })
  @ApiParam({ name: 'id', description: 'Synonym ID' })
  @ApiStandardResponse('Synonym deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  deleteSynonym(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.adminService.deleteSynonym(tenantId, id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get search analytics' })
  @ApiStandardResponse('Search analytics')
  @ApiErrorResponses()
  @Roles('ADMIN')
  analytics(@CurrentTenant() tenantId: string) {
    return this.adminService.analytics(tenantId);
  }

  @Get('queue')
  @ApiOperation({ summary: 'Get search queue status' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Queue status')
  @ApiErrorResponses()
  @Roles('ADMIN')
  queue(
    @CurrentTenant() tenantId: string,
    @Query() query: QueueQueryDto,
  ) {
    return this.adminService.queueStatus(tenantId, query);
  }
}
