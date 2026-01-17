jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class {
      canActivate() {
        return true;
      }
    },
}));

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('delegates to passport auth guard', () => {
    const guard = new JwtAuthGuard();

    const result = guard.canActivate({} as any);

    expect(result).toBe(true);
  });
});
