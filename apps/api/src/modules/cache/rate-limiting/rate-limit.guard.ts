import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) return true;
    const key = request.user?.id ? `user:${request.user.id}` : request.ip;
    const record = await this.rateLimitService.getByKey(tenantId, key);
    if (!record) return true;

    const now = new Date();
    const windowEnd = new Date(record.windowStartsAt.getTime() + record.windowSeconds * 1000);
    let currentRequests = record.currentRequests;

    if (now > windowEnd) {
      currentRequests = 0;
      await this.rateLimitService.reset(tenantId, key);
    }

    if (currentRequests >= record.maxRequests) {
      return false;
    }

    await this.rateLimitService.incrementUsage(record);
    return true;
  }
}
