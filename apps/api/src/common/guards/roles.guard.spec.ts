import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

const createExecutionContext = (user?: any) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as any;

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles required', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);

    const context = createExecutionContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(['ADMIN'])
      .mockReturnValueOnce(undefined);

    const context = createExecutionContext({ role: 'ADMIN' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has one of multiple allowed roles', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(['ADMIN', 'MANAGER'])
      .mockReturnValueOnce(undefined);

    const context = createExecutionContext({ roles: ['MANAGER'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(['ADMIN'])
      .mockReturnValueOnce(undefined);

    const context = createExecutionContext({ role: 'USER' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow SUPER_ADMIN to bypass all checks', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(['ADMIN'])
      .mockReturnValueOnce(['perm:write']);

    const context = createExecutionContext({ role: { name: 'SUPER_ADMIN' } });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should check all required permissions', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(['perm:read', 'perm:write']);

    const context = createExecutionContext({
      role: { name: 'ADMIN', permissions: ['perm:read', 'perm:write'] },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException with descriptive message', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(['perm:read', 'perm:write']);

    const context = createExecutionContext({
      role: { name: 'ADMIN', permissions: ['perm:read'] },
    });

    try {
      guard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toContain('Missing permission(s)');
    }
  });
});
