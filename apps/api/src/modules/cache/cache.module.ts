import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheManagementController } from './management/cache-management.controller';
import { CacheManagementService } from './management/cache-management.service';
import { RateLimitController } from './rate-limiting/rate-limit.controller';
import { RateLimitService } from './rate-limiting/rate-limit.service';
import { RateLimitGuard } from './rate-limiting/rate-limit.guard';
import { LocksController } from './locking/locks.controller';
import { DistributedLockService } from './locking/distributed-lock.service';
import { CacheConfigController } from './config/cache-config.controller';
import { CacheConfigService } from './config/cache-config.service';
import { InvalidationService } from './invalidation/invalidation.service';
import { InvalidationListener } from './invalidation/invalidation.listener';
import { CacheWarmerService } from './warming/cache-warmer.service';
import { CacheStatsService } from './stats/cache-stats.service';
import { PrismaService } from '../../prisma.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule, EventEmitterModule],
  controllers: [
    CacheManagementController,
    RateLimitController,
    LocksController,
    CacheConfigController,
  ],
  providers: [
    PrismaService,
    CacheManagementService,
    RateLimitService,
    RateLimitGuard,
    DistributedLockService,
    CacheConfigService,
    InvalidationService,
    InvalidationListener,
    CacheWarmerService,
    CacheStatsService,
  ],
})
export class CacheModule {}
