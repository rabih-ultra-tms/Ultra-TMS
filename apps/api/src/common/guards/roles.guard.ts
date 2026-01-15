import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  ROLES_KEY,
} from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length && !requiredPermissions?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    const userRole = user?.role?.name ?? user?.roleName ?? user?.role;

    if (!userRole) {
      throw new ForbiddenException('Access denied: No role assigned');
    }

    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((role) => userRole === role);
      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied: Required role(s): ${requiredRoles.join(', ')}`,
        );
      }
    }

    if (requiredPermissions?.length) {
      const userPermissions: string[] =
        user?.role?.permissions ?? user?.permissions ?? [];
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        const missing = requiredPermissions.filter(
          (permission) => !userPermissions.includes(permission),
        );
        throw new ForbiddenException(
          `Access denied: Missing permission(s): ${missing.join(', ')}`,
        );
      }
    }

    return true;
  }
}
