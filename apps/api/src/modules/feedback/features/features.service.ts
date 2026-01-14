import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import {
  AddFeatureCommentDto,
  SubmitFeatureRequestDto,
  UpdateFeatureRequestDto,
} from '../dto/feedback.dto';
import { VotingService } from './voting.service';

@Injectable()
export class FeaturesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voting: VotingService,
    private readonly events: EventEmitter2,
  ) {}

  async list(tenantId: string) {
    return this.prisma.featureRequest.findMany({
      where: { tenantId },
      orderBy: { voteCount: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const request = await this.prisma.featureRequest.findFirst({
      where: { id, tenantId },
    });
    if (!request) throw new NotFoundException('Feature request not found');
    return request;
  }

  async submit(tenantId: string, userId: string | null, userEmail: string | null, dto: SubmitFeatureRequestDto) {
    const request = await this.prisma.featureRequest.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        submitterId: userId ?? undefined,
        submitterName: dto.submitterName,
        submitterEmail: dto.submitterEmail ?? userEmail ?? undefined,
        status: 'SUBMITTED',
        voteCount: 0,
      },
    });

    this.events.emit('feature.submitted', { requestId: request.id });
    return request;
  }

  async update(tenantId: string, id: string, dto: UpdateFeatureRequestDto) {
    await this.findOne(tenantId, id);
    return this.prisma.featureRequest.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        implementedAt: dto.implementedAt ? new Date(dto.implementedAt) : undefined,
        releaseNotes: dto.releaseNotes,
      },
    });
  }

  async vote(tenantId: string, id: string, userId: string, voterEmail?: string) {
    await this.findOne(tenantId, id);
    const updated = await this.voting.vote(id, userId, voterEmail);
    this.events.emit('feature.voted', { requestId: id, voteCount: updated.voteCount });
    return updated;
  }

  async addComment(tenantId: string, id: string, userId: string | null, dto: AddFeatureCommentDto) {
    await this.findOne(tenantId, id);
    const comment = await this.prisma.featureRequestComment.create({
      data: {
        requestId: id,
        authorType: 'ADMIN',
        authorUserId: userId ?? undefined,
        authorName: dto.authorName ?? 'System',
        content: dto.content,
        isOfficial: dto.isOfficial ?? false,
      },
    });
    return comment;
  }
}
