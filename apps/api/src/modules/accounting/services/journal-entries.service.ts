import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateJournalEntryDto } from '../dto';

@Injectable()
export class JournalEntriesService {
  constructor(private prisma: PrismaService) {}

  private async generateEntryNumber(tenantId: string): Promise<string> {
    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { entryNumber: true },
    });

    if (!lastEntry) {
      return 'JE-000001';
    }

    const lastNumber = parseInt(lastEntry.entryNumber.replace('JE-', ''), 10);
    return `JE-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, data: CreateJournalEntryDto) {
    // Validate that debits = credits
    if (Math.abs(data.totalDebit - data.totalCredit) > 0.01) {
      throw new BadRequestException('Journal entry must balance (debits must equal credits)');
    }

    const entryNumber = await this.generateEntryNumber(tenantId);

    return this.prisma.journalEntry.create({
      data: {
        tenantId,
        entryNumber,
        entryDate: new Date(data.entryDate),
        description: data.description,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        status: data.status ?? 'DRAFT',
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
        createdById: userId,
        lines: {
          create: data.lines.map((line) => ({
            lineNumber: line.lineNumber,
            accountId: line.accountId,
            description: line.description,
            debitAmount: line.debitAmount ?? 0,
            creditAmount: line.creditAmount ?? 0,
            customerId: line.customerId,
            carrierId: line.carrierId,
            loadId: line.loadId,
          })),
        },
      },
      include: {
        lines: {
          orderBy: { lineNumber: 'asc' },
          include: {
            account: { select: { id: true, accountNumber: true, accountName: true } },
          },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: string;
      referenceType?: string;
      fromDate?: Date;
      toDate?: Date;
      skip?: number;
      take?: number;
    },
  ) {
    const where = {
      tenantId,
      ...(options?.status && { status: options.status }),
      ...(options?.referenceType && { referenceType: options.referenceType }),
      ...(options?.fromDate &&
        options?.toDate && {
          entryDate: { gte: options.fromDate, lte: options.toDate },
        }),
    };

    const [entries, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: {
          lines: {
            take: 3,
            orderBy: { lineNumber: 'asc' },
          },
        },
        orderBy: { entryDate: 'desc' },
        skip: options?.skip,
        take: options?.take,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return { entries, total };
  }

  async findOne(id: string, tenantId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: {
        lines: {
          orderBy: { lineNumber: 'asc' },
          include: {
            account: { select: { id: true, accountNumber: true, accountName: true } },
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return entry;
  }

  async update(id: string, tenantId: string, data: Partial<CreateJournalEntryDto>) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    if (entry.status === 'POSTED') {
      throw new BadRequestException('Cannot update a posted journal entry');
    }

    // If updating amounts, validate balance
    if (data.totalDebit !== undefined && data.totalCredit !== undefined) {
      if (Math.abs(data.totalDebit - data.totalCredit) > 0.01) {
        throw new BadRequestException('Journal entry must balance');
      }
    }

    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
        description: data.description,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
      },
      include: {
        lines: {
          orderBy: { lineNumber: 'asc' },
          include: {
            account: { select: { id: true, accountNumber: true, accountName: true } },
          },
        },
      },
    });
  }

  async post(id: string, tenantId: string, userId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: { lines: true },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    if (entry.status === 'POSTED') {
      throw new BadRequestException('Journal entry is already posted');
    }

    // Update account balances in a transaction
    return this.prisma.$transaction(async (tx) => {
      for (const line of entry.lines) {
        const account = await tx.chartOfAccount.findUnique({
          where: { id: line.accountId },
        });

        if (!account) continue;

        const debit = Number(line.debitAmount);
        const credit = Number(line.creditAmount);
        const currentBalance = Number(account.balance);

        // Adjust balance based on normal balance
        let adjustment: number;
        if (account.normalBalance === 'DEBIT') {
          adjustment = debit - credit;
        } else {
          adjustment = credit - debit;
        }

        await tx.chartOfAccount.update({
          where: { id: line.accountId },
          data: { balance: currentBalance + adjustment },
        });
      }

      return tx.journalEntry.update({
        where: { id },
        data: {
          status: 'POSTED',
          postedById: userId,
          postedAt: new Date(),
        },
        include: {
          lines: {
            orderBy: { lineNumber: 'asc' },
            include: {
              account: { select: { id: true, accountNumber: true, accountName: true } },
            },
          },
        },
      });
    });
  }

  async void(id: string, tenantId: string, _userId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: { lines: true },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    if (entry.status === 'VOID') {
      throw new BadRequestException('Journal entry is already void');
    }

    // If posted, reverse the account balances
    if (entry.status === 'POSTED') {
      return this.prisma.$transaction(async (tx) => {
        for (const line of entry.lines) {
          const account = await tx.chartOfAccount.findUnique({
            where: { id: line.accountId },
          });

          if (!account) continue;

          const debit = Number(line.debitAmount);
          const credit = Number(line.creditAmount);
          const currentBalance = Number(account.balance);

          // Reverse the original adjustment
          let adjustment: number;
          if (account.normalBalance === 'DEBIT') {
            adjustment = credit - debit; // opposite of post
          } else {
            adjustment = debit - credit; // opposite of post
          }

          await tx.chartOfAccount.update({
            where: { id: line.accountId },
            data: { balance: currentBalance + adjustment },
          });
        }

        return tx.journalEntry.update({
          where: { id },
          data: { status: 'VOID' },
        });
      });
    }

    // If draft, just void it
    return this.prisma.journalEntry.update({
      where: { id },
      data: { status: 'VOID' },
    });
  }

  async getAccountLedger(
    tenantId: string,
    accountId: string,
    options?: { fromDate?: Date; toDate?: Date },
  ) {
    const account = await this.prisma.chartOfAccount.findFirst({
      where: { id: accountId, tenantId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const lines = await this.prisma.journalEntryLine.findMany({
      where: {
        accountId,
        journalEntry: {
          tenantId,
          status: 'POSTED',
          ...(options?.fromDate &&
            options?.toDate && {
              entryDate: { gte: options.fromDate, lte: options.toDate },
            }),
        },
      },
      include: {
        journalEntry: {
          select: {
            id: true,
            entryNumber: true,
            entryDate: true,
            description: true,
            referenceType: true,
            referenceId: true,
          },
        },
      },
      orderBy: { journalEntry: { entryDate: 'asc' } },
    });

    return {
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType,
        normalBalance: account.normalBalance,
        currentBalance: account.balance,
      },
      transactions: lines,
    };
  }
}
