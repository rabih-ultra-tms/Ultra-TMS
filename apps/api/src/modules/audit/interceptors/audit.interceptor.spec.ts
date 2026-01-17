import { of } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  it('logs api audit entries', async () => {
    const auditLogs = { log: jest.fn().mockResolvedValue(null) };
    const prisma = { aPIAuditLog: { create: jest.fn().mockResolvedValue(null) } };
    const reflector = { get: jest.fn().mockReturnValue(null) } as unknown as Reflector;

    const interceptor = new AuditInterceptor(auditLogs as any, prisma as any, reflector);

    const req = { method: 'GET', path: '/orders', headers: {}, params: {}, user: { id: 'u1', tenantId: 't1' }, ip: '1.1.1.1' };
    const res = { statusCode: 200 };
    const context = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
      getHandler: () => ({}),
    } as any;

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, { handle: () => of({}) } as any).subscribe({ complete: () => resolve() });
    });

    expect(auditLogs.log).toHaveBeenCalled();
    expect(prisma.aPIAuditLog.create).toHaveBeenCalled();
  });

  it('logs with audit metadata and custom entity id', async () => {
    const auditLogs = { log: jest.fn().mockResolvedValue(null) };
    const prisma = { aPIAuditLog: { create: jest.fn().mockResolvedValue(null) } };
    const reflector = {
      get: jest.fn().mockReturnValue({
        action: 'DELETE',
        entityType: 'contract',
        entityIdParam: 'contractId',
        description: 'Sensitive delete',
        sensitiveFields: ['fieldA'],
      }),
    } as unknown as Reflector;

    const interceptor = new AuditInterceptor(auditLogs as any, prisma as any, reflector);

    const req = {
      method: 'DELETE',
      path: '/contracts/abc',
      headers: { 'x-tenant-id': 't1' },
      params: { contractId: 'c1' },
      user: { id: 'u1', email: 'a@b.com', role: { name: 'ADMIN' } },
      ip: '1.1.1.1',
    };
    const res = { statusCode: 204 };
    const context = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
      getHandler: () => ({}),
    } as any;

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, { handle: () => of({}) } as any).subscribe({ complete: () => resolve() });
    });

    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(auditLogs.log).toHaveBeenCalledTimes(2);
  });

  it('derives status code from result when response missing', async () => {
    const auditLogs = { log: jest.fn().mockResolvedValue(null) };
    const prisma = { aPIAuditLog: { create: jest.fn().mockResolvedValue(null) } };
    const reflector = { get: jest.fn().mockReturnValue(null) } as unknown as Reflector;

    const interceptor = new AuditInterceptor(auditLogs as any, prisma as any, reflector);

    const req = { method: 'POST', path: '/orders', headers: {}, params: {}, user: { id: 'u1', tenantId: 't1' }, ip: '1.1.1.1' };
    const context = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => null }),
      getHandler: () => ({}),
    } as any;

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, { handle: () => of({ status: 201 }) } as any).subscribe({ complete: () => resolve() });
    });

    expect(prisma.aPIAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ responseStatus: 201 }) }),
    );
  });

  it('swallows errors in audit logging', async () => {
    const auditLogs = { log: jest.fn().mockRejectedValue(new Error('fail')) };
    const prisma = { aPIAuditLog: { create: jest.fn().mockRejectedValue(new Error('fail')) } };
    const reflector = { get: jest.fn().mockReturnValue(null) } as unknown as Reflector;

    const interceptor = new AuditInterceptor(auditLogs as any, prisma as any, reflector);

    const req = { method: 'GET', path: '', headers: {}, params: {}, user: { id: 'u1', tenantId: 't1' }, ip: '1.1.1.1' };
    const res = { statusCode: 200 };
    const context = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
      getHandler: () => ({}),
    } as any;

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, { handle: () => of({}) } as any).subscribe({ complete: () => resolve() });
    });

    expect(auditLogs.log).toHaveBeenCalled();
  });
});
