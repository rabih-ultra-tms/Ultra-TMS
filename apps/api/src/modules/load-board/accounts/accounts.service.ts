import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { AccountQueryDto, CreateAccountDto, UpdateAccountDto } from './dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: AccountQueryDto) {
    const { providerId, isActive, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (providerId) {
      where.providerId = providerId;
    }
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.loadBoardAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { provider: true },
      }),
      this.prisma.loadBoardAccount.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const account = await this.prisma.loadBoardAccount.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { provider: true },
    });

    if (!account) {
      throw new NotFoundException('Load board account not found');
    }

    return account;
  }

  async create(tenantId: string, userId: string, dto: CreateAccountDto) {
    const provider = await this.prisma.loadBoardProvider.findFirst({
      where: { id: dto.providerId, tenantId, deletedAt: null },
    });

    if (!provider) {
      throw new NotFoundException('Load board provider not found');
    }

    const customFields = {
      credentials: dto.credentials || {},
      companyName: dto.companyName,
      contactPhone: dto.contactPhone,
      mcNumber: dto.mcNumber,
      dotNumber: dto.dotNumber,
      autoPostDelayMinutes: dto.autoPostDelayMinutes,
      defaultAccounts: dto.defaultAccounts,
    };

    return this.prisma.loadBoardAccount.create({
      data: {
        tenantId,
        providerId: dto.providerId,
        accountName: dto.accountName,
        accountUsername: dto.username,
        accountApiKey: dto.credentials?.apiKey,
        accountPassword: dto.credentials?.password,
        isActive: dto.autoPostEnabled ?? true,
        customFields,
        createdById: userId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.assertAccount(tenantId, id);

    const customFields = {
      ...(account.customFields as Record<string, unknown>),
      ...(dto.credentials ? { credentials: dto.credentials } : {}),
      ...(dto.mcNumber ? { mcNumber: dto.mcNumber } : {}),
      ...(dto.dotNumber ? { dotNumber: dto.dotNumber } : {}),
      ...(dto.connectionStatus ? { connectionStatus: dto.connectionStatus } : {}),
    };

    return this.prisma.loadBoardAccount.update({
      where: { id },
      data: {
        accountName: dto.accountName,
        accountUsername: dto.username,
        accountApiKey: dto.credentials?.apiKey,
        accountPassword: dto.credentials?.password,
        isActive: dto.isActive,
        customFields,
        lastVerifiedAt: dto.connectionStatus === 'CONNECTED' ? new Date() : account.lastVerifiedAt,
        isVerified: dto.connectionStatus === 'CONNECTED' ? true : account.isVerified,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.assertAccount(tenantId, id);

    await this.prisma.loadBoardAccount.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { success: true };
  }

  async testConnection(tenantId: string, id: string) {
    const account = await this.assertAccount(tenantId, id);

    await this.prisma.loadBoardAccount.update({
      where: { id },
      data: {
        isVerified: true,
        lastVerifiedAt: new Date(),
        customFields: {
          ...(account.customFields as Record<string, unknown>),
          connectionStatus: 'CONNECTED',
        },
      },
    });

    return { success: true, message: 'Connection verified' };
  }

  private async assertAccount(tenantId: string, id: string) {
    const account = await this.prisma.loadBoardAccount.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!account) {
      throw new NotFoundException('Load board account not found');
    }
    return account;
  }
}
