import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class TaskProcessor {
  constructor(private readonly prisma: PrismaService) {}

  async process(taskId: string) {
    return this.prisma.scheduledTask.update({
      where: { id: taskId },
      data: { status: TaskStatus.COMPLETED, processedAt: new Date(), completedAt: new Date() },
    });
  }
}
