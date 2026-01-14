import { Injectable } from '@nestjs/common';
import { FeatureFlag, SystemConfig } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ConfigCacheService {
  private readonly defaultTtlSeconds = 300;

  constructor(private readonly redis: RedisService) {}

  async getSystemList() {
    return this.redis.getJson<SystemConfig[]>(this.key('system', 'list'));
  }

  async setSystemList(configs: SystemConfig[]) {
    await this.redis.setJson(this.key('system', 'list'), configs, this.defaultTtlSeconds);
  }

  async getSystem(key: string) {
    return this.redis.getJson<SystemConfig>(this.key('system', key));
  }

  async setSystem(key: string, value: SystemConfig) {
    await this.redis.setJson(this.key('system', key), value, this.defaultTtlSeconds);
  }

  async invalidateSystem(key?: string) {
    const keys = [this.key('system', 'list')];
    if (key) keys.push(this.key('system', key));
    await this.redis.deleteKeys(keys);
  }

  async getTenantList<T = unknown>(tenantId: string) {
    return this.redis.getJson<T[]>(this.key('tenant', tenantId, 'list'));
  }

  async setTenantList<T = unknown>(tenantId: string, configs: T[]) {
    await this.redis.setJson(this.key('tenant', tenantId, 'list'), configs, this.defaultTtlSeconds);
  }

  async getTenant<T = unknown>(tenantId: string, key: string) {
    return this.redis.getJson<T>(this.key('tenant', tenantId, key));
  }

  async setTenant<T = unknown>(tenantId: string, key: string, value: T) {
    await this.redis.setJson(this.key('tenant', tenantId, key), value, this.defaultTtlSeconds);
  }

  async invalidateTenant(tenantId: string, key?: string) {
    const keys = [this.key('tenant', tenantId, 'list')];
    if (key) keys.push(this.key('tenant', tenantId, key));
    await this.redis.deleteKeys(keys);
  }

  async getFeature(code: string) {
    return this.redis.getJson<FeatureFlag>(this.key('feature', code));
  }

  async setFeature(code: string, flag: FeatureFlag) {
    await this.redis.setJson(this.key('feature', code), flag, this.defaultTtlSeconds);
  }

  async invalidateFeature(code: string) {
    await this.redis.deleteKeys([this.key('feature', code)]);
  }

  private key(...parts: (string | number | undefined)[]) {
    return ['config', ...parts.filter(Boolean)].join(':');
  }
}
