import { Injectable } from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateHolidayDto, DayHoursDto, UpdateBusinessHoursDto } from '../dto';

@Injectable()
export class BusinessHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async getHours(tenantId: string) {
    return this.prisma.businessHours.findMany({ where: { tenantId }, orderBy: { dayOfWeek: 'asc' } });
  }

  async updateHours(tenantId: string, dto: UpdateBusinessHoursDto) {
    const timezone = dto.timezone ?? 'America/Chicago';
    const rows = dto.days.map(day => ({
      tenantId,
      dayOfWeek: this.toDayEnum(day),
      openTime: day.openTime ?? '00:00',
      closeTime: day.closeTime ?? '00:00',
      isClosed: day.isClosed ?? false,
      timezone,
    }));

    await this.prisma.$transaction([
      this.prisma.businessHours.deleteMany({ where: { tenantId } }),
      this.prisma.businessHours.createMany({ data: rows }),
    ]);

    return this.getHours(tenantId);
  }

  async listHolidays(tenantId: string) {
    return this.prisma.holiday.findMany({ where: { tenantId }, orderBy: { holidayDate: 'asc' } });
  }

  async addHoliday(tenantId: string, dto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        tenantId,
        holidayName: dto.name,
        holidayDate: new Date(dto.date),
        isRecurring: dto.isRecurring ?? false,
        countryCode: dto.countryCode,
      },
    });
  }

  private toDayEnum(day: DayHoursDto): DayOfWeek {
    const mapping: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    const index = day.dayOfWeek ?? 0;
    return mapping[index] ?? DayOfWeek.SUNDAY;
  }
}
