import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import {
  CreateOperationsCarrierDto,
  UpdateOperationsCarrierDto,
  ListOperationsCarriersDto,
  CreateOperationsCarrierDriverDto,
  UpdateOperationsCarrierDriverDto,
  CreateOperationsCarrierTruckDto,
  UpdateOperationsCarrierTruckDto,
  CreateOperationsCarrierDocumentDto,
} from './dto';

@Injectable()
export class CarriersService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // CARRIERS
  // ============================================================================

  async createCarrier(tenantId: string, dto: CreateOperationsCarrierDto) {
    try {
      return await this.prisma.operationsCarrier.create({
        data: {
          tenantId,
          carrierType: dto.carrierType,
          companyName: dto.companyName,
          mcNumber: dto.mcNumber,
          dotNumber: dto.dotNumber,
          einTaxId: dto.einTaxId,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zip: dto.zip,
          phone: dto.phone,
          phoneSecondary: dto.phoneSecondary,
          email: dto.email,
          website: dto.website,
          billingEmail: dto.billingEmail,
          paymentTermsDays: dto.paymentTermsDays || 30,
          preferredPaymentMethod: dto.preferredPaymentMethod,
          factoringCompanyName: dto.factoringCompanyName,
          factoringCompanyPhone: dto.factoringCompanyPhone,
          factoringCompanyEmail: dto.factoringCompanyEmail,
          insuranceCompany: dto.insuranceCompany,
          insurancePolicyNumber: dto.insurancePolicyNumber,
          insuranceExpiryDate: dto.insuranceExpiryDate
            ? new Date(dto.insuranceExpiryDate)
            : null,
          cargoInsuranceLimitCents: dto.cargoInsuranceLimitCents,
          status: dto.status || 'ACTIVE',
          notes: dto.notes,
          equipmentTypes: dto.equipmentTypes ?? [],
          truckCount: dto.truckCount,
          trailerCount: dto.trailerCount,
          isActive: true,
          ...(dto.tier !== undefined && { tier: dto.tier }),
          ...(dto.onTimePickupRate !== undefined && {
            onTimePickupRate: new Prisma.Decimal(String(dto.onTimePickupRate)),
          }),
          ...(dto.onTimeDeliveryRate !== undefined && {
            onTimeDeliveryRate: new Prisma.Decimal(String(dto.onTimeDeliveryRate)),
          }),
          ...(dto.claimsRate !== undefined && {
            claimsRate: new Prisma.Decimal(String(dto.claimsRate)),
          }),
          ...(dto.avgRating !== undefined && {
            avgRating: new Prisma.Decimal(String(dto.avgRating)),
          }),
          ...(dto.acceptanceRate !== undefined && {
            acceptanceRate: new Prisma.Decimal(String(dto.acceptanceRate)),
          }),
          ...(dto.totalLoadsCompleted !== undefined && {
            totalLoadsCompleted: dto.totalLoadsCompleted,
          }),
          ...(dto.performanceScore !== undefined && {
            performanceScore: new Prisma.Decimal(String(dto.performanceScore)),
          }),
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create carrier: ${error.message}`
      );
    }
  }

  async listCarriers(tenantId: string, dto: ListOperationsCarriersDto) {
    const skip = (dto.page - 1) * dto.limit;

    const where: Prisma.OperationsCarrierWhereInput = {
      tenantId,
      isActive: true,
      deletedAt: null,
    };

    if (dto.search) {
      where.OR = [
        { companyName: { contains: dto.search, mode: 'insensitive' } },
        { mcNumber: { contains: dto.search, mode: 'insensitive' } },
        { dotNumber: { contains: dto.search, mode: 'insensitive' } },
        { email: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.carrierType) {
      where.carrierType = dto.carrierType;
    }

    const orderBy: Prisma.OperationsCarrierOrderByWithRelationInput = {};
    if (dto.sortBy === 'companyName') {
      orderBy.companyName = dto.sortOrder || 'asc';
    } else if (dto.sortBy === 'status') {
      orderBy.status = dto.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.operationsCarrier.findMany({
        where,
        skip,
        take: dto.limit,
        orderBy,
        include: {
          _count: {
            select: {
              drivers: true,
              trucks: true,
            },
          },
        },
      }),
      this.prisma.operationsCarrier.count({ where }),
    ]);

    return {
      data,
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    };
  }

  async getCarrierStats(tenantId: string) {
    const where: Prisma.OperationsCarrierWhereInput = {
      tenantId,
      isActive: true,
      deletedAt: null,
    };

    const [total, byType, byStatus] = await Promise.all([
      this.prisma.operationsCarrier.count({ where }),
      this.prisma.operationsCarrier.groupBy({
        by: ['carrierType'],
        where,
        _count: true,
      }),
      this.prisma.operationsCarrier.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.carrierType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getCarrierById(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.operationsCarrier.findUnique({
      where: { id: carrierId },
      include: {
        drivers: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        trucks: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            documents: { where: { isActive: true } },
          },
        },
      },
    });

    if (!carrier || carrier.tenantId !== tenantId) {
      throw new NotFoundException('Carrier not found');
    }

    return carrier;
  }

  async updateCarrier(
    tenantId: string,
    carrierId: string,
    dto: UpdateOperationsCarrierDto
  ) {
    const _existing = await this.getCarrierById(tenantId, carrierId);

    try {
      return await this.prisma.operationsCarrier.update({
        where: { id: carrierId },
        data: {
          carrierType: dto.carrierType,
          companyName: dto.companyName,
          mcNumber: dto.mcNumber,
          dotNumber: dto.dotNumber,
          einTaxId: dto.einTaxId,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zip: dto.zip,
          phone: dto.phone,
          phoneSecondary: dto.phoneSecondary,
          email: dto.email,
          website: dto.website,
          billingEmail: dto.billingEmail,
          paymentTermsDays: dto.paymentTermsDays,
          preferredPaymentMethod: dto.preferredPaymentMethod,
          factoringCompanyName: dto.factoringCompanyName,
          factoringCompanyPhone: dto.factoringCompanyPhone,
          factoringCompanyEmail: dto.factoringCompanyEmail,
          insuranceCompany: dto.insuranceCompany,
          insurancePolicyNumber: dto.insurancePolicyNumber,
          insuranceExpiryDate: dto.insuranceExpiryDate
            ? new Date(dto.insuranceExpiryDate)
            : null,
          cargoInsuranceLimitCents: dto.cargoInsuranceLimitCents,
          status: dto.status,
          notes: dto.notes,
          ...(dto.equipmentTypes !== undefined && { equipmentTypes: dto.equipmentTypes }),
          ...(dto.truckCount !== undefined && { truckCount: dto.truckCount }),
          ...(dto.trailerCount !== undefined && { trailerCount: dto.trailerCount }),
          ...(dto.tier !== undefined && { tier: dto.tier }),
          ...(dto.onTimePickupRate !== undefined && {
            onTimePickupRate: new Prisma.Decimal(String(dto.onTimePickupRate)),
          }),
          ...(dto.onTimeDeliveryRate !== undefined && {
            onTimeDeliveryRate: new Prisma.Decimal(String(dto.onTimeDeliveryRate)),
          }),
          ...(dto.claimsRate !== undefined && {
            claimsRate: new Prisma.Decimal(String(dto.claimsRate)),
          }),
          ...(dto.avgRating !== undefined && {
            avgRating: new Prisma.Decimal(String(dto.avgRating)),
          }),
          ...(dto.acceptanceRate !== undefined && {
            acceptanceRate: new Prisma.Decimal(String(dto.acceptanceRate)),
          }),
          ...(dto.totalLoadsCompleted !== undefined && {
            totalLoadsCompleted: dto.totalLoadsCompleted,
          }),
          ...(dto.performanceScore !== undefined && {
            performanceScore: new Prisma.Decimal(String(dto.performanceScore)),
          }),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to update carrier: ${error.message}`
      );
    }
  }

  async deleteCarrier(tenantId: string, carrierId: string) {
    const _existing = await this.getCarrierById(tenantId, carrierId);

    await this.prisma.operationsCarrier.update({
      where: { id: carrierId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { success: true, message: 'Carrier deleted successfully' };
  }

  // ============================================================================
  // DRIVERS
  // ============================================================================

  async createDriver(
    tenantId: string,
    carrierId: string,
    dto: CreateOperationsCarrierDriverDto
  ) {
    const _carrier = await this.getCarrierById(tenantId, carrierId);

    try {
      return await this.prisma.operationsCarrierDriver.create({
        data: {
          carrierId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          nickname: dto.nickname,
          isOwner: dto.isOwner || false,
          phone: dto.phone,
          phoneSecondary: dto.phoneSecondary,
          email: dto.email,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zip: dto.zip,
          cdlNumber: dto.cdlNumber,
          cdlState: dto.cdlState,
          cdlClass: dto.cdlClass,
          cdlExpiry: dto.cdlExpiry ? new Date(dto.cdlExpiry) : null,
          cdlEndorsements: dto.cdlEndorsements,
          medicalCardExpiry: dto.medicalCardExpiry
            ? new Date(dto.medicalCardExpiry)
            : null,
          emergencyContactName: dto.emergencyContactName,
          emergencyContactPhone: dto.emergencyContactPhone,
          status: dto.status || 'ACTIVE',
          notes: dto.notes,
          isActive: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create driver: ${error.message}`
      );
    }
  }

  async listDrivers(tenantId: string, carrierId: string) {
    const _carrier = await this.getCarrierById(tenantId, carrierId);

    return this.prisma.operationsCarrierDriver.findMany({
      where: { carrierId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDriverById(tenantId: string, carrierId: string, driverId: string) {
    const driver = await this.prisma.operationsCarrierDriver.findUnique({
      where: { id: driverId },
      include: {
        carrier: true,
        trucks: true,
      },
    });

    if (!driver || driver.carrierId !== carrierId) {
      throw new NotFoundException('Driver not found');
    }

    const _carrier = await this.getCarrierById(tenantId, carrierId);

    return driver;
  }

  async updateDriver(
    tenantId: string,
    carrierId: string,
    driverId: string,
    dto: UpdateOperationsCarrierDriverDto
  ) {
    const _existing = await this.getDriverById(tenantId, carrierId, driverId);

    try {
      return await this.prisma.operationsCarrierDriver.update({
        where: { id: driverId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          nickname: dto.nickname,
          isOwner: dto.isOwner,
          phone: dto.phone,
          phoneSecondary: dto.phoneSecondary,
          email: dto.email,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zip: dto.zip,
          cdlNumber: dto.cdlNumber,
          cdlState: dto.cdlState,
          cdlClass: dto.cdlClass,
          cdlExpiry: dto.cdlExpiry ? new Date(dto.cdlExpiry) : null,
          cdlEndorsements: dto.cdlEndorsements,
          medicalCardExpiry: dto.medicalCardExpiry
            ? new Date(dto.medicalCardExpiry)
            : null,
          emergencyContactName: dto.emergencyContactName,
          emergencyContactPhone: dto.emergencyContactPhone,
          status: dto.status,
          notes: dto.notes,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to update driver: ${error.message}`
      );
    }
  }

  async deleteDriver(tenantId: string, carrierId: string, driverId: string) {
    const _existing = await this.getDriverById(tenantId, carrierId, driverId);

    await this.prisma.operationsCarrierDriver.update({
      where: { id: driverId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { success: true, message: 'Driver deleted successfully' };
  }

  // ============================================================================
  // TRUCKS
  // ============================================================================

  async createTruck(
    tenantId: string,
    carrierId: string,
    dto: CreateOperationsCarrierTruckDto
  ) {
    const _carrier = await this.getCarrierById(tenantId, carrierId);

    try {
      return await this.prisma.operationsCarrierTruck.create({
        data: {
          carrierId,
          unitNumber: dto.unitNumber,
          vin: dto.vin,
          licensePlate: dto.licensePlate,
          licensePlateState: dto.licensePlateState,
          year: dto.year,
          make: dto.make,
          model: dto.model,
          truckTypeId: dto.truckTypeId,
          category: dto.category,
          customTypeDescription: dto.customTypeDescription,
          deckLengthFt: dto.deckLengthFt
            ? new Prisma.Decimal(String(dto.deckLengthFt))
            : null,
          deckWidthFt: dto.deckWidthFt
            ? new Prisma.Decimal(String(dto.deckWidthFt))
            : null,
          deckHeightFt: dto.deckHeightFt
            ? new Prisma.Decimal(String(dto.deckHeightFt))
            : null,
          maxCargoWeightLbs: dto.maxCargoWeightLbs,
          axleCount: dto.axleCount,
          hasTarps: dto.hasTarps || false,
          hasChains: dto.hasChains || false,
          hasStraps: dto.hasStraps || false,
          coilRacks: dto.coilRacks || false,
          loadBars: dto.loadBars || false,
          ramps: dto.ramps || false,
          registrationExpiry: dto.registrationExpiry
            ? new Date(dto.registrationExpiry)
            : null,
          annualInspectionDate: dto.annualInspectionDate
            ? new Date(dto.annualInspectionDate)
            : null,
          status: dto.status || 'ACTIVE',
          assignedDriverId: dto.assignedDriverId,
          notes: dto.notes,
          isActive: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create truck: ${error.message}`
      );
    }
  }

  async listTrucks(tenantId: string, carrierId: string) {
    const _carrier = await this.getCarrierById(tenantId, carrierId);

    return this.prisma.operationsCarrierTruck.findMany({
      where: { carrierId, isActive: true },
      include: {
        assignedDriver: true,
        truckType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTruckById(tenantId: string, carrierId: string, truckId: string) {
    const truck = await this.prisma.operationsCarrierTruck.findUnique({
      where: { id: truckId },
      include: {
        carrier: true,
        assignedDriver: true,
        truckType: true,
      },
    });

    if (!truck || truck.carrierId !== carrierId) {
      throw new NotFoundException('Truck not found');
    }

    const _carrier = await this.getCarrierById(tenantId, carrierId);

    return truck;
  }

  async updateTruck(
    tenantId: string,
    carrierId: string,
    truckId: string,
    dto: UpdateOperationsCarrierTruckDto
  ) {
    const _existing = await this.getTruckById(tenantId, carrierId, truckId);

    try {
      return await this.prisma.operationsCarrierTruck.update({
        where: { id: truckId },
        data: {
          unitNumber: dto.unitNumber,
          vin: dto.vin,
          licensePlate: dto.licensePlate,
          licensePlateState: dto.licensePlateState,
          year: dto.year,
          make: dto.make,
          model: dto.model,
          truckTypeId: dto.truckTypeId,
          category: dto.category,
          customTypeDescription: dto.customTypeDescription,
          deckLengthFt: dto.deckLengthFt
            ? new Prisma.Decimal(String(dto.deckLengthFt))
            : null,
          deckWidthFt: dto.deckWidthFt
            ? new Prisma.Decimal(String(dto.deckWidthFt))
            : null,
          deckHeightFt: dto.deckHeightFt
            ? new Prisma.Decimal(String(dto.deckHeightFt))
            : null,
          maxCargoWeightLbs: dto.maxCargoWeightLbs,
          axleCount: dto.axleCount,
          hasTarps: dto.hasTarps,
          hasChains: dto.hasChains,
          hasStraps: dto.hasStraps,
          coilRacks: dto.coilRacks,
          loadBars: dto.loadBars,
          ramps: dto.ramps,
          registrationExpiry: dto.registrationExpiry
            ? new Date(dto.registrationExpiry)
            : null,
          annualInspectionDate: dto.annualInspectionDate
            ? new Date(dto.annualInspectionDate)
            : null,
          status: dto.status,
          assignedDriverId: dto.assignedDriverId,
          notes: dto.notes,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to update truck: ${error.message}`
      );
    }
  }

  async deleteTruck(tenantId: string, carrierId: string, truckId: string) {
    const _existing = await this.getTruckById(tenantId, carrierId, truckId);

    await this.prisma.operationsCarrierTruck.update({
      where: { id: truckId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { success: true, message: 'Truck deleted successfully' };
  }

  async assignDriverToTruck(
    tenantId: string,
    carrierId: string,
    truckId: string,
    driverId: string
  ) {
    // Verify both truck and driver exist and belong to carrier
    await this.getTruckById(tenantId, carrierId, truckId);
    await this.getDriverById(tenantId, carrierId, driverId);

    return this.prisma.operationsCarrierTruck.update({
      where: { id: truckId },
      data: {
        assignedDriverId: driverId,
      },
      include: {
        assignedDriver: true,
      },
    });
  }

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  async listDocuments(tenantId: string, carrierId: string) {
    await this.getCarrierById(tenantId, carrierId); // validates access

    return this.prisma.operationsCarrierDocument.findMany({
      where: { carrierId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDocument(
    tenantId: string,
    carrierId: string,
    dto: CreateOperationsCarrierDocumentDto,
  ) {
    await this.getCarrierById(tenantId, carrierId);

    try {
      return await this.prisma.operationsCarrierDocument.create({
        data: {
          carrierId,
          documentType: dto.documentType,
          name: dto.name,
          description: dto.description,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          status: 'PENDING',
          isActive: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to create document: ${error.message}`);
    }
  }

  async deleteDocument(tenantId: string, carrierId: string, documentId: string) {
    await this.getCarrierById(tenantId, carrierId);

    const doc = await this.prisma.operationsCarrierDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.carrierId !== carrierId) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.operationsCarrierDocument.update({
      where: { id: documentId },
      data: { isActive: false, deletedAt: new Date() },
    });

    return { success: true };
  }

  // ============================================================================
  // SCORECARD
  // ============================================================================

  async getCarrierScorecard(carrierId: string, tenantId: string) {
    const carrier = await this.prisma.operationsCarrier.findUnique({
      where: { id: carrierId, tenantId },
      select: {
        id: true,
        companyName: true,
        tier: true,
        onTimePickupRate: true,
        onTimeDeliveryRate: true,
        claimsRate: true,
        avgRating: true,
        acceptanceRate: true,
        totalLoadsCompleted: true,
        performanceScore: true,
        LoadHistory: {
          where: { status: { in: ['DELIVERED', 'COMPLETED'] } },
          orderBy: { deliveryDate: 'desc' },
          take: 50,
          select: {
            id: true,
            status: true,
            pickupDate: true,
            deliveryDate: true,
            carrierRateCents: true,
            ratePerMileCarrierCents: true,
            originCity: true,
            originState: true,
            destinationCity: true,
            destinationState: true,
            totalMiles: true,
          },
        },
      },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier ${carrierId} not found`);
    }

    return { carrier };
  }
}
