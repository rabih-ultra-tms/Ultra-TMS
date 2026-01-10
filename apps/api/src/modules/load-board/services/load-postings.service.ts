import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  CreateLoadPostingDto,
  UpdateLoadPostingDto,
  SearchLoadPostingDto,
  PostingStatus,
} from '../dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LoadPostingsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLoadPostingDto, userId?: string) {
    // Verify load exists and get details for denormalization
    const load = await this.prisma.load.findFirst({
      where: { id: dto.loadId, tenantId },
      include: {
        order: {
          include: {
            stops: {
              orderBy: { stopSequence: 'asc' },
            },
          },
        },
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const pickup = load.order.stops.find((s: any) => s.stopType === 'PICKUP');
    const delivery = load.order.stops[load.order.stops.length - 1];

    // Calculate expiration date if not provided
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return this.prisma.loadPosting.create({
      data: {
        tenantId,
        loadId: dto.loadId,
        postingType: dto.postingType,
        visibility: dto.visibility || 'ALL_CARRIERS',
        showRate: dto.showRate || false,
        rateType: dto.rateType,
        postedRate: dto.postedRate,
        rateMin: dto.rateMin,
        rateMax: dto.rateMax,
        // Denormalize origin
        originCity: pickup?.city,
        originState: pickup?.state,
        originZip: pickup?.postalCode,
        originLat: pickup?.latitude,
        originLng: pickup?.longitude,
        // Denormalize destination
        destCity: delivery?.city,
        destState: delivery?.state,
        destZip: delivery?.postalCode,
        destLat: delivery?.latitude,
        destLng: delivery?.longitude,
        // Denormalize load details
        equipmentType: load.equipmentType,
        totalMiles: null, // Calculate from stops if needed
        weightLbs: load.order.weightLbs,
        pickupDate: pickup?.appointmentDate,
        deliveryDate: delivery?.appointmentDate,
        expiresAt,
        autoRefresh: dto.autoRefresh ?? true,
        refreshInterval: dto.refreshInterval || 4,
        carrierIds: dto.carrierIds || [],
        createdById: userId,
      },
      include: {
        load: {
          include: {
            order: {
              include: {
                stops: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(tenantId: string, searchDto: SearchLoadPostingDto) {
    const {
      originState,
      originCity,
      destState,
      destCity,
      equipmentType,
      pickupDateFrom,
      pickupDateTo,
      radiusMiles: _radiusMiles,
      status,
      page = 1,
      limit = 50,
    } = searchDto;

    const where: Prisma.LoadPostingWhereInput = {
      tenantId,
      status: status || PostingStatus.ACTIVE,
      deletedAt: null,
    };

    if (originState) {
      where.originState = originState;
    }
    if (originCity) {
      where.originCity = { contains: originCity, mode: 'insensitive' };
    }
    if (destState) {
      where.destState = destState;
    }
    if (destCity) {
      where.destCity = { contains: destCity, mode: 'insensitive' };
    }
    if (equipmentType) {
      where.equipmentType = equipmentType;
    }
    if (pickupDateFrom || pickupDateTo) {
      where.pickupDate = {};
      if (pickupDateFrom) {
        where.pickupDate.gte = new Date(pickupDateFrom);
      }
      if (pickupDateTo) {
        where.pickupDate.lte = new Date(pickupDateTo);
      }
    }

    const skip = (page - 1) * limit;

    const [postings, total] = await Promise.all([
      this.prisma.loadPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { postedAt: 'desc' },
        include: {
          load: {
            include: {
              order: {
                include: {
                  stops: {
                    orderBy: { stopSequence: 'asc' },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              views: true,
              bids: true,
            },
          },
        },
      }),
      this.prisma.loadPosting.count({ where }),
    ]);

    return {
      data: postings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        load: {
          include: {
            order: {
              include: {
                stops: {
                  orderBy: { stopSequence: 'asc' },
                },
              },
            },
          },
        },
        views: {
          include: {
            carrier: true,
          },
        },
        bids: {
          include: {
            carrier: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    return posting;
  }

  async update(tenantId: string, id: string, dto: UpdateLoadPostingDto) {
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    return this.prisma.loadPosting.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    return this.prisma.loadPosting.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async expire(tenantId: string, id: string) {
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    return this.prisma.loadPosting.update({
      where: { id },
      data: {
        status: PostingStatus.EXPIRED,
      },
    });
  }

  async refresh(tenantId: string, id: string) {
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    if (posting.status !== PostingStatus.ACTIVE) {
      throw new BadRequestException('Can only refresh active postings');
    }

    // Reset expiration
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.loadPosting.update({
      where: { id },
      data: {
        lastRefreshedAt: new Date(),
        expiresAt,
      },
    });
  }

  async trackView(tenantId: string, postingId: string, carrierId: string, source?: string) {
    // Check if posting exists
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id: postingId, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    // Upsert carrier view
    await this.prisma.carrierLoadView.upsert({
      where: {
        postingId_carrierId: {
          postingId,
          carrierId,
        },
      },
      create: {
        tenantId,
        postingId,
        carrierId,
        viewedAt: new Date(),
        source,
      },
      update: {
        viewedAt: new Date(),
        source,
      },
    });

    // Increment view count
    await this.prisma.loadPosting.update({
      where: { id: postingId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  }

  async getMetrics(tenantId: string, postingId: string) {
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id: postingId, tenantId },
      include: {
        _count: {
          select: {
            views: true,
            bids: true,
          },
        },
      },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    return {
      postingId,
      viewCount: posting.viewCount,
      uniqueViewers: posting._count.views,
      inquiryCount: posting.inquiryCount,
      bidCount: posting._count.bids,
      status: posting.status,
      postedAt: posting.postedAt,
      expiresAt: posting.expiresAt,
    };
  }

  // Auto-expire old postings (run via cron)
  async expireOldPostings(tenantId: string) {
    const now = new Date();

    const result = await this.prisma.loadPosting.updateMany({
      where: {
        tenantId,
        status: PostingStatus.ACTIVE,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: PostingStatus.EXPIRED,
      },
    });

    return { expiredCount: result.count };
  }

  // Auto-refresh postings (run via cron)
  async autoRefreshPostings(tenantId: string) {
    const now = new Date();

    const postingsToRefresh = await this.prisma.loadPosting.findMany({
      where: {
        tenantId,
        status: PostingStatus.ACTIVE,
        autoRefresh: true,
        OR: [
          { lastRefreshedAt: null },
          {
            lastRefreshedAt: {
              lte: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
            },
          },
        ],
      },
    });

    const results = await Promise.all(
      postingsToRefresh.map((posting: any) =>
        this.prisma.loadPosting.update({
          where: { id: posting.id },
          data: {
            lastRefreshedAt: now,
            expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ),
    );

    return { refreshedCount: results.length };
  }
}
