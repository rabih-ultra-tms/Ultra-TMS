import { Injectable } from '@nestjs/common';
import { AuditLog } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuditHashService {
  generateHash(log: AuditLog, previousHash: string | null): string {
    // Exclude computed hash links from the digest to keep integrity stable
    const metadata = { ...((log.metadata ?? {}) as Record<string, unknown>) };
    delete metadata.hash;
    delete metadata.previousHash;

    const payload = {
      tenantId: log.tenantId ?? 'system',
      action: log.action,
      category: log.category,
      severity: log.severity,
      entityType: log.entityType ?? '',
      entityId: log.entityId ?? '',
      userId: log.userId ?? '',
      metadata,
      createdAt: log.createdAt?.toISOString?.() ?? '',
      previousHash,
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  extractHashes(log: AuditLog): { hash?: string; previousHash?: string } {
    const metadata = ((log.metadata ?? {}) as Record<string, unknown>) ?? {};
    return {
      hash: metadata.hash as string | undefined,
      previousHash: metadata.previousHash as string | undefined,
    };
  }

  withHashMetadata(log: AuditLog, previousHash: string | null): { hash: string; previousHash: string | null; metadata: Record<string, unknown> } {
    const hash = this.generateHash(log, previousHash);
    const metadata = { ...(((log.metadata ?? {}) as Record<string, unknown>) ?? {}), hash, previousHash };
    return { hash, previousHash, metadata };
  }

  verifyChain(logs: AuditLog[]): { valid: boolean; brokenAt?: string } {
    let prev: string | null = null;

    for (const log of logs) {
      const expected = this.generateHash(log, prev);
      const { hash, previousHash } = this.extractHashes(log);

      if (previousHash && previousHash !== prev) {
        return { valid: false, brokenAt: log.id };
      }

      if (hash && hash !== expected) {
        return { valid: false, brokenAt: log.id };
      }

      prev = hash ?? expected;
    }

    return { valid: true };
  }
}
