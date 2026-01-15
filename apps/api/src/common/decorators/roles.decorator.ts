import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtension, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: string[]) => {
  const roleList = roles.join(', ');
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiExtension('x-roles', roles),
    ApiUnauthorizedResponse({ description: 'Unauthorized - missing or invalid token' }),
    ApiForbiddenResponse({
      description: roleList
        ? `Access denied. Required roles: ${roleList}`
        : 'Access denied. Insufficient permissions.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Forbidden resource' },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
  );
};

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireAccess = (roles: string[], permissions?: string[]) => {
  return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (key) {
      const propertyDescriptor =
        descriptor ?? Object.getOwnPropertyDescriptor(target, key);
      SetMetadata(ROLES_KEY, roles)(
        target,
        key,
        propertyDescriptor as TypedPropertyDescriptor<any>,
      );
      if (permissions?.length) {
        SetMetadata(PERMISSIONS_KEY, permissions)(
          target,
          key,
          propertyDescriptor as TypedPropertyDescriptor<any>,
        );
      }
      return;
    }

    SetMetadata(ROLES_KEY, roles)(target);
    if (permissions?.length) {
      SetMetadata(PERMISSIONS_KEY, permissions)(target);
    }
  };
};
