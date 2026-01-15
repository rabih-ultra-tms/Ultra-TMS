import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DocumentsService } from '../services';

@Injectable()
export class DocumentAccessGuard implements CanActivate {
  constructor(private readonly documentsService: DocumentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const documentId = request.params?.id;

    if (!user || !documentId) {
      throw new ForbiddenException('Access denied: Invalid document access');
    }

    const userRole = user?.role?.name ?? user?.roleName ?? user?.role;
    const userRoles: string[] = Array.isArray(user?.roles)
      ? user.roles
      : userRole
        ? [userRole]
        : [];

    const hasRole = (roles: string[]) => roles.some((role) => userRoles.includes(role));

    if (hasRole(['SUPER_ADMIN', 'ADMIN'])) {
      return true;
    }

    const tenantId = user?.tenantId ?? request.tenantId ?? request.headers?.['x-tenant-id'];
    if (!tenantId) {
      throw new ForbiddenException('Access denied: Tenant context required');
    }

    const document = await this.documentsService.findOne(tenantId, documentId);

    const documentType = document?.documentType;
    if (documentType === 'W9' || documentType === 'TAX') {
      if (!hasRole(['ACCOUNTING'])) {
        throw new ForbiddenException('Access denied: Restricted document type');
      }
      return true;
    }

    if (documentType === 'INSURANCE') {
      if (!hasRole(['ACCOUNTING', 'OPERATIONS', 'COMPLIANCE', 'CARRIER_MANAGER'])) {
        throw new ForbiddenException('Access denied: Restricted document type');
      }
      return true;
    }

    if (document?.entityType === 'CARRIER' && hasRole(['CARRIER'])) {
      const carrierId = user?.carrierId;
      if (!carrierId) {
        throw new ForbiddenException('Access denied: Carrier context required');
      }
      if (document?.entityId === carrierId || document?.carrierId === carrierId) {
        return true;
      }
      throw new ForbiddenException('Access denied: Carrier document ownership required');
    }

    if (
      (document?.entityType === 'COMPANY' || document?.entityType === 'CUSTOMER') &&
      hasRole(['CUSTOMER'])
    ) {
      const companyId = user?.companyId ?? user?.customerId;
      if (!companyId) {
        throw new ForbiddenException('Access denied: Customer context required');
      }
      if (document?.entityId === companyId || document?.companyId === companyId) {
        return true;
      }
      throw new ForbiddenException('Access denied: Customer document ownership required');
    }

    return true;
  }
}
