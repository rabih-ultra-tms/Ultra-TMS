import { Injectable, Logger } from '@nestjs/common';
import { RateProvider } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { EncryptionService } from '../../integration-hub/services/encryption.service';
import { RateLookupDto } from '../lookup/dto/rate-lookup.dto';
import { DatProvider } from './dat.provider';
import { GreenscreensProvider } from './greenscreens.provider';
import { TruckstopProvider } from './truckstop.provider';

/** Fields safe to return in API responses (excludes apiKey, apiSecret, password). */
const safeSelect = {
  id: true,
  tenantId: true,
  provider: true,
  apiEndpoint: true,
  username: true,
  isActive: true,
  rateLimitPerHour: true,
  cacheDurationMins: true,
  queriesThisMonth: true,
  lastQueryAt: true,
  externalId: true,
  sourceSystem: true,
  customFields: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  createdById: true,
  updatedById: true,
} as const;

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly dat: DatProvider,
    private readonly truckstop: TruckstopProvider,
    private readonly greenscreens: GreenscreensProvider,
  ) {}

  async list(tenantId: string) {
    return this.prisma.rateProviderConfig.findMany({
      where: { tenantId, deletedAt: null },
      select: safeSelect,
    });
  }

  async create(tenantId: string, userId: string, dto: any) {
    const config = await this.prisma.rateProviderConfig.create({
      data: {
        tenantId,
        provider: dto.provider as RateProvider,
        apiKey: dto.apiKey ? this.encryptionService.encrypt(dto.apiKey) : undefined,
        apiSecret: dto.apiSecret ? this.encryptionService.encrypt(dto.apiSecret) : undefined,
        apiEndpoint: dto.apiEndpoint,
        username: dto.username,
        password: dto.password ? this.encryptionService.encrypt(dto.password) : undefined,
        isActive: dto.isActive ?? true,
        rateLimitPerHour: dto.rateLimitPerHour,
        cacheDurationMins: dto.cacheDurationMins ?? 60,
        queriesThisMonth: 0,
        createdById: userId,
        customFields: dto.customFields ?? {},
      },
      select: safeSelect,
    });
    return this.stripSensitive(config);
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.ensureConfig(tenantId, id);

    const data = { ...dto };
    if (data.apiKey) data.apiKey = this.encryptionService.encrypt(data.apiKey);
    if (data.apiSecret) data.apiSecret = this.encryptionService.encrypt(data.apiSecret);
    if (data.password) data.password = this.encryptionService.encrypt(data.password);

    return this.prisma.rateProviderConfig.update({
      where: { id },
      data,
      select: safeSelect,
    });
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

  private stripSensitive<T extends Record<string, any>>(obj: T): Omit<T, 'apiKey' | 'apiSecret' | 'password'> {
    const { apiKey: _k, apiSecret: _s, password: _p, ...rest } = obj;
    return rest as any;
  }

  private async ensureConfig(tenantId: string, id: string) {
    const config = await this.prisma.rateProviderConfig.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!config) {
      throw new Error('Provider config not found');
    }
    return config;
  }
}
