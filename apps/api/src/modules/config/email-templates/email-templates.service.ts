import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UpdateEmailTemplateDto } from '../dto';

@Injectable()
export class EmailTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.communicationTemplate.findMany({
      where: {
        channel: 'EMAIL',
        OR: [{ tenantId }, { isSystem: true }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.communicationTemplate.findFirst({
      where: {
        id,
        channel: 'EMAIL',
        OR: [{ tenantId }, { isSystem: true }],
      },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async update(tenantId: string, id: string, dto: UpdateEmailTemplateDto, userId?: string | null) {
    const template = await this.findOne(tenantId, id);

    const status = dto.isActive === undefined ? undefined : dto.isActive ? 'ACTIVE' : 'INACTIVE';

    return this.prisma.communicationTemplate.update({
      where: { id: template.id },
      data: {
        subjectEn: dto.subject,
        bodyEn: dto.body,
        subjectEs: dto.subjectEs,
        bodyEs: dto.bodyEs,
        fromName: dto.fromName,
        fromEmail: dto.fromEmail,
        replyTo: dto.replyTo,
        status,
        updatedById: userId ?? undefined,
      },
    });
  }
}
