import { Injectable, Logger } from '@nestjs/common';
import { RateProvider } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { RateLookupDto } from '../lookup/dto/rate-lookup.dto';
import { DatProvider } from './dat.provider';
import { GreenscreensProvider } from './greenscreens.provider';
import { TruckstopProvider } from './truckstop.provider';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dat: DatProvider,
    private readonly truckstop: TruckstopProvider,
    private readonly greenscreens: GreenscreensProvider,
  ) {}

  async list(tenantId: string) {
    return this.prisma.rateProviderConfig.findMany({ where: { tenantId, deletedAt: null } });
  }

  async create(tenantId: string, userId: string, dto: any) {
    return this.prisma.rateProviderConfig.create({
      data: {
        tenantId,
        provider: dto.provider as RateProvider,
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        username: dto.username,
        isActive: dto.isActive ?? true,
        rateLimitPerHour: dto.rateLimitPerHour,
        cacheDurationMins: dto.cacheDurationMins ?? 60,
        queriesThisMonth: 0,
        createdById: userId,
        customFields: dto.customFields ?? {},
      },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.ensureConfig(tenantId, id);
    return this.prisma.rateProviderConfig.update({ where: { id }, data: dto });
  }

  async test(tenantId: string, id: string) {
    const config = await this.ensureConfig(tenantId, id);
    const lane: RateLookupDto = {
      originState: 'TX',
      destState: 'CA',
      equipmentType: 'VAN',
    };
    const result = await this.query(config.provider, tenantId, lane);
    await this.prisma.rateProviderConfig.update({ where: { id }, data: { lastQueryAt: new Date() } });
    return result;
  }

  async query(provider: string, tenantId: string, lane: RateLookupDto) {
    switch (provider.toUpperCase()) {
      case 'DAT':
        return this.dat.query(tenantId, lane);
      case 'TRUCKSTOP':
        return this.truckstop.query(tenantId, lane);
      case 'GREENSCREENS':
      case 'GREENS':
      case 'INTERNAL':
        return this.greenscreens.query(tenantId, lane);
      default:
        this.logger.warn(`Unsupported rate provider ${provider}`);
        throw new Error('Unsupported provider');
    }
  }

  private async ensureConfig(tenantId: string, id: string) {
    const config = await this.prisma.rateProviderConfig.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!config) {
      throw new Error('Provider config not found');
    }
    return config;
  }
}
