import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import {
  CreateLoadPlannerQuoteDto,
  UpdateLoadPlannerQuoteDto,
  UpdateQuoteStatusDto,
  ListLoadPlannerQuotesDto,
} from './dto';

@Injectable()
export class LoadPlannerQuotesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique quote number in format LP-XXXX
   */
  private async generateQuoteNumber(): Promise<string> {
    const lastQuote = await this.prisma.loadPlannerQuote.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { quoteNumber: true },
    });

    let nextNumber = 1;
    if (lastQuote?.quoteNumber) {
      const match = lastQuote.quoteNumber.match(/LP-(\d+)/);
      if (match && match[1]) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `LP-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * Create a new quote with related items (transactional)
   */
  async create(tenantId: string, dto: CreateLoadPlannerQuoteDto) {
    const quoteNumber = await this.generateQuoteNumber();

    try {
      const quote = await this.prisma.$transaction(async (tx: any) => {
        // Create main quote
        const newQuote = await tx.loadPlannerQuote.create({
          data: {
            tenantId,
            quoteNumber,
            status: 'DRAFT',
            isActive: true,
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            customerPhone: dto.customerPhone,
            customerCompany: dto.customerCompany,
            pickupAddress: dto.pickupAddress,
            pickupCity: dto.pickupCity,
            pickupState: dto.pickupState,
            pickupZip: dto.pickupZip,
            pickupLat: new Prisma.Decimal(String(dto.pickupLat)),
            pickupLng: new Prisma.Decimal(String(dto.pickupLng)),
            dropoffAddress: dto.dropoffAddress,
            dropoffCity: dto.dropoffCity,
            dropoffState: dto.dropoffState,
            dropoffZip: dto.dropoffZip,
            dropoffLat: new Prisma.Decimal(String(dto.dropoffLat)),
            dropoffLng: new Prisma.Decimal(String(dto.dropoffLng)),
            distanceMiles: new Prisma.Decimal(String(dto.distanceMiles)),
            durationMinutes: dto.durationMinutes,
            routePolyline: dto.routePolyline,
            subtotalCents: dto.subtotalCents || 0,
            totalCents: dto.totalCents || 0,
          },
        });

        // Create cargo items
        if (dto.cargoItems && dto.cargoItems.length > 0) {
          for (let i = 0; i < dto.cargoItems.length; i++) {
            const item = dto.cargoItems[i]!;
            await tx.loadPlannerCargoItem.create({
              data: {
                quoteId: newQuote.id,
                description: item.description,
                sku: item.sku,
                quantity: item.quantity,
                lengthIn: new Prisma.Decimal(String(item.lengthIn)),
                widthIn: new Prisma.Decimal(String(item.widthIn)),
                heightIn: new Prisma.Decimal(String(item.heightIn)),
                weightLbs: new Prisma.Decimal(String(item.weightLbs)),
                stackable: item.stackable || false,
                bottomOnly: item.bottomOnly || false,
                maxLayers: item.maxLayers,
                fragile: item.fragile || false,
                hazmat: item.hazmat || false,
                orientation: item.orientation,
                geometryType: item.geometryType,
                geometryData: item.geometryData,
                equipmentMakeId: item.equipmentMakeId,
                equipmentModelId: item.equipmentModelId,
                dimensionsSource: item.dimensionsSource,
                imageUrl1: item.imageUrl1,
                imageUrl2: item.imageUrl2,
                imageUrl3: item.imageUrl3,
                imageUrl4: item.imageUrl4,
                assignedTruckIndex: item.assignedTruckIndex,
                placementX: item.placementX
                  ? new Prisma.Decimal(String(item.placementX))
                  : null,
                placementY: item.placementY
                  ? new Prisma.Decimal(String(item.placementY))
                  : null,
                placementZ: item.placementZ
                  ? new Prisma.Decimal(String(item.placementZ))
                  : null,
                rotation: item.rotation
                  ? new Prisma.Decimal(String(item.rotation))
                  : null,
                sortOrder: i,
              },
            });
          }
        }

        // Create trucks
        if (dto.trucks && dto.trucks.length > 0) {
          for (let i = 0; i < dto.trucks.length; i++) {
            const truck = dto.trucks[i]!;
            await tx.loadPlannerTruck.create({
              data: {
                quoteId: newQuote.id,
                truckIndex: i,
                truckTypeId: truck.truckTypeId,
                truckName: truck.truckName,
                truckCategory: truck.truckCategory,
                deckLengthFt: new Prisma.Decimal(String(truck.deckLengthFt)),
                deckWidthFt: new Prisma.Decimal(String(truck.deckWidthFt)),
                deckHeightFt: new Prisma.Decimal(String(truck.deckHeightFt)),
                wellLengthFt: new Prisma.Decimal(
                  String(truck.wellLengthFt || 0)
                ),
                maxCargoWeightLbs: truck.maxCargoWeightLbs,
                totalWeightLbs: new Prisma.Decimal(
                  String(truck.totalWeightLbs || 0)
                ),
                totalItems: truck.totalItems || 0,
                isLegal: truck.isLegal !== false,
                permitsRequired: truck.permitsRequired || [],
                warnings: truck.warnings || [],
                truckScore: truck.truckScore || 100,
              },
            });
          }
        }

        // Create service items
        if (dto.serviceItems && dto.serviceItems.length > 0) {
          for (let i = 0; i < dto.serviceItems.length; i++) {
            const item = dto.serviceItems[i]!;
            await tx.loadPlannerServiceItem.create({
              data: {
                quoteId: newQuote.id,
                serviceTypeId: item.serviceTypeId,
                name: item.name,
                rateCents: item.rateCents,
                quantity: new Prisma.Decimal(String(item.quantity || 1)),
                totalCents: item.totalCents,
                truckIndex: item.truckIndex,
                sortOrder: i,
              },
            });
          }
        }

        // Create accessorials
        if (dto.accessorials && dto.accessorials.length > 0) {
          for (let i = 0; i < dto.accessorials.length; i++) {
            const acc = dto.accessorials[i]!;
            await tx.loadPlannerAccessorial.create({
              data: {
                quoteId: newQuote.id,
                accessorialTypeId: acc.accessorialTypeId,
                name: acc.name,
                billingUnit: acc.billingUnit,
                rateCents: acc.rateCents,
                quantity: new Prisma.Decimal(String(acc.quantity || 1)),
                totalCents: acc.totalCents,
                notes: acc.notes,
                sortOrder: i,
              },
            });
          }
        }

        // Create permits
        if (dto.permits && dto.permits.length > 0) {
          for (const permit of dto.permits) {
            await tx.loadPlannerPermit.create({
              data: {
                quoteId: newQuote.id,
                stateCode: permit.stateCode,
                stateName: permit.stateName,
                calculatedPermitFeeCents: permit.calculatedPermitFeeCents,
                calculatedEscortFeeCents: permit.calculatedEscortFeeCents,
                calculatedPoleCarFeeCents: permit.calculatedPoleCarFeeCents,
                calculatedSuperLoadFeeCents:
                  permit.calculatedSuperLoadFeeCents,
                calculatedTotalCents: permit.calculatedTotalCents,
                permitFeeCents: permit.permitFeeCents,
                escortFeeCents: permit.escortFeeCents,
                poleCarFeeCents: permit.poleCarFeeCents,
                superLoadFeeCents: permit.superLoadFeeCents,
                totalCents: permit.totalCents,
                distanceMiles: new Prisma.Decimal(String(permit.distanceMiles)),
                escortCount: permit.escortCount || 0,
                poleCarRequired: permit.poleCarRequired || false,
              },
            });
          }
        }

        return newQuote;
      });

      return this.getById(tenantId, quote.id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create quote: ${error.message}`
      );
    }
  }

  /**
   * Get quote by ID with all related data
   */
  async getById(tenantId: string, quoteId: string) {
    const quote = await this.prisma.loadPlannerQuote.findUnique({
      where: { id: quoteId },
      include: {
        cargoItems: {
          orderBy: { sortOrder: 'asc' },
        },
        trucks: {
          orderBy: { truckIndex: 'asc' },
        },
        serviceItems: {
          orderBy: { sortOrder: 'asc' },
        },
        accessorials: {
          orderBy: { sortOrder: 'asc' },
        },
        permits: {
          orderBy: { stateCode: 'asc' },
        },
      },
    });

    if (!quote || quote.tenantId !== tenantId) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  /**
   * List quotes with filters and pagination
   */
  async list(tenantId: string, dto: ListLoadPlannerQuotesDto) {
    const skip = (dto.page - 1) * dto.limit;

    const where: Prisma.LoadPlannerQuoteWhereInput = {
      tenantId,
      isActive: true,
      deletedAt: null,
    };

    // Apply filters
    if (dto.search) {
      where.OR = [
        { quoteNumber: { contains: dto.search, mode: 'insensitive' } },
        { customerName: { contains: dto.search, mode: 'insensitive' } },
        { customerCompany: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.pickupState) {
      where.pickupState = dto.pickupState;
    }

    if (dto.dropoffState) {
      where.dropoffState = dto.dropoffState;
    }

    if (dto.dateFrom || dto.dateTo) {
      where.createdAt = {};
      if (dto.dateFrom) {
        where.createdAt.gte = new Date(dto.dateFrom);
      }
      if (dto.dateTo) {
        where.createdAt.lte = new Date(dto.dateTo);
      }
    }

    const orderBy: Prisma.LoadPlannerQuoteOrderByWithRelationInput = {};
    if (dto.sortBy === 'quoteNumber') {
      orderBy.quoteNumber = dto.sortOrder || 'desc';
    } else if (dto.sortBy === 'customerName') {
      orderBy.customerName = dto.sortOrder || 'asc';
    } else if (dto.sortBy === 'totalCents') {
      orderBy.totalCents = dto.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.loadPlannerQuote.findMany({
        where,
        skip,
        take: dto.limit,
        orderBy,
        include: {
          _count: {
            select: {
              cargoItems: true,
              trucks: true,
            },
          },
        },
      }),
      this.prisma.loadPlannerQuote.count({ where }),
    ]);

    return {
      data,
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    };
  }

  /**
   * Update quote with related items (transactional)
   */
  async update(
    tenantId: string,
    quoteId: string,
    dto: UpdateLoadPlannerQuoteDto
  ) {
    const _existing = await this.getById(tenantId, quoteId);

    try {
      await this.prisma.$transaction(async (tx: any) => {
        // Update main quote
        await tx.loadPlannerQuote.update({
          where: { id: quoteId },
          data: {
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            customerPhone: dto.customerPhone,
            customerCompany: dto.customerCompany,
            pickupAddress: dto.pickupAddress,
            pickupCity: dto.pickupCity,
            pickupState: dto.pickupState,
            pickupZip: dto.pickupZip,
            pickupLat: new Prisma.Decimal(String(dto.pickupLat)),
            pickupLng: new Prisma.Decimal(String(dto.pickupLng)),
            dropoffAddress: dto.dropoffAddress,
            dropoffCity: dto.dropoffCity,
            dropoffState: dto.dropoffState,
            dropoffZip: dto.dropoffZip,
            dropoffLat: new Prisma.Decimal(String(dto.dropoffLat)),
            dropoffLng: new Prisma.Decimal(String(dto.dropoffLng)),
            distanceMiles: new Prisma.Decimal(String(dto.distanceMiles)),
            durationMinutes: dto.durationMinutes,
            routePolyline: dto.routePolyline,
            subtotalCents: dto.subtotalCents,
            totalCents: dto.totalCents,
            updatedAt: new Date(),
          },
        });

        // Delete and recreate cargo items
        await tx.loadPlannerCargoItem.deleteMany({
          where: { quoteId },
        });
        if (dto.cargoItems && dto.cargoItems.length > 0) {
          for (let i = 0; i < dto.cargoItems.length; i++) {
            const item = dto.cargoItems[i]!;
            await tx.loadPlannerCargoItem.create({
              data: {
                quoteId,
                description: item.description,
                sku: item.sku,
                quantity: item.quantity,
                lengthIn: new Prisma.Decimal(String(item.lengthIn)),
                widthIn: new Prisma.Decimal(String(item.widthIn)),
                heightIn: new Prisma.Decimal(String(item.heightIn)),
                weightLbs: new Prisma.Decimal(String(item.weightLbs)),
                stackable: item.stackable || false,
                bottomOnly: item.bottomOnly || false,
                maxLayers: item.maxLayers,
                fragile: item.fragile || false,
                hazmat: item.hazmat || false,
                orientation: item.orientation,
                geometryType: item.geometryType,
                geometryData: item.geometryData,
                equipmentMakeId: item.equipmentMakeId,
                equipmentModelId: item.equipmentModelId,
                dimensionsSource: item.dimensionsSource,
                imageUrl1: item.imageUrl1,
                imageUrl2: item.imageUrl2,
                imageUrl3: item.imageUrl3,
                imageUrl4: item.imageUrl4,
                assignedTruckIndex: item.assignedTruckIndex,
                placementX: item.placementX
                  ? new Prisma.Decimal(String(item.placementX))
                  : null,
                placementY: item.placementY
                  ? new Prisma.Decimal(String(item.placementY))
                  : null,
                placementZ: item.placementZ
                  ? new Prisma.Decimal(String(item.placementZ))
                  : null,
                rotation: item.rotation
                  ? new Prisma.Decimal(String(item.rotation))
                  : null,
                sortOrder: i,
              },
            });
          }
        }

        // Delete and recreate trucks
        await tx.loadPlannerTruck.deleteMany({
          where: { quoteId },
        });
        if (dto.trucks && dto.trucks.length > 0) {
          for (let i = 0; i < dto.trucks.length; i++) {
            const truck = dto.trucks[i]!;
            await tx.loadPlannerTruck.create({
              data: {
                quoteId,
                truckIndex: i,
                truckTypeId: truck.truckTypeId,
                truckName: truck.truckName,
                truckCategory: truck.truckCategory,
                deckLengthFt: new Prisma.Decimal(String(truck.deckLengthFt)),
                deckWidthFt: new Prisma.Decimal(String(truck.deckWidthFt)),
                deckHeightFt: new Prisma.Decimal(String(truck.deckHeightFt)),
                wellLengthFt: new Prisma.Decimal(
                  String(truck.wellLengthFt || 0)
                ),
                maxCargoWeightLbs: truck.maxCargoWeightLbs,
                totalWeightLbs: new Prisma.Decimal(
                  String(truck.totalWeightLbs || 0)
                ),
                totalItems: truck.totalItems || 0,
                isLegal: truck.isLegal !== false,
                permitsRequired: truck.permitsRequired || [],
                warnings: truck.warnings || [],
                truckScore: truck.truckScore || 100,
              },
            });
          }
        }

        // Delete and recreate service items
        await tx.loadPlannerServiceItem.deleteMany({
          where: { quoteId },
        });
        if (dto.serviceItems && dto.serviceItems.length > 0) {
          for (let i = 0; i < dto.serviceItems.length; i++) {
            const item = dto.serviceItems[i]!;
            await tx.loadPlannerServiceItem.create({
              data: {
                quoteId,
                serviceTypeId: item.serviceTypeId,
                name: item.name,
                rateCents: item.rateCents,
                quantity: new Prisma.Decimal(String(item.quantity || 1)),
                totalCents: item.totalCents,
                truckIndex: item.truckIndex,
                sortOrder: i,
              },
            });
          }
        }

        // Delete and recreate accessorials
        await tx.loadPlannerAccessorial.deleteMany({
          where: { quoteId },
        });
        if (dto.accessorials && dto.accessorials.length > 0) {
          for (let i = 0; i < dto.accessorials.length; i++) {
            const acc = dto.accessorials[i]!;
            await tx.loadPlannerAccessorial.create({
              data: {
                quoteId,
                accessorialTypeId: acc.accessorialTypeId,
                name: acc.name,
                billingUnit: acc.billingUnit,
                rateCents: acc.rateCents,
                quantity: new Prisma.Decimal(String(acc.quantity || 1)),
                totalCents: acc.totalCents,
                notes: acc.notes,
                sortOrder: i,
              },
            });
          }
        }

        // Delete and recreate permits
        await tx.loadPlannerPermit.deleteMany({
          where: { quoteId },
        });
        if (dto.permits && dto.permits.length > 0) {
          for (const permit of dto.permits) {
            await tx.loadPlannerPermit.create({
              data: {
                quoteId,
                stateCode: permit.stateCode,
                stateName: permit.stateName,
                calculatedPermitFeeCents: permit.calculatedPermitFeeCents,
                calculatedEscortFeeCents: permit.calculatedEscortFeeCents,
                calculatedPoleCarFeeCents: permit.calculatedPoleCarFeeCents,
                calculatedSuperLoadFeeCents:
                  permit.calculatedSuperLoadFeeCents,
                calculatedTotalCents: permit.calculatedTotalCents,
                permitFeeCents: permit.permitFeeCents,
                escortFeeCents: permit.escortFeeCents,
                poleCarFeeCents: permit.poleCarFeeCents,
                superLoadFeeCents: permit.superLoadFeeCents,
                totalCents: permit.totalCents,
                distanceMiles: new Prisma.Decimal(String(permit.distanceMiles)),
                escortCount: permit.escortCount || 0,
                poleCarRequired: permit.poleCarRequired || false,
              },
            });
          }
        }
      });

      return this.getById(tenantId, quoteId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update quote: ${error.message}`
      );
    }
  }

  /**
   * Update quote status
   */
  async updateStatus(
    tenantId: string,
    quoteId: string,
    dto: UpdateQuoteStatusDto
  ) {
    const _quote = await this.getById(tenantId, quoteId);

    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === 'SENT') {
      updateData.sentAt = new Date();
    } else if (dto.status === 'VIEWED') {
      updateData.viewedAt = new Date();
    }

    await this.prisma.loadPlannerQuote.update({
      where: { id: quoteId },
      data: updateData,
    });

    return this.getById(tenantId, quoteId);
  }

  /**
   * Soft delete quote
   */
  async delete(tenantId: string, quoteId: string) {
    const _quote = await this.getById(tenantId, quoteId);

    await this.prisma.loadPlannerQuote.update({
      where: { id: quoteId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { success: true, message: 'Quote deleted successfully' };
  }

  /**
   * Duplicate an existing quote
   */
  async duplicate(tenantId: string, quoteId: string) {
    const existing = await this.getById(tenantId, quoteId);

    const quoteNumber = await this.generateQuoteNumber();

    try {
      const duplicated = await this.prisma.$transaction(async (tx: any) => {
        // Create new quote
        const newQuote = await tx.loadPlannerQuote.create({
          data: {
            tenantId,
            quoteNumber,
            status: 'DRAFT',
            isActive: true,
            customerName: existing.customerName,
            customerEmail: existing.customerEmail,
            customerPhone: existing.customerPhone,
            customerCompany: existing.customerCompany,
            pickupAddress: existing.pickupAddress,
            pickupCity: existing.pickupCity,
            pickupState: existing.pickupState,
            pickupZip: existing.pickupZip,
            pickupLat: existing.pickupLat,
            pickupLng: existing.pickupLng,
            dropoffAddress: existing.dropoffAddress,
            dropoffCity: existing.dropoffCity,
            dropoffState: existing.dropoffState,
            dropoffZip: existing.dropoffZip,
            dropoffLat: existing.dropoffLat,
            dropoffLng: existing.dropoffLng,
            distanceMiles: existing.distanceMiles,
            durationMinutes: existing.durationMinutes,
            routePolyline: existing.routePolyline,
            subtotalCents: existing.subtotalCents,
            totalCents: existing.totalCents,
          },
        });

        // Copy cargo items
        if (existing.cargoItems && existing.cargoItems.length > 0) {
          for (const item of existing.cargoItems) {
            await tx.loadPlannerCargoItem.create({
              data: {
                quoteId: newQuote.id,
                description: item.description,
                sku: item.sku,
                quantity: item.quantity,
                lengthIn: item.lengthIn,
                widthIn: item.widthIn,
                heightIn: item.heightIn,
                weightLbs: item.weightLbs,
                stackable: item.stackable,
                bottomOnly: item.bottomOnly,
                maxLayers: item.maxLayers,
                fragile: item.fragile,
                hazmat: item.hazmat,
                orientation: item.orientation,
                geometryType: item.geometryType,
                geometryData: item.geometryData,
                equipmentMakeId: item.equipmentMakeId,
                equipmentModelId: item.equipmentModelId,
                dimensionsSource: item.dimensionsSource,
                imageUrl1: item.imageUrl1,
                imageUrl2: item.imageUrl2,
                imageUrl3: item.imageUrl3,
                imageUrl4: item.imageUrl4,
                assignedTruckIndex: item.assignedTruckIndex,
                placementX: item.placementX,
                placementY: item.placementY,
                placementZ: item.placementZ,
                rotation: item.rotation,
                sortOrder: item.sortOrder,
              },
            });
          }
        }

        // Copy trucks
        if (existing.trucks && existing.trucks.length > 0) {
          for (const truck of existing.trucks) {
            await tx.loadPlannerTruck.create({
              data: {
                quoteId: newQuote.id,
                truckIndex: truck.truckIndex,
                truckTypeId: truck.truckTypeId,
                truckName: truck.truckName,
                truckCategory: truck.truckCategory,
                deckLengthFt: truck.deckLengthFt,
                deckWidthFt: truck.deckWidthFt,
                deckHeightFt: truck.deckHeightFt,
                wellLengthFt: truck.wellLengthFt,
                maxCargoWeightLbs: truck.maxCargoWeightLbs,
                totalWeightLbs: truck.totalWeightLbs,
                totalItems: truck.totalItems,
                isLegal: truck.isLegal,
                permitsRequired: truck.permitsRequired,
                warnings: truck.warnings,
                truckScore: truck.truckScore,
              },
            });
          }
        }

        // Copy service items
        if (existing.serviceItems && existing.serviceItems.length > 0) {
          for (const item of existing.serviceItems) {
            await tx.loadPlannerServiceItem.create({
              data: {
                quoteId: newQuote.id,
                serviceTypeId: item.serviceTypeId,
                name: item.name,
                rateCents: item.rateCents,
                quantity: item.quantity,
                totalCents: item.totalCents,
                truckIndex: item.truckIndex,
                sortOrder: item.sortOrder,
              },
            });
          }
        }

        // Copy accessorials
        if (existing.accessorials && existing.accessorials.length > 0) {
          for (const acc of existing.accessorials) {
            await tx.loadPlannerAccessorial.create({
              data: {
                quoteId: newQuote.id,
                accessorialTypeId: acc.accessorialTypeId,
                name: acc.name,
                billingUnit: acc.billingUnit,
                rateCents: acc.rateCents,
                quantity: acc.quantity,
                totalCents: acc.totalCents,
                notes: acc.notes,
                sortOrder: acc.sortOrder,
              },
            });
          }
        }

        // Copy permits
        if (existing.permits && existing.permits.length > 0) {
          for (const permit of existing.permits) {
            await tx.loadPlannerPermit.create({
              data: {
                quoteId: newQuote.id,
                stateCode: permit.stateCode,
                stateName: permit.stateName,
                calculatedPermitFeeCents: permit.calculatedPermitFeeCents,
                calculatedEscortFeeCents: permit.calculatedEscortFeeCents,
                calculatedPoleCarFeeCents: permit.calculatedPoleCarFeeCents,
                calculatedSuperLoadFeeCents: permit.calculatedSuperLoadFeeCents,
                calculatedTotalCents: permit.calculatedTotalCents,
                permitFeeCents: permit.permitFeeCents,
                escortFeeCents: permit.escortFeeCents,
                poleCarFeeCents: permit.poleCarFeeCents,
                superLoadFeeCents: permit.superLoadFeeCents,
                totalCents: permit.totalCents,
                distanceMiles: permit.distanceMiles,
                escortCount: permit.escortCount,
                poleCarRequired: permit.poleCarRequired,
              },
            });
          }
        }

        return newQuote;
      });

      return this.getById(tenantId, duplicated.id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to duplicate quote: ${error.message}`
      );
    }
  }

  /**
   * Get quote by public token (for sharing)
   */
  async getByPublicToken(publicToken: string) {
    const quote = await this.prisma.loadPlannerQuote.findUnique({
      where: { publicToken },
      include: {
        cargoItems: { orderBy: { sortOrder: 'asc' } },
        trucks: { orderBy: { truckIndex: 'asc' } },
        serviceItems: { orderBy: { sortOrder: 'asc' } },
        accessorials: { orderBy: { sortOrder: 'asc' } },
        permits: { orderBy: { stateCode: 'asc' } },
      },
    });

    if (!quote || !quote.isActive) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  /**
   * Get quote statistics
   */
  async getStats(tenantId: string) {
    const [total, drafts, sent, accepted, totalValue] = await Promise.all([
      this.prisma.loadPlannerQuote.count({
        where: { tenantId, isActive: true },
      }),
      this.prisma.loadPlannerQuote.count({
        where: { tenantId, status: 'DRAFT', isActive: true },
      }),
      this.prisma.loadPlannerQuote.count({
        where: { tenantId, status: 'SENT', isActive: true },
      }),
      this.prisma.loadPlannerQuote.count({
        where: { tenantId, status: 'ACCEPTED', isActive: true },
      }),
      this.prisma.loadPlannerQuote.aggregate({
        where: { tenantId, isActive: true },
        _sum: { totalCents: true },
      }),
    ]);

    return {
      total,
      drafts,
      sent,
      accepted,
      totalValueCents: totalValue._sum.totalCents || 0,
    };
  }
}
