import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ArticleFeedbackDto, CreateKbArticleDto, PublishArticleDto, UpdateKbArticleDto } from '../dto/help-desk.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private serializeKeywords(keywords?: string[]) {
    if (!keywords || !keywords.length) return null;
    return keywords.join(',');
  }

  async list(tenantId: string) {
    return this.prisma.kBArticle.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const article = await this.prisma.kBArticle.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(tenantId: string, userId: string, dto: CreateKbArticleDto) {
    const slug = dto.slug ?? this.slugify(dto.title);
    return this.prisma.kBArticle.create({
      data: {
        tenantId,
        title: dto.title,
        slug,
        categoryId: dto.categoryId,
        summary: dto.summary,
        content: dto.content,
        isPublished: dto.isPublic ?? false,
        publishedAt: dto.isPublic ? new Date() : null,
        keywords: this.serializeKeywords(dto.keywords),
        customFields: { isFeatured: dto.isFeatured ?? false },
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateKbArticleDto) {
    const existing = await this.findOne(tenantId, id);
    const slug = dto.slug ?? existing.slug;
    return this.prisma.kBArticle.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        slug,
        categoryId: dto.categoryId ?? existing.categoryId,
        summary: dto.summary ?? existing.summary,
        content: dto.content ?? existing.content,
        keywords: dto.keywords ? this.serializeKeywords(dto.keywords) : existing.keywords,
        customFields: {
          ...(existing.customFields as any),
          isFeatured: dto.isFeatured ?? (existing.customFields as any)?.isFeatured ?? false,
        },
        updatedById: userId,
      },
    });
  }

  async publish(tenantId: string, userId: string, id: string, dto: PublishArticleDto) {
    const existing = await this.findOne(tenantId, id);
    return this.prisma.kBArticle.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        customFields: { ...(existing.customFields as any), isFeatured: dto.isFeatured ?? false },
        updatedById: userId,
      },
    });
  }

  async feedback(tenantId: string, id: string, dto: ArticleFeedbackDto) {
    await this.findOne(tenantId, id);
    if (dto.helpful) {
      return this.prisma.kBArticle.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } },
      });
    }
    return this.prisma.kBArticle.update({ where: { id }, data: { unhelpfulCount: { increment: 1 } } });
  }
}
