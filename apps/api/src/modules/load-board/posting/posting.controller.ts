import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { BulkPostDto, BulkRemoveDto, PostLoadDto, PostQueryDto, UpdatePostDto } from './dto';
import { PostingService } from './posting.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class PostingController {
  constructor(private readonly postingService: PostingService) {}

  @Get('api/v1/load-board/posts')
  @ApiOperation({ summary: 'List load board posts' })
  @ApiStandardResponse('Load board posts list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @Query() query: PostQueryDto) {
    return this.postingService.list(tenantId, query);
  }

  @Post('api/v1/load-board/posts')
  @ApiOperation({ summary: 'Create load board post' })
  @ApiStandardResponse('Load board post created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PostLoadDto,
  ) {
    return this.postingService.create(tenantId, userId, dto);
  }

  @Get('api/v1/load-board/posts/:id')
  @ApiOperation({ summary: 'Get load board post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiStandardResponse('Load board post details')
  @ApiErrorResponses()
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.postingService.findOne(tenantId, id);
  }

  @Put('api/v1/load-board/posts/:id')
  @ApiOperation({ summary: 'Update load board post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiStandardResponse('Load board post updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postingService.update(tenantId, id, dto);
  }

  @Post('api/v1/load-board/posts/:id/refresh')
  @ApiOperation({ summary: 'Refresh load board post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiStandardResponse('Load board post refreshed')
  @ApiErrorResponses()
  refresh(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.postingService.refresh(tenantId, id);
  }

  @Delete('api/v1/load-board/posts/:id')
  @ApiOperation({ summary: 'Delete load board post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiStandardResponse('Load board post deleted')
  @ApiErrorResponses()
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.postingService.remove(tenantId, id);
  }

  @Post('api/v1/load-board/posts/bulk')
  @ApiOperation({ summary: 'Bulk post loads' })
  @ApiStandardResponse('Load board bulk post created')
  @ApiErrorResponses()
  bulkPost(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BulkPostDto,
  ) {
    return this.postingService.bulkPost(tenantId, userId, dto);
  }

  @Delete('api/v1/load-board/posts/bulk')
  @ApiOperation({ summary: 'Bulk remove load board posts' })
  @ApiStandardResponse('Load board bulk posts removed')
  @ApiErrorResponses()
  bulkRemove(@CurrentTenant() tenantId: string, @Body() dto: BulkRemoveDto) {
    return this.postingService.bulkRemove(tenantId, dto);
  }

  @Get('api/v1/loads/:loadId/posts')
  @ApiOperation({ summary: 'List posts for load' })
  @ApiParam({ name: 'loadId', description: 'Load ID' })
  @ApiStandardResponse('Load posts list')
  @ApiErrorResponses()
  postsForLoad(@CurrentTenant() tenantId: string, @Param('loadId') loadId: string) {
    return this.postingService.postsForLoad(tenantId, loadId);
  }
}
