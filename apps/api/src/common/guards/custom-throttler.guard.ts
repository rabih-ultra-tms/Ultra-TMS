import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    _context: ExecutionContext,
  ): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.');
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return `${ip}-${userId}`;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const skipPaths = ['/health', '/ready', '/live'];
    return skipPaths.includes(request.path);
  }
}
