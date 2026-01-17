import { ForbiddenException } from '@nestjs/common';
import { DocumentAccessGuard } from './document-access.guard';
import { DocumentsService } from '../services';

describe('DocumentAccessGuard', () => {
  let guard: DocumentAccessGuard;
  const documentsService = { findOne: jest.fn() };

  const makeContext = (req: any) => ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as any;

  beforeEach(() => {
    guard = new DocumentAccessGuard(documentsService as unknown as DocumentsService);
  });

  it('throws when missing user or document id', async () => {
    await expect(guard.canActivate(makeContext({ user: null, params: {} }))).rejects.toThrow(ForbiddenException);
  });

  it('allows admin', async () => {
    const req = { user: { role: { name: 'ADMIN' } }, params: { id: 'd1' } } as any;

    const result = await guard.canActivate(makeContext(req));

    expect(result).toBe(true);
  });

  it('denies restricted document types for non-accounting', async () => {
    documentsService.findOne.mockResolvedValue({ documentType: 'TAX' });
    const req = { user: { role: { name: 'USER' }, tenantId: 't1' }, params: { id: 'd1' }, headers: {} } as any;

    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(ForbiddenException);
  });

  it('denies access without tenant context', async () => {
    documentsService.findOne.mockResolvedValue({ documentType: 'DOC' });
    const req = { user: { role: { name: 'USER' } }, params: { id: 'd1' }, headers: {} } as any;

    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(ForbiddenException);
  });

  it('allows insurance document for operations role', async () => {
    documentsService.findOne.mockResolvedValue({ documentType: 'INSURANCE' });
    const req = { user: { roles: ['OPERATIONS'], tenantId: 't1' }, params: { id: 'd1' }, headers: {} } as any;

    const result = await guard.canActivate(makeContext(req));

    expect(result).toBe(true);
  });

  it('allows carrier owned document', async () => {
    documentsService.findOne.mockResolvedValue({ documentType: 'DOC', entityType: 'CARRIER', entityId: 'c1' });
    const req = { user: { roles: ['CARRIER'], carrierId: 'c1', tenantId: 't1' }, params: { id: 'd1' } } as any;

    const result = await guard.canActivate(makeContext(req));

    expect(result).toBe(true);
  });

  it('allows customer owned document', async () => {
    documentsService.findOne.mockResolvedValue({ documentType: 'DOC', entityType: 'CUSTOMER', entityId: 'co1' });
    const req = { user: { roles: ['CUSTOMER'], companyId: 'co1', tenantId: 't1' }, params: { id: 'd1' } } as any;

    const result = await guard.canActivate(makeContext(req));

    expect(result).toBe(true);
  });

  it('denies customer document without ownership', async () => {
    documentsService.findOne.mockResolvedValue({ documentType: 'DOC', entityType: 'CUSTOMER', entityId: 'co2' });
    const req = { user: { roles: ['CUSTOMER'], companyId: 'co1', tenantId: 't1' }, params: { id: 'd1' } } as any;

    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(ForbiddenException);
  });
});
