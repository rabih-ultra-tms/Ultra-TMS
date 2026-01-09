import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateLoadTenderDto, UpdateLoadTenderDto, RespondToTenderDto, TenderType } from '../dto';

@Injectable()
export class LoadTendersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLoadTenderDto, userId?: string) {
    // Verify load exists
    const load = await this.prisma.load.findFirst({
      where: { id: dto.loadId, tenantId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    // Verify all carriers exist
    const carrierIds = dto.recipients.map((r) => r.carrierId);
    const carriers = await this.prisma.carrier.findMany({
      where: {
        id: { in: carrierIds },
        tenantId,
        status: 'ACTIVE',
      },
    });

    if (carriers.length !== carrierIds.length) {
      throw new BadRequestException('One or more carriers not found or inactive');
    }

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create tender with recipients
    return this.prisma.loadTender.create({
      data: {
        tenantId,
        loadId: dto.loadId,
        tenderType: dto.tenderType,
        tenderRate: dto.tenderRate,
        expiresAt,
        waterfallTimeoutMinutes: dto.waterfallTimeoutMinutes || 30,
        createdById: userId,
        recipients: {
          create: dto.recipients.map((recipient) => ({
            carrierId: recipient.carrierId,
            position: recipient.position,
            status: dto.tenderType === TenderType.WATERFALL && recipient.position === 1 ? 'OFFERED' : 'PENDING',
            offeredAt: dto.tenderType === TenderType.WATERFALL && recipient.position === 1 ? new Date() : undefined,
            expiresAt:
              dto.tenderType === TenderType.WATERFALL && recipient.position === 1
                ? new Date(Date.now() + (dto.waterfallTimeoutMinutes || 30) * 60 * 1000)
                : undefined,
          })),
        },
      },
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
        recipients: {
          include: {
            carrier: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findAll(tenantId: string, loadId?: string, status?: string) {
    const where: any = { tenantId };

    if (loadId) {
      where.loadId = loadId;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.loadTender.findMany({
      where,
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
        recipients: {
          include: {
            carrier: true,
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const tender = await this.prisma.loadTender.findFirst({
      where: { id, tenantId },
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
        recipients: {
          include: {
            carrier: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!tender) {
      throw new NotFoundException('Load tender not found');
    }

    return tender;
  }

  async update(tenantId: string, id: string, dto: UpdateLoadTenderDto) {
    const tender = await this.prisma.loadTender.findFirst({
      where: { id, tenantId },
    });

    if (!tender) {
      throw new NotFoundException('Load tender not found');
    }

    return this.prisma.loadTender.update({
      where: { id },
      data: dto,
      include: {
        recipients: {
          include: {
            carrier: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async respond(tenantId: string, dto: RespondToTenderDto) {
    const tender = await this.prisma.loadTender.findFirst({
      where: { id: dto.tenderId, tenantId },
      include: {
        recipients: {
          orderBy: { position: 'asc' },
        },
        load: true,
      },
    });

    if (!tender) {
      throw new NotFoundException('Load tender not found');
    }

    if (tender.status !== 'ACTIVE') {
      throw new BadRequestException('Tender is no longer active');
    }

    const recipient = tender.recipients.find((r: any) => r.carrierId === dto.carrierId);

    if (!recipient) {
      throw new BadRequestException('Carrier is not a recipient of this tender');
    }

    if (recipient.status !== 'OFFERED') {
      throw new BadRequestException('Tender has not been offered to this carrier');
    }

    if (dto.response === 'ACCEPTED') {
      return this.acceptTender(tenantId, tender, recipient);
    } else {
      return this.declineTender(tenantId, tender, recipient, dto.declineReason);
    }
  }

  private async acceptTender(tenantId: string, tender: any, recipient: any) {
    return this.prisma.$transaction(async (tx: any) => {
      // Update recipient status
      await tx.tenderRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      // Update tender status
      await tx.loadTender.update({
        where: { id: tender.id },
        data: {
          status: 'ACCEPTED',
          acceptedByCarrierId: recipient.carrierId,
          acceptedAt: new Date(),
        },
      });

      // Mark all other recipients as skipped
      await tx.tenderRecipient.updateMany({
        where: {
          tenderId: tender.id,
          id: { not: recipient.id },
        },
        data: {
          status: 'SKIPPED',
        },
      });

      // Update load with carrier info
      await tx.load.update({
        where: { id: tender.loadId },
        data: {
          carrierId: recipient.carrierId,
          carrierRate: tender.tenderRate,
          status: 'TENDERED',
        },
      });

      return { success: true, message: 'Tender accepted' };
    });
  }

  private async declineTender(tenantId: string, tender: any, recipient: any, declineReason?: string) {
    return this.prisma.$transaction(async (tx: any) => {
      // Update recipient status
      await tx.tenderRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'DECLINED',
          respondedAt: new Date(),
          declineReason,
        },
      });

      // If waterfall, offer to next carrier
      if (tender.tenderType === 'WATERFALL') {
        const nextPosition = recipient.position + 1;
        const nextRecipient = tender.recipients.find((r: any) => r.position === nextPosition);

        if (nextRecipient) {
          // Offer to next carrier
          await tx.tenderRecipient.update({
            where: { id: nextRecipient.id },
            data: {
              status: 'OFFERED',
              offeredAt: new Date(),
              expiresAt: new Date(Date.now() + tender.waterfallTimeoutMinutes * 60 * 1000),
            },
          });

          await tx.loadTender.update({
            where: { id: tender.id },
            data: {
              currentPosition: nextPosition,
            },
          });

          return { success: true, message: 'Tender declined, offered to next carrier' };
        } else {
          // No more carriers, expire tender
          await tx.loadTender.update({
            where: { id: tender.id },
            data: {
              status: 'EXPIRED',
            },
          });

          return { success: true, message: 'Tender declined, no more carriers available' };
        }
      }

      return { success: true, message: 'Tender declined' };
    });
  }

  async cancel(tenantId: string, id: string) {
    const tender = await this.prisma.loadTender.findFirst({
      where: { id, tenantId },
    });

    if (!tender) {
      throw new NotFoundException('Load tender not found');
    }

    if (tender.status !== 'ACTIVE') {
      throw new BadRequestException('Can only cancel active tenders');
    }

    return this.prisma.loadTender.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  // Get active tenders (for carrier portal)
  async getActiveForCarrier(tenantId: string, carrierId: string) {
    const recipients = await this.prisma.tenderRecipient.findMany({
      where: {
        carrierId,
        status: 'OFFERED',
      },
      include: {
        tender: {
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
    });

    // Filter tenders to only include those matching tenantId and ACTIVE status
    return recipients
      .filter((r: any) => r.tender && r.tender.tenantId === tenantId && r.tender.status === 'ACTIVE')
      .map((r: any) => r.tender);
  }

  // Auto-expire waterfall offers (run via cron)
  async processWaterfallTimeouts(tenantId: string) {
    const now = new Date();

    // Find expired waterfall offers
    const expiredOffers = await this.prisma.tenderRecipient.findMany({
      where: {
        status: 'OFFERED',
        expiresAt: {
          lte: now,
        },
      },
      include: {
        tender: {
          include: {
            recipients: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    // Filter and process offers that match tenantId and tender criteria
    const validOffers = expiredOffers.filter(
      (offer: any) =>
        offer.tender &&
        offer.tender.tenantId === tenantId &&
        offer.tender.tenderType === 'WATERFALL' &&
        offer.tender.status === 'ACTIVE',
    );

    for (const offer of validOffers) {
      await this.declineTender(tenantId, offer.tender, offer, 'Timeout - no response');
    }

    return { processedCount: validOffers.length };
  }

  // Auto-expire old tenders (run via cron)
  async expireOldTenders(tenantId: string) {
    const now = new Date();

    const result = await this.prisma.loadTender.updateMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return { expiredCount: result.count };
  }
}
