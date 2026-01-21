jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class {
      canActivate() {
        return true;
      }
    },
}));

import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('delegates to passport auth guard', () => {
    const guard = new JwtAuthGuard(new Reflector());

    const result = guard.canActivate({
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as any);

    expect(result).toBe(true);
  });
});
