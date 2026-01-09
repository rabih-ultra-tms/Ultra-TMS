import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // Try to get tenant from user object first
    if (request.user?.tenantId) {
      return request.user.tenantId;
    }
    
    // Fall back to header
    return request.headers['x-tenant-id'] || 'default-tenant';
  },
);
