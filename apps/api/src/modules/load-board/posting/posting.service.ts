import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoadPostStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { BulkPostDto, BulkRemoveDto, PostLoadDto, PostQueryDto, UpdatePostDto } from './dto';

@Injectable()
export class PostingService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string, query: PostQueryDto) {
    const { accountId, loadId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (accountId) where.accountId = accountId;
    if (loadId) where.loadId = loadId;
    if (status) where.status = status as LoadPostStatus;

    const [data, total] = await Promise.all([
      this.prisma.loadPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: true,
          load: {
            include: {
              order: {
                include: { stops: { orderBy: { stopSequence: 'asc' } } },
              },
            },
          },
          leads: true,
        },
      }),
      this.prisma.loadPost.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const post = await this.prisma.loadPost.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        account: true,
        load: {
          include: {
            order: {
              include: {
                stops: { orderBy: { stopSequence: 'asc' } },
              },
            },
          },
        },
        leads: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Load post not found');
    }

    return post;
  }

  async create(tenantId: string, userId: string, dto: PostLoadDto) {
    const load = await this.prisma.load.findFirst({
      where: { id: dto.loadId, tenantId },
      include: {
        order: {
          include: {
            stops: { orderBy: { stopSequence: 'asc' } },
          },
        },
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const accounts = await this.prisma.loadBoardAccount.findMany({
      where: { id: { in: dto.accountIds }, tenantId, deletedAt: null },
    });

    if (!accounts.length) {
      throw new BadRequestException('No valid load board accounts provided');
    }

    const loadData: any = load;
    const pickup = loadData.order?.stops?.find((stop: any) => stop.stopType === 'PICKUP') ?? loadData.order?.stops?.[0];
    const delivery = loadData.order?.stops?.slice(-1)?.[0];

    if (!pickup || !delivery) {
      throw new BadRequestException('Load must have at least two stops');
    }

    const payloads = accounts.map((account) => {
      const accountCustom = account.customFields as Record<string, any> | null;
      return {
      tenantId,
      accountId: account.id,
      loadId: load.id,
      orderId: (load as any).orderId,
      postNumber: this.generatePostNumber(),
      status: dto.postImmediately ? LoadPostStatus.POSTED : LoadPostStatus.DRAFT,
      originCity: pickup.city ?? '',
      originState: pickup.state ?? '',
      originZip: pickup.postalCode ?? undefined,
      destCity: delivery.city ?? '',
      destState: delivery.state ?? '',
      destZip: delivery.postalCode ?? undefined,
      pickupDate: pickup.appointmentDate ?? new Date(),
      deliveryDate: delivery.appointmentDate ?? undefined,
      equipmentType: loadData.equipmentType ?? loadData.order?.equipmentType ?? 'VAN',
      length: loadData.length ?? loadData.order?.length,
      weight: loadData.weightLbs ?? loadData.order?.weightLbs,
      commodity: loadData.commodity ?? loadData.order?.commodity,
      postedRate: dto.rateAmount ?? 0,
        contactPhone: dto.contactPhone ?? accountCustom?.contactPhone,
      contactEmail: undefined,
      postedAt: dto.postImmediately ? new Date() : null,
      expiresAt: this.defaultExpiry(),
      createdById: userId,
      customFields: { comments: dto.comments },
      };
    });

    const created = await this.prisma.$transaction(
      payloads.map((data) =>
        this.prisma.loadPost.create({
          data,
        }),
      ),
    );

    created.forEach((post) => this.events.emit('loadboard.post.created', { postId: post.id, loadId: post.loadId }));

    return created;
  }

  async update(tenantId: string, id: string, dto: UpdatePostDto) {
    await this.assertPost(tenantId, id);

    return this.prisma.loadPost.update({
      where: { id },
      data: {
        status: dto.status as LoadPostStatus,
        postedRate: dto.rateAmount,
        externalPostId: dto.externalPostId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        customFields: dto.comments ? { comments: dto.comments } : undefined,
      },
    });
  }

  async refresh(tenantId: string, id: string) {
    await this.assertPost(tenantId, id);

    const refreshed = await this.prisma.loadPost.update({
      where: { id },
      data: {
        postedAt: new Date(),
        expiresAt: this.defaultExpiry(),
        status: LoadPostStatus.POSTED,
      },
    });

    this.events.emit('loadboard.post.refreshed', { postId: refreshed.id });
    return refreshed;
  }

  async remove(tenantId: string, id: string) {
    const post = await this.assertPost(tenantId, id);

    await this.prisma.loadPost.update({
      where: { id },
      data: {
        status: LoadPostStatus.CANCELLED,
        removedAt: new Date(),
      },
    });

    this.events.emit('loadboard.post.removed', { postId: post.id, loadId: post.loadId });
    return { success: true };
  }

  async bulkPost(tenantId: string, userId: string, dto: BulkPostDto) {
    const results = [] as any[];
    for (const loadId of dto.loadIds) {
      const created = await this.create(tenantId, userId, {
        loadId,
        accountIds: dto.accountIds,
        rateType: dto.rateType,
      });
      results.push(...created);
    }
    return { count: results.length, posts: results };
  }

  async bulkRemove(tenantId: string, dto: BulkRemoveDto) {
    const where: any = { tenantId };

    if (dto.postIds?.length) where.id = { in: dto.postIds };
    if (dto.loadIds?.length) where.loadId = { in: dto.loadIds };
    if (dto.accountIds?.length) where.accountId = { in: dto.accountIds };

    const posts = await this.prisma.loadPost.findMany({ where });
    if (!posts.length) {
      return { count: 0 };
    }

    const { count } = await this.prisma.loadPost.updateMany({
      where,
      data: { status: LoadPostStatus.CANCELLED, removedAt: new Date() },
    });

    posts.forEach((post) => this.events.emit('loadboard.post.removed', { postId: post.id, loadId: post.loadId }));

    return { count };
  }

  async postsForLoad(tenantId: string, loadId: string) {
    return this.prisma.loadPost.findMany({
      where: { tenantId, loadId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async assertPost(tenantId: string, id: string) {
    const post = await this.prisma.loadPost.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!post) {
      throw new NotFoundException('Load post not found');
    }
    return post;
  }

  private generatePostNumber() {
    return `LP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private defaultExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
}
