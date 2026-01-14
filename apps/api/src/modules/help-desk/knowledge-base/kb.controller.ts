import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import {
  ArticleFeedbackDto,
  CreateKbArticleDto,
  CreateKbCategoryDto,
  PublishArticleDto,
  UpdateKbArticleDto,
  UpdateKbCategoryDto,
} from '../dto/help-desk.dto';
import { CategoriesService } from './categories.service';
import { ArticlesService } from './articles.service';

@Controller('support/kb')
@UseGuards(JwtAuthGuard)
export class KbController {
  constructor(private readonly categories: CategoriesService, private readonly articles: ArticlesService) {}

  @Get('categories')
  listCategories(@CurrentTenant() tenantId: string) {
    return this.categories.listCategories(tenantId);
  }

  @Post('categories')
  createCategory(@CurrentTenant() tenantId: string, @Body() dto: CreateKbCategoryDto) {
    return this.categories.create(tenantId, dto);
  }

  @Put('categories/:id')
  updateCategory(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateKbCategoryDto) {
    return this.categories.update(tenantId, id, dto);
  }

  @Get('articles')
  listArticles(@CurrentTenant() tenantId: string) {
    return this.articles.list(tenantId);
  }

  @Post('articles')
  createArticle(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKbArticleDto,
  ) {
    return this.articles.create(tenantId, userId, dto);
  }

  @Get('articles/:id')
  getArticle(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.articles.findOne(tenantId, id);
  }

  @Put('articles/:id')
  updateArticle(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKbArticleDto,
  ) {
    return this.articles.update(tenantId, userId, id, dto);
  }

  @Post('articles/:id/publish')
  publishArticle(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: PublishArticleDto,
  ) {
    return this.articles.publish(tenantId, userId, id, dto);
  }

  @Post('articles/:id/feedback')
  feedback(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ArticleFeedbackDto) {
    return this.articles.feedback(tenantId, id, dto);
  }
}
