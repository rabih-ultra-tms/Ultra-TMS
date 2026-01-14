import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class VotingService {
  constructor(private readonly prisma: PrismaService) {}

  async vote(requestId: string, userId: string, voterEmail?: string) {
    const existing = await this.prisma.featureRequestVote.findUnique({
      where: { requestId_userId: { requestId, userId } },
    });

    if (existing) {
      throw new ConflictException('Already voted');
    }

    const [, updated] = await this.prisma.$transaction([
      this.prisma.featureRequestVote.create({ data: { requestId, userId, voterEmail } }),
      this.prisma.featureRequest.update({ where: { id: requestId }, data: { voteCount: { increment: 1 } } }),
    ]);

    return updated;
  }

  async unvote(requestId: string, userId: string) {
    const deleted = await this.prisma.featureRequestVote.deleteMany({ where: { requestId, userId } });
    if (deleted.count > 0) {
      await this.prisma.featureRequest.update({ where: { id: requestId }, data: { voteCount: { decrement: 1 } } });
    }
  }
}
