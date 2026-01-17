import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
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
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('support/kb')
@UseGuards(JwtAuthGuard)
@ApiTags('Knowledge Base')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class KbController {
  constructor(private readonly categories: CategoriesService, private readonly articles: ArticlesService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List knowledge base categories' })
  @ApiStandardResponse('KB categories list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  listCategories(@CurrentTenant() tenantId: string) {
    return this.categories.listCategories(tenantId);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create knowledge base category' })
  @ApiStandardResponse('KB category created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  createCategory(@CurrentTenant() tenantId: string, @Body() dto: CreateKbCategoryDto) {
    return this.categories.create(tenantId, dto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update knowledge base category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiStandardResponse('KB category updated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  updateCategory(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateKbCategoryDto) {
    return this.categories.update(tenantId, id, dto);
  }

  @Get('articles')
  @ApiOperation({ summary: 'List knowledge base articles' })
  @ApiStandardResponse('KB articles list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  listArticles(@CurrentTenant() tenantId: string) {
    return this.articles.list(tenantId);
  }

  @Post('articles')
  @ApiOperation({ summary: 'Create knowledge base article' })
  @ApiStandardResponse('KB article created')
  @ApiErrorResponses()
  createArticle(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKbArticleDto,
  ) {
    return this.articles.create(tenantId, userId, dto);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get knowledge base article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiStandardResponse('KB article details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getArticle(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.articles.findOne(tenantId, id);
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Update knowledge base article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiStandardResponse('KB article updated')
  @ApiErrorResponses()
  updateArticle(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKbArticleDto,
  ) {
    return this.articles.update(tenantId, userId, id, dto);
  }

  @Post('articles/:id/publish')
  @ApiOperation({ summary: 'Publish knowledge base article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiStandardResponse('KB article published')
  @ApiErrorResponses()
  @Roles('ADMIN')
  publishArticle(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: PublishArticleDto,
  ) {
    return this.articles.publish(tenantId, userId, id, dto);
  }

  @Post('articles/:id/feedback')
  @ApiOperation({ summary: 'Submit knowledge base feedback' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiStandardResponse('KB feedback recorded')
  @ApiErrorResponses()
  feedback(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ArticleFeedbackDto) {
    return this.articles.feedback(tenantId, id, dto);
  }
}
