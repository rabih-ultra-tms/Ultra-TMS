import { Test, TestingModule } from '@nestjs/testing';
import { LoginAuditService } from './login-audit.service';
import { PrismaService } from '../../../prisma.service';

describe('LoginAuditService', () => {
  let service: LoginAuditService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { loginAudit: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginAuditService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(LoginAuditService);
  });

  it('records login audit entry', async () => {
    prisma.loginAudit.create.mockResolvedValue({ id: 'a1' });

    await service.record({ tenantId: 't1', success: true });

    expect(prisma.loginAudit.create).toHaveBeenCalled();
  });

  it('lists login audits', async () => {
    prisma.loginAudit.findMany.mockResolvedValue([]);
    prisma.loginAudit.count.mockResolvedValue(0);

    const result = await service.list('tenant-1', { success: 'false' } as any);

    expect(result.total).toBe(0);
    expect(prisma.loginAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ success: false }) }),
    );
  });

  it('summarizes login audits', async () => {
    prisma.loginAudit.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);

    const result = await service.summary('tenant-1');

    expect(result).toEqual({ total: 3, success: 2, failure: 1 });
  });
});
