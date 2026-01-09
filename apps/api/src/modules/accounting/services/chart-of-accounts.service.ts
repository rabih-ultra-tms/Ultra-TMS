import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateChartOfAccountDto } from '../dto';

@Injectable()
export class ChartOfAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreateChartOfAccountDto) {
    return this.prisma.chartOfAccount.create({
      data: {
        tenantId,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        accountType: data.accountType,
        accountSubType: data.accountSubType,
        parentAccountId: data.parentAccountId,
        description: data.description,
        normalBalance: data.normalBalance,
        isActive: data.isActive ?? true,
        isSystemAccount: data.isSystemAccount ?? false,
        balance: data.balance ?? 0,
        quickbooksId: data.quickbooksId,
      },
    });
  }

  async findAll(tenantId: string, options?: { type?: string; active?: boolean }) {
    return this.prisma.chartOfAccount.findMany({
      where: {
        tenantId,
        ...(options?.type && { accountType: options.type }),
        ...(options?.active !== undefined && { isActive: options.active }),
      },
      include: {
        parentAccount: {
          select: { id: true, accountNumber: true, accountName: true },
        },
        childAccounts: {
          select: { id: true, accountNumber: true, accountName: true },
        },
      },
      orderBy: { accountNumber: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.chartOfAccount.findFirst({
      where: { id, tenantId },
      include: {
        parentAccount: true,
        childAccounts: true,
      },
    });
  }

  async update(id: string, tenantId: string, data: Partial<CreateChartOfAccountDto>) {
    return this.prisma.chartOfAccount.updateMany({
      where: { id, tenantId },
      data: {
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        accountType: data.accountType,
        accountSubType: data.accountSubType,
        parentAccountId: data.parentAccountId,
        description: data.description,
        normalBalance: data.normalBalance,
        isActive: data.isActive,
        quickbooksId: data.quickbooksId,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.chartOfAccount.deleteMany({
      where: { id, tenantId, isSystemAccount: false },
    });
  }

  async getTrialBalance(tenantId: string, asOfDate?: Date) {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        accountNumber: true,
        accountName: true,
        accountType: true,
        normalBalance: true,
        balance: true,
      },
      orderBy: { accountNumber: 'asc' },
    });

    // Calculate totals
    let totalDebits = 0;
    let totalCredits = 0;

    accounts.forEach((account) => {
      const balance = Number(account.balance);
      if (account.normalBalance === 'DEBIT') {
        totalDebits += balance;
      } else {
        totalCredits += balance;
      }
    });

    return {
      asOfDate: asOfDate || new Date(),
      accounts,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  }
}
