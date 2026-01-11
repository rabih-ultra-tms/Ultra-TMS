import { Injectable, NotFoundException } from '@nestjs/common';
import { PortalUserRole, PortalUserStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { InvitePortalUserDto, UpdatePortalUserDto } from './dto/invite-portal-user.dto';

@Injectable()
export class PortalUsersService {
  constructor(private readonly prisma: PrismaService) {}

  profile(portalUserId: string) {
    return this.prisma.portalUser.findUnique({ where: { id: portalUserId } });
  }

  async updateProfile(portalUserId: string, data: Partial<{ firstName: string; lastName: string; phone: string; language: string }>) {
    return this.prisma.portalUser.update({ where: { id: portalUserId }, data });
  }

  list(tenantId: string, companyId: string) {
    return this.prisma.portalUser.findMany({ where: { tenantId, companyId, deletedAt: null } });
  }

  async invite(tenantId: string, companyId: string, invitedBy: string, dto: InvitePortalUserDto) {
    const token = randomBytes(12).toString('hex');
    const user = await this.prisma.portalUser.create({
      data: {
        tenantId,
        companyId,
        email: dto.email,
        password: token,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? PortalUserRole.USER,
        status: PortalUserStatus.PENDING,
        verificationToken: token,
        customFields: dto.permissions ? { permissions: dto.permissions } : {},
        createdById: invitedBy,
      },
    });

    return { ...user, invitationToken: token };
  }

  async updateUser(tenantId: string, companyId: string, id: string, dto: UpdatePortalUserDto) {
    const user = await this.prisma.portalUser.findFirst({ where: { id, tenantId, companyId, deletedAt: null } });
    if (!user) {
      throw new NotFoundException('Portal user not found');
    }

    const customFields = { ...(user.customFields as any) };
    if (dto.permissions) {
      customFields.permissions = dto.permissions;
    }

    return this.prisma.portalUser.update({
      where: { id },
      data: {
        role: dto.role ?? user.role,
        firstName: dto.firstName ?? user.firstName,
        lastName: dto.lastName ?? user.lastName,
        customFields,
      },
    });
  }

  async deactivate(tenantId: string, companyId: string, id: string) {
    const user = await this.prisma.portalUser.findFirst({ where: { id, tenantId, companyId, deletedAt: null } });
    if (!user) {
      throw new NotFoundException('Portal user not found');
    }

    return this.prisma.portalUser.update({
      where: { id },
      data: { status: PortalUserStatus.DEACTIVATED, deletedAt: new Date() },
    });
  }
}