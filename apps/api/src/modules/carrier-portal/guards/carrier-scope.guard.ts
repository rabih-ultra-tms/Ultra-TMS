import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CarrierScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const portalUser = request.carrierPortalUser;

    if (!portalUser?.carrierId) {
      throw new ForbiddenException('User is not associated with a carrier account');
    }

    request.carrierId = portalUser.carrierId;
    request.carrierScope = {
      type: 'CARRIER',
      id: portalUser.carrierId,
      tenantId: portalUser.tenantId,
    };

    return true;
  }
}
