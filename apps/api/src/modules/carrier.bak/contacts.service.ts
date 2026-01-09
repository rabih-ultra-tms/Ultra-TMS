import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateCarrierContactDto,
  UpdateCarrierContactDto,
} from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, carrierId: string) {
    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    const contacts = await this.prisma.carrierContact.findMany({
      where: { carrierId, tenantId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });

    return contacts;
  }

  async findOne(tenantId: string, carrierId: string, id: string) {
    const contact = await this.prisma.carrierContact.findFirst({
      where: { id, carrierId, tenantId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async create(
    tenantId: string,
    carrierId: string,
    dto: CreateCarrierContactDto
  ) {
    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    // If this is set as primary, unset other primary contacts
    if (dto.isPrimary) {
      await this.prisma.carrierContact.updateMany({
        where: { carrierId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.carrierContact.create({
      data: {
        ...dto,
        tenantId,
        carrierId,
      },
    });

    return contact;
  }

  async update(
    tenantId: string,
    carrierId: string,
    id: string,
    dto: UpdateCarrierContactDto
  ) {
    const contact = await this.findOne(tenantId, carrierId, id);

    // If setting as primary, unset other primary contacts
    if (dto.isPrimary) {
      await this.prisma.carrierContact.updateMany({
        where: { carrierId, isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const updated = await this.prisma.carrierContact.update({
      where: { id: contact.id },
      data: dto,
    });

    return updated;
  }

  async delete(tenantId: string, carrierId: string, id: string) {
    const contact = await this.findOne(tenantId, carrierId, id);

    await this.prisma.carrierContact.delete({
      where: { id: contact.id },
    });

    return { success: true, message: 'Contact deleted successfully' };
  }
}
