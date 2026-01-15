import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const portalUser = request.portalUser;

    if (!portalUser?.companyId) {
      throw new ForbiddenException('User is not associated with a customer account');
    }

    request.customerId = portalUser.companyId;
    request.companyScope = {
      type: 'CUSTOMER',
      id: portalUser.companyId,
      tenantId: portalUser.tenantId,
    };

    return true;
  }
}
