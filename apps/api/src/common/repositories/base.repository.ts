import { PrismaService } from '../../prisma.service';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: keyof PrismaService,
  ) {}

  async findAll(where: Record<string, unknown> = {}): Promise<T[]> {
    return (this.prisma[this.modelName] as any).findMany({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  async findOne(where: Record<string, unknown>): Promise<T | null> {
    return (this.prisma[this.modelName] as any).findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  async findById(id: string): Promise<T | null> {
    return (this.prisma[this.modelName] as any).findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async softDelete(id: string): Promise<T> {
    return (this.prisma[this.modelName] as any).update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<T> {
    return (this.prisma[this.modelName] as any).update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<T> {
    return (this.prisma[this.modelName] as any).delete({
      where: { id },
    });
  }

  async findAllWithDeleted(where: Record<string, unknown> = {}): Promise<T[]> {
    return (this.prisma[this.modelName] as any).findMany({
      where,
    });
  }
}
