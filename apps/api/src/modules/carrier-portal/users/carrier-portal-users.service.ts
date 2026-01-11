import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, PortalUserStatus, $Enums } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { InviteCarrierPortalUserDto, UpdateCarrierPortalUserDto } from './dto/invite-carrier-portal-user.dto';
import { CarrierPortalUserRole } from './types';
import { randomBytes } from 'crypto';

@Injectable()
export class CarrierPortalUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.carrierPortalUser.findUnique({
      where: { id: userId },
      include: { carrier: true },
    });

    if (!user) {
      throw new NotFoundException('Carrier portal user not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; language?: string }) {
    const user = await this.prisma.carrierPortalUser.update({
      where: { id: userId },
      data,
    });

    return user;
  }

  async getCarrierInfo(carrierId: string) {
    const carrier = await this.prisma.carrier.findUnique({ where: { id: carrierId } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }
    return carrier;
  }

  async updateCarrierInfo(
    carrierId: string,
    data: Partial<{ legalName: string; dbaName: string; mcNumber: string; dotNumber: string; primaryContactPhone: string; dispatchPhone: string; addressLine1: string; city: string; state: string; postalCode: string }>,
  ) {
    return this.prisma.carrier.update({ where: { id: carrierId }, data });
  }

  async listUsers(carrierId: string) {
    return this.prisma.carrierPortalUser.findMany({ where: { carrierId, deletedAt: null } });
  }

  async inviteUser(tenantId: string, carrierId: string, currentUserRole: CarrierPortalUserRole, dto: InviteCarrierPortalUserDto) {
    if (currentUserRole !== CarrierPortalUserRole.ADMIN) {
      throw new ForbiddenException('Only admins can invite users');
    }

    const token = randomBytes(12).toString('hex');

    return this.prisma.carrierPortalUser.create({
      data: {
        carrierId,
        tenantId,
        email: dto.email,
        password: token,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as $Enums.CarrierPortalUserRole,
        status: PortalUserStatus.PENDING,
        verificationToken: token,
        customFields: dto.permissions
          ? ({ permissions: dto.permissions } as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  }

  async updateUser(carrierId: string, userId: string, currentUserRole: CarrierPortalUserRole, dto: UpdateCarrierPortalUserDto) {
    if (currentUserRole !== CarrierPortalUserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update users');
    }

    const user = await this.prisma.carrierPortalUser.findUnique({ where: { id: userId } });
    if (!user || user.carrierId !== carrierId) {
      throw new NotFoundException('User not found');
    }

    const customFields = { ...(user.customFields as any) };
    if (dto.permissions) {
      customFields.permissions = dto.permissions;
    }

    return this.prisma.carrierPortalUser.update({
      where: { id: userId },
      data: {
        role: (dto.role as $Enums.CarrierPortalUserRole | undefined) ?? user.role,
        firstName: dto.firstName ?? user.firstName,
        lastName: dto.lastName ?? user.lastName,
        customFields: (customFields as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async deactivateUser(carrierId: string, userId: string, currentUserRole: CarrierPortalUserRole) {
    if (currentUserRole !== CarrierPortalUserRole.ADMIN) {
      throw new ForbiddenException('Only admins can deactivate users');
    }

    const user = await this.prisma.carrierPortalUser.findUnique({ where: { id: userId } });
    if (!user || user.carrierId !== carrierId) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.carrierPortalUser.update({
      where: { id: userId },
      data: { status: PortalUserStatus.DEACTIVATED, deletedAt: new Date() },
    });
  }
}