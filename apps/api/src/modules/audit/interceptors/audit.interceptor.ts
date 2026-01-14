import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { AuditAction, AuditActionCategory, Prisma } from '@prisma/client';
import { Observable, tap } from 'rxjs';
import { AuditLogsService } from '../logs/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogs: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const tenantId = request.tenantId ?? request.user?.tenantId ?? request.headers['x-tenant-id'];
          const metadata: Prisma.InputJsonValue = {
            requestId: request.id ?? request.headers['x-request-id'],
            durationMs: Date.now() - startedAt,
            statusCode: response?.statusCode ?? response?.status ?? 200,
            path: request.path,
          };

          await this.auditLogs.log({
            tenantId: tenantId ?? null,
            userId: request.user?.id ?? null,
            action: this.methodToAction(request.method),
            category: AuditActionCategory.SYSTEM,
            entityType: this.extractResource(request.path),
            entityId: request.params?.id ?? null,
            description: `HTTP ${request.method} ${request.path}`,
            metadata,
            ipAddress: request.ip,
            userAgent: request.headers?.['user-agent'],
          });
        } catch (_err) {
          // Avoid interceptors breaking primary response flow
        }
      }),
    );
  }

  private methodToAction(method: string): AuditAction {
    switch ((method ?? '').toUpperCase()) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.READ;
    }
  }

  private extractResource(path: string): string {
    if (!path) return 'unknown';
    const segments = path.split('/').filter(Boolean);
    return segments.slice(0, 2).join('/') || 'unknown';
  }
}
