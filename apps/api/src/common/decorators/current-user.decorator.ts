import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  userId: string; // Alias for id
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;
    
    if (!user) {
      return null;
    }

    // Add userId alias if not present
    if (!user.userId) {
      user.userId = user.id;
    }
    
    return data ? user[data] : user;
  },
);
