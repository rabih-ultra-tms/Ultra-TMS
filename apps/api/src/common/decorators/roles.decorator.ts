import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

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
