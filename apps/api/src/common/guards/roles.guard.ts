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

    const normalizeRole = (role: string) => role.replace(/-/g, '_').toUpperCase();
    const userRole = user?.role?.name ?? user?.roleName ?? user?.role;
    const userRoles: string[] = Array.isArray(user?.roles)
      ? user.roles
      : userRole
        ? [userRole]
        : [];
    const normalizedUserRoles = userRoles.map((role) => normalizeRole(role));

    if (!userRole && userRoles.length === 0) {
      throw new ForbiddenException('Access denied: No role assigned');
    }

    if (
      normalizeRole(userRole ?? '') === 'SUPER_ADMIN' ||
      normalizedUserRoles.includes('SUPER_ADMIN')
    ) {
      return true;
    }

    if (requiredRoles?.length) {
      const normalizedRequiredRoles = requiredRoles.map((role) => normalizeRole(role));
      const hasRole = normalizedRequiredRoles.some((role) =>
        normalizedUserRoles.includes(role),
      );
      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied: Required role(s): ${normalizedRequiredRoles.join(', ')}`,
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
