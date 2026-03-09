import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantExtension } from './prisma-tenant.extension';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Returns a tenant-scoped Prisma client that auto-injects:
   *   - `tenantId` into all WHERE clauses and CREATE data
   *   - `deletedAt: null` into all read queries (for models with soft delete)
   *
   * Usage in services:
   *   const db = this.prisma.forTenant(tenantId);
   *   const orders = await db.order.findMany(); // auto-filtered by tenantId + deletedAt
   *
   * The returned client is lightweight (no new DB connection).
   * Existing manual tenantId filters still work — the extension
   * only injects when tenantId/deletedAt are not already provided.
   */
  forTenant(tenantId: string) {
    return this.$extends(tenantExtension(tenantId));
  }
}
