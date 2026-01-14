import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async getValue(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setValue(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async deleteKeys(keys: string[]): Promise<void> {
    if (!keys.length) return;
    await this.client.del(...keys);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.getValue(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.warn(`Failed to parse JSON for key ${key}: ${error}`);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.setValue(key, JSON.stringify(value), ttlSeconds);
  }

  /**
   * Basic set helper with TTL (in seconds) for generic caching use cases.
   */
  async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  /**
   * Store a refresh token session in Redis
   * Key format: session:{userId}:{sessionId}
   */
  async storeSession(
    userId: string,
    sessionId: string,
    refreshTokenHash: string,
    expiresInSeconds: number,
  ): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    const data = {
      refreshTokenHash,
      createdAt: new Date().toISOString(),
    };

    await this.client.setex(key, expiresInSeconds, JSON.stringify(data));
    this.logger.debug(`Stored session ${sessionId} for user ${userId}`);
  }

  /**
   * Get session data from Redis
   */
  async getSession(userId: string, sessionId: string): Promise<any> {
    const key = `session:${userId}:${sessionId}`;
    const data = await this.client.get(key);
    
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  /**
   * Revoke a specific session (logout)
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await this.client.del(key);
    this.logger.debug(`Revoked session ${sessionId} for user ${userId}`);
  }

  /**
   * Revoke all sessions for a user (logout all devices)
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    const pattern = `session:${userId}:*`;
    const keys = await this.client.keys(pattern);
    
    if (keys.length > 0) {
      await this.client.del(...keys);
      this.logger.debug(`Revoked ${keys.length} sessions for user ${userId}`);
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const pattern = `session:${userId}:*`;
    const keys = await this.client.keys(pattern);
    
    return keys.map((key) => key.split(':')[2]).filter((id): id is string => id !== undefined); // Extract sessionId
  }

  /**
   * Count active sessions for a user
   */
  async getUserSessionCount(userId: string): Promise<number> {
    const pattern = `session:${userId}:*`;
    const keys = await this.client.keys(pattern);
    return keys.length;
  }

  /**
   * Blacklist an access token (for immediate logout without waiting for expiry)
   * Key format: blacklist:{jti}
   */
  async blacklistToken(jti: string, expiresInSeconds: number): Promise<void> {
    const key = `blacklist:${jti}`;
    await this.client.setex(key, expiresInSeconds, '1');
    this.logger.debug(`Blacklisted token ${jti}`);
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const key = `blacklist:${jti}`;
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Store a password reset token
   * Key format: reset:{userId}:{tokenHash}
   */
  async storePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresInSeconds: number,
  ): Promise<void> {
    const key = `reset:${userId}:${tokenHash}`;
    await this.client.setex(key, expiresInSeconds, new Date().toISOString());
    this.logger.debug(`Stored password reset token for user ${userId}`);
  }

  /**
   * Verify and consume password reset token
   */
  async consumePasswordResetToken(userId: string, tokenHash: string): Promise<boolean> {
    const key = `reset:${userId}:${tokenHash}`;
    const exists = await this.client.exists(key);
    
    if (exists) {
      await this.client.del(key);
      return true;
    }
    
    return false;
  }

  /**
   * Track failed login attempts
   * Key format: login_attempts:{email}
   */
  async incrementLoginAttempts(email: string): Promise<number> {
    const key = `login_attempts:${email}`;
    const attempts = await this.client.incr(key);
    
    // Set expiration on first attempt
    if (attempts === 1) {
      await this.client.expire(key, 900); // 15 minutes
    }
    
    return attempts;
  }

  /**
   * Get failed login attempt count
   */
  async getLoginAttempts(email: string): Promise<number> {
    const key = `login_attempts:${email}`;
    const attempts = await this.client.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  /**
   * Reset failed login attempts (on successful login)
   */
  async resetLoginAttempts(email: string): Promise<void> {
    const key = `login_attempts:${email}`;
    await this.client.del(key);
  }

  /**
   * Lock account temporarily
   */
  async lockAccount(email: string, durationSeconds: number): Promise<void> {
    const key = `account_locked:${email}`;
    await this.client.setex(key, durationSeconds, new Date().toISOString());
    this.logger.warn(`Account locked for ${email}`);
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(email: string): Promise<boolean> {
    const key = `account_locked:${email}`;
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Store email verification token
   */
  async storeEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresInSeconds: number,
  ): Promise<void> {
    const key = `email_verify:${userId}:${tokenHash}`;
    await this.client.setex(key, expiresInSeconds, new Date().toISOString());
  }

  /**
   * Verify and consume email verification token
   */
  async consumeEmailVerificationToken(userId: string, tokenHash: string): Promise<boolean> {
    const key = `email_verify:${userId}:${tokenHash}`;
    const exists = await this.client.exists(key);
    
    if (exists) {
      await this.client.del(key);
      return true;
    }
    
    return false;
  }

  /**
   * Generic cache get/set methods
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, expiresInSeconds?: number): Promise<void> {
    if (expiresInSeconds) {
      await this.client.setex(key, expiresInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
