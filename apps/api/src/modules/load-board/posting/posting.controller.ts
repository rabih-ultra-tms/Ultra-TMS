import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { BulkPostDto, BulkRemoveDto, PostLoadDto, PostQueryDto, UpdatePostDto } from './dto';
import { PostingService } from './posting.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostingController {
  constructor(private readonly postingService: PostingService) {}

  @Get('api/v1/load-board/posts')
  list(@CurrentTenant() tenantId: string, @Query() query: PostQueryDto) {
    return this.postingService.list(tenantId, query);
  }

  @Post('api/v1/load-board/posts')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PostLoadDto,
  ) {
    return this.postingService.create(tenantId, userId, dto);
  }

  @Get('api/v1/load-board/posts/:id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.postingService.findOne(tenantId, id);
  }

  @Put('api/v1/load-board/posts/:id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postingService.update(tenantId, id, dto);
  }

  @Post('api/v1/load-board/posts/:id/refresh')
  refresh(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.postingService.refresh(tenantId, id);
  }

  @Delete('api/v1/load-board/posts/:id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.postingService.remove(tenantId, id);
  }

  @Post('api/v1/load-board/posts/bulk')
  bulkPost(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BulkPostDto,
  ) {
    return this.postingService.bulkPost(tenantId, userId, dto);
  }

  @Delete('api/v1/load-board/posts/bulk')
  bulkRemove(@CurrentTenant() tenantId: string, @Body() dto: BulkRemoveDto) {
    return this.postingService.bulkRemove(tenantId, dto);
  }

  @Get('api/v1/loads/:loadId/posts')
  postsForLoad(@CurrentTenant() tenantId: string, @Param('loadId') loadId: string) {
    return this.postingService.postsForLoad(tenantId, loadId);
  }
}
