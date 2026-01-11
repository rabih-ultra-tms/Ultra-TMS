import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateClaimNoteDto } from './dto/create-claim-note.dto';
import { UpdateClaimNoteDto } from './dto/update-claim-note.dto';

@Injectable()
export class ClaimNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, claimId: string) {
    await this.ensureClaim(tenantId, claimId);

    return this.prisma.claimNote.findMany({
      where: { tenantId, claimId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, claimId: string, noteId: string) {
    await this.ensureClaim(tenantId, claimId);

    const note = await this.prisma.claimNote.findFirst({
      where: { id: noteId, claimId, tenantId, deletedAt: null },
    });

    if (!note) {
      throw new NotFoundException('Claim note not found');
    }

    return note;
  }

  async add(tenantId: string, userId: string, claimId: string, dto: CreateClaimNoteDto) {
    await this.ensureClaim(tenantId, claimId);

    const note = await this.prisma.claimNote.create({
      data: {
        tenantId,
        claimId,
        note: dto.note,
        noteType: dto.noteType,
        isInternal: dto.isInternal ?? false,
        createdById: userId,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'NOTE_ADDED',
      'Note added to claim',
      {
        noteId: note.id,
        noteType: note.noteType,
        isInternal: note.isInternal,
      },
      userId,
    );

    return note;
  }

  async update(
    tenantId: string,
    userId: string,
    claimId: string,
    noteId: string,
    dto: UpdateClaimNoteDto,
  ) {
    await this.findOne(tenantId, claimId, noteId);

    const data: Prisma.ClaimNoteUpdateInput = {
      ...(dto.note !== undefined ? { note: dto.note } : {}),
      ...(dto.noteType !== undefined ? { noteType: dto.noteType } : {}),
      ...(dto.isInternal !== undefined ? { isInternal: dto.isInternal } : {}),
      updatedById: userId,
    };

    const updated = await this.prisma.claimNote.update({
      where: { id: noteId },
      data,
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'NOTE_UPDATED',
      'Note updated',
      {
        noteId,
        updatedFields: Object.keys(data),
      },
      userId,
    );

    return updated;
  }

  async remove(tenantId: string, userId: string, claimId: string, noteId: string) {
    await this.findOne(tenantId, claimId, noteId);

    await this.prisma.claimNote.update({
      where: { id: noteId },
      data: {
        deletedAt: new Date(),
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'NOTE_REMOVED',
      'Note removed',
      { noteId },
      userId,
    );

    return { success: true };
  }

  private async ensureClaim(tenantId: string, claimId: string) {
    const exists = await this.prisma.claim.count({ where: { id: claimId, tenantId, deletedAt: null } });
    if (exists === 0) {
      throw new NotFoundException('Claim not found');
    }
  }

  private async recordTimeline(
    tenantId: string,
    claimId: string,
    eventType: string,
    description?: string,
    eventData?: Prisma.InputJsonValue,
    userId?: string,
  ) {
    await this.prisma.claimTimeline.create({
      data: {
        tenantId,
        claimId,
        eventType,
        description,
        eventData,
        createdById: userId,
        updatedById: userId,
      },
    });
  }
}
