import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCarrierContactDto, UpdateCarrierContactDto } from './dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, carrierId: string) {
    await this.ensureCarrier(tenantId, carrierId);
    return this.prisma.carrierContact.findMany({
      where: { tenantId, carrierId, deletedAt: null, isActive: true },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async create(tenantId: string, carrierId: string, dto: CreateCarrierContactDto) {
    await this.ensureCarrier(tenantId, carrierId);

    if (dto.isPrimary) {
      await this.clearPrimary(tenantId, carrierId);
    }

    const contact = await this.prisma.carrierContact.create({
      data: {
        tenantId,
        carrierId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        title: dto.title,
        role: dto.role,
        email: dto.email,
        phone: dto.phone || dto.mobilePhone,
        mobile: dto.mobilePhone,
        isPrimary: dto.isPrimary ?? false,
        receivesPayments: dto.isAccounting ?? false,
        receivesRateConfirms: dto.isDispatch ?? false,
        receivesPodRequests: false,
        isActive: true,
      },
    });

    return contact;
  }

  async update(tenantId: string, carrierId: string, contactId: string, dto: UpdateCarrierContactDto) {
    const contact = await this.prisma.carrierContact.findFirst({
      where: { id: contactId, carrierId, tenantId, deletedAt: null },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (dto.isPrimary) {
      await this.clearPrimary(tenantId, carrierId, contactId);
    }

    const updated = await this.prisma.carrierContact.update({
      where: { id: contactId },
      data: {
        firstName: dto.firstName ?? contact.firstName,
        lastName: dto.lastName ?? contact.lastName,
        title: dto.title ?? contact.title,
        role: dto.role ?? contact.role,
        email: dto.email ?? contact.email,
        phone: dto.phone ?? contact.phone,
        mobile: dto.mobilePhone ?? contact.mobile,
        isPrimary: dto.isPrimary ?? contact.isPrimary,
        receivesPayments: dto.isAccounting ?? contact.receivesPayments,
        receivesRateConfirms: dto.isDispatch ?? contact.receivesRateConfirms,
        receivesPodRequests: contact.receivesPodRequests,
      },
    });

    return updated;
  }

  async remove(tenantId: string, carrierId: string, contactId: string) {
    const contact = await this.prisma.carrierContact.findFirst({
      where: { id: contactId, carrierId, tenantId, deletedAt: null },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.isPrimary) {
      const otherActive = await this.prisma.carrierContact.count({
        where: { carrierId, tenantId, deletedAt: null, isActive: true, id: { not: contactId } },
      });
      if (otherActive === 0) {
        throw new BadRequestException('Cannot delete the only primary contact');
      }
    }

    await this.prisma.carrierContact.update({
      where: { id: contactId },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { success: true };
  }

  private async ensureCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) throw new NotFoundException('Carrier not found');
  }

  private async clearPrimary(tenantId: string, carrierId: string, exceptId?: string) {
    await this.prisma.carrierContact.updateMany({
      where: {
        tenantId,
        carrierId,
        deletedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { isPrimary: false },
    });
  }
}
