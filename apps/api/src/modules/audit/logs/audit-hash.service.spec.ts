import { AuditHashService } from './audit-hash.service';
import { AuditLog } from '@prisma/client';

describe('AuditHashService', () => {
  let service: AuditHashService;

  beforeEach(() => {
    service = new AuditHashService();
  });

  const baseLog = (overrides?: Partial<AuditLog>): AuditLog => ({
    id: 'log-1',
    tenantId: 'tenant-1',
    action: 'CREATE',
    category: 'TEST',
    severity: 'INFO',
    entityType: 'Order',
    entityId: 'ord-1',
    userId: 'user-1',
    description: null,
    metadata: {},
    customFields: {},
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ipAddress: null,
    userAgent: null,
    externalId: null,
    sourceSystem: null,
    deletedAt: null,
    createdById: null,
    updatedById: null,
    ...overrides,
  } as AuditLog);

  it('generates stable hash excluding hash metadata', () => {
    const logWithHash = baseLog({
      metadata: { hash: 'old', previousHash: 'prev', extra: 'x' },
    });

    const hash1 = service.generateHash(logWithHash, 'prev');
    const hash2 = service.generateHash(baseLog({ metadata: { extra: 'x' } }), 'prev');

    expect(hash1).toEqual(hash2);
  });

  it('extracts hash metadata', () => {
    const log = baseLog({ metadata: { hash: 'h1', previousHash: 'h0' } });

    expect(service.extractHashes(log)).toEqual({ hash: 'h1', previousHash: 'h0' });
  });

  it('adds hash metadata', () => {
    const log = baseLog({ metadata: { other: 'v' } });

    const result = service.withHashMetadata(log, 'prev');

    expect(result.previousHash).toBe('prev');
    expect(result.metadata).toEqual(
      expect.objectContaining({ other: 'v', hash: result.hash, previousHash: 'prev' }),
    );
  });

  it('verifies a valid hash chain', () => {
    const log1 = baseLog({ id: 'log-1' });
    const meta1 = service.withHashMetadata(log1, null);
    const log1WithMeta = { ...log1, metadata: meta1.metadata } as AuditLog;

    const log2 = baseLog({ id: 'log-2', createdAt: new Date('2024-01-02T00:00:00.000Z') });
    const meta2 = service.withHashMetadata(log2, meta1.hash);
    const log2WithMeta = { ...log2, metadata: meta2.metadata } as AuditLog;

    expect(service.verifyChain([log1WithMeta, log2WithMeta])).toEqual({ valid: true });
  });

  it('detects broken chain when previous hash mismatches', () => {
    const log1 = baseLog({ id: 'log-1' });
    const meta1 = service.withHashMetadata(log1, null);
    const log1WithMeta = { ...log1, metadata: meta1.metadata } as AuditLog;

    const log2 = baseLog({ id: 'log-2', createdAt: new Date('2024-01-02T00:00:00.000Z') });
    const meta2 = service.withHashMetadata(log2, 'wrong');
    const log2WithMeta = { ...log2, metadata: meta2.metadata } as AuditLog;

    expect(service.verifyChain([log1WithMeta, log2WithMeta])).toEqual({ valid: false, brokenAt: 'log-2' });
  });
});
