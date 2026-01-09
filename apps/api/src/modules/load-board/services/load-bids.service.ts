import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  CreateLoadBidDto,
  UpdateLoadBidDto,
  AcceptBidDto,
  RejectBidDto,
  CounterBidDto,
  BidStatus,
} from '../dto';

@Injectable()
export class LoadBidsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLoadBidDto) {
    // Verify posting exists and is active
    const posting = await this.prisma.loadPosting.findFirst({
      where: {
        id: dto.postingId,
        tenantId,
      },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    if (posting.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot bid on inactive posting');
    }

    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: {
        id: dto.carrierId,
        tenantId,
      },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    // Check if carrier already has active bid
    const existingBid = await this.prisma.loadBid.findFirst({
      where: {
        postingId: dto.postingId,
        carrierId: dto.carrierId,
        status: {
          in: [BidStatus.PENDING, BidStatus.COUNTERED],
        },
      },
    });

    if (existingBid) {
      throw new BadRequestException('Carrier already has an active bid on this posting');
    }

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.prisma.loadBid.create({
      data: {
        tenantId,
        postingId: dto.postingId,
        loadId: dto.loadId,
        carrierId: dto.carrierId,
        bidAmount: dto.bidAmount,
        rateType: dto.rateType,
        notes: dto.notes,
        truckNumber: dto.truckNumber,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        expiresAt,
        source: 'INTERNAL',
      },
      include: {
        posting: true,
        carrier: true,
      },
    });
  }

  async findAll(tenantId: string, postingId?: string, carrierId?: string) {
    const where: any = { tenantId };

    if (postingId) {
      where.postingId = postingId;
    }

    if (carrierId) {
      where.carrierId = carrierId;
    }

    return this.prisma.loadBid.findMany({
      where,
      include: {
        posting: {
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
          },
        },
        carrier: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const bid = await this.prisma.loadBid.findFirst({
      where: { id, tenantId },
      include: {
        posting: {
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
          },
        },
        carrier: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Load bid not found');
    }

    return bid;
  }

  async update(tenantId: string, id: string, dto: UpdateLoadBidDto) {
    const bid = await this.prisma.loadBid.findFirst({
      where: { id, tenantId },
    });

    if (!bid) {
      throw new NotFoundException('Load bid not found');
    }

    if (bid.status !== BidStatus.PENDING && bid.status !== BidStatus.COUNTERED) {
      throw new BadRequestException('Cannot update bid in current status');
    }

    return this.prisma.loadBid.update({
      where: { id },
      data: dto,
    });
  }

  async accept(tenantId: string, id: string, _dto: AcceptBidDto) {
    const bid = await this.prisma.loadBid.findFirst({
      where: { id, tenantId },
      include: {
        posting: true,
        load: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Load bid not found');
    }

    if (bid.status !== BidStatus.PENDING && bid.status !== BidStatus.COUNTERED) {
      throw new BadRequestException('Can only accept pending or countered bids');
    }

    // Use transaction to update bid, posting, and load
    return this.prisma.$transaction(async (tx: any) => {
      // Accept the bid
      const acceptedBid = await tx.loadBid.update({
        where: { id },
        data: {
          status: BidStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      // Reject all other bids on this posting
      await tx.loadBid.updateMany({
        where: {
          postingId: bid.postingId,
          id: { not: id },
          status: { in: [BidStatus.PENDING, BidStatus.COUNTERED] },
        },
        data: {
          status: BidStatus.REJECTED,
          rejectedAt: new Date(),
          rejectionReason: 'Another bid was accepted',
        },
      });

      // Update posting status
      await tx.loadPosting.update({
        where: { id: bid.postingId },
        data: {
          status: 'BOOKED',
        },
      });

      // Update load with carrier info
      await tx.load.update({
        where: { id: bid.loadId },
        data: {
          carrierId: bid.carrierId,
          carrierRate: bid.bidAmount,
          status: 'TENDERED',
          truckNumber: bid.truckNumber,
          driverName: bid.driverName,
          driverPhone: bid.driverPhone,
        },
      });

      return acceptedBid;
    });
  }

  async reject(tenantId: string, id: string, dto: RejectBidDto) {
    const bid = await this.prisma.loadBid.findFirst({
      where: { id, tenantId },
    });

    if (!bid) {
      throw new NotFoundException('Load bid not found');
    }

    if (bid.status !== BidStatus.PENDING && bid.status !== BidStatus.COUNTERED) {
      throw new BadRequestException('Can only reject pending or countered bids');
    }

    return this.prisma.loadBid.update({
      where: { id },
      data: {
        status: BidStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: dto.rejectionReason,
      },
    });
  }

  async counter(tenantId: string, id: string, dto: CounterBidDto) {
    const bid = await this.prisma.loadBid.findFirst({
      where: { id, tenantId },
    });

    if (!bid) {
      throw new NotFoundException('Load bid not found');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Can only counter pending bids');
    }

    return this.prisma.loadBid.update({
      where: { id },
      data: {
        status: BidStatus.COUNTERED,
        counterAmount: dto.counterAmount,
        counterNotes: dto.counterNotes,
        counterAt: new Date(),
      },
    });
  }

  async withdraw(tenantId: string, id: string) {
    const bid = await this.prisma.loadBid.findFirst({
      where: { id, tenantId },
    });

    if (!bid) {
      throw new NotFoundException('Load bid not found');
    }

    if (bid.status === BidStatus.ACCEPTED) {
      throw new BadRequestException('Cannot withdraw accepted bid');
    }

    return this.prisma.loadBid.update({
      where: { id },
      data: {
        status: BidStatus.WITHDRAWN,
      },
    });
  }

  // Get bids for a specific posting
  async getForPosting(tenantId: string, postingId: string) {
    const posting = await this.prisma.loadPosting.findFirst({
      where: { id: postingId, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Load posting not found');
    }

    return this.prisma.loadBid.findMany({
      where: {
        tenantId,
        postingId,
      },
      include: {
        carrier: true,
      },
      orderBy: [{ status: 'asc' }, { bidAmount: 'asc' }],
    });
  }

  // Get bids for a specific carrier
  async getForCarrier(tenantId: string, carrierId: string) {
    return this.prisma.loadBid.findMany({
      where: {
        tenantId,
        carrierId,
      },
      include: {
        posting: {
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
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // Auto-expire old bids (run via cron)
  async expireOldBids(tenantId: string) {
    const now = new Date();

    const result = await this.prisma.loadBid.updateMany({
      where: {
        tenantId,
        status: {
          in: [BidStatus.PENDING, BidStatus.COUNTERED],
        },
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: BidStatus.EXPIRED,
      },
    });

    return { expiredCount: result.count };
  }
}
