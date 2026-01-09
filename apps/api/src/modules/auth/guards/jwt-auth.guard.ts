/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // For development: allow all requests with mock user data
    // In production, this should validate JWT tokens
    const authHeader = request.headers.authorization;
    
    const nodeEnv = globalThis.process?.env?.NODE_ENV;
    const bypassAuth = globalThis.process?.env?.BYPASS_AUTH;
    
    if (nodeEnv === 'development' || bypassAuth === 'true') {
      // Inject mock user for development
      (request as any).user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        tenantId: request.headers['x-tenant-id'] || 'dev-tenant',
        roles: ['admin'],
      };
      return true;
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    
    const token = authHeader.substring(7);
    
    try {
      // TODO: Implement proper JWT validation
      // For now, just check token exists
      if (token) {
        (request as any).user = {
          id: 'user-id',
          email: 'user@example.com',
          tenantId: request.headers['x-tenant-id'] || 'default-tenant',
          roles: ['user'],
        };
        return true;
      }
      return false;
    } catch (_error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
