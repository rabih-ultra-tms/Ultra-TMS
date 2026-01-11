import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateRateTableDto } from './dto/create-rate-table.dto';
import { UpdateRateTableDto } from './dto/update-rate-table.dto';

@Injectable()
export class RateTablesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, contractId: string) {
    return this.prisma.contractRateTable.findMany({ where: { tenantId, contractId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  create(tenantId: string, contractId: string, userId: string, dto: CreateRateTableDto) {
    return this.prisma.contractRateTable.create({
      data: {
        tenantId,
        contractId,
        tableName: dto.tableName,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        isActive: dto.isActive ?? true,
        createdById: userId,
      },
    });
  }

  async detail(id: string, tenantId: string) {
    const rt = await this.prisma.contractRateTable.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!rt) throw new NotFoundException('Rate table not found');
    return rt;
  }

  async update(id: string, tenantId: string, dto: UpdateRateTableDto) {
    await this.detail(id, tenantId);
    return this.prisma.contractRateTable.update({ where: { id }, data: dto });
  }

  async delete(id: string, tenantId: string) {
    await this.detail(id, tenantId);
    await this.prisma.contractRateTable.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { success: true };
  }

  async importCsv(id: string, tenantId: string, rows: any[]) {
    await this.detail(id, tenantId);
    const errors: string[] = [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return { imported: 0, errors: ['No rows provided'] };
    }

    const prepared = rows.flatMap((row, idx) => {
      const originCity = row.originCity?.toString().trim();
      const originState = row.originState?.toString().trim();
      const destCity = row.destCity?.toString().trim();
      const destState = row.destState?.toString().trim();
      const equipmentType = row.equipmentType?.toString().trim();
      const rateAmount = Number(row.rateAmount);
      const rateType = row.rateType;

      if (!originCity || !originState || !destCity || !destState || !equipmentType || !rateType || Number.isNaN(rateAmount)) {
        errors.push(`Row ${idx + 1}: missing required fields`);
        return [];
      }

      return [
        {
          tenantId,
          rateTableId: id,
          originCity,
          originState,
          originZip: row.originZip?.toString().trim() || null,
          destCity,
          destState,
          destZip: row.destZip?.toString().trim() || null,
          equipmentType,
          rateType,
          rateAmount,
          currency: row.currency?.toString().trim() || 'USD',
          fuelSurchargeTableId: row.fuelSurchargeTableId?.toString().trim() || null,
        },
      ];
    });

    if (prepared.length) {
      await this.prisma.contractRateLane.createMany({ data: prepared });
    }

    return { imported: prepared.length, errors };
  }

  async exportCsv(id: string, tenantId: string, format?: string) {
    const lanes = await this.prisma.contractRateLane.findMany({ where: { rateTableId: id, tenantId, deletedAt: null } });
    const header = ['originCity', 'originState', 'originZip', 'destCity', 'destState', 'destZip', 'equipmentType', 'rateType', 'rateAmount', 'currency', 'fuelSurchargeTableId'];
    const csvRows = [header.join(',')].concat(
      lanes.map((l) =>
        [
          l.originCity,
          l.originState,
          l.originZip ?? '',
          l.destCity,
          l.destState,
          l.destZip ?? '',
          l.equipmentType,
          l.rateType,
          l.rateAmount,
          l.currency,
          l.fuelSurchargeTableId ?? '',
        ]
          .map((v) => `${v}`.replace(/"/g, '"'))
          .join(','),
      ),
    );

    if (format === 'raw') {
      return csvRows.join('\n');
    }

    return { rows: lanes.length, csv: csvRows.join('\n') };
  }
}
