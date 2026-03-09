import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Set of Prisma read operations that should have tenantId/deletedAt injected.
 */
export const READ_OPERATIONS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

/**
 * Operations that create records and need tenantId injected into data.
 */
export const CREATE_OPERATIONS = new Set([
  'create',
  'createMany',
  'createManyAndReturn',
]);

/**
 * Mutations that filter by where clause and need tenantId injected.
 */
export const MUTATION_OPERATIONS = new Set([
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'upsert',
]);

/**
 * Build the sets of model names that have tenantId / deletedAt fields
 * by inspecting Prisma's DMMF metadata at runtime.
 */
export function buildModelFieldSets(client: PrismaClient): {
  tenantModels: Set<string>;
  softDeleteModels: Set<string>;
} {
  const tenantModels = new Set<string>();
  const softDeleteModels = new Set<string>();

  const dmmf =
    (client as any)._baseDmmf ?? (client as any)._dmmf ?? Prisma.dmmf;
  const models: any[] = dmmf?.datamodel?.models ?? [];

  for (const model of models) {
    const fieldNames = new Set(
      model.fields.map((f: any) => f.name as string),
    );
    if (fieldNames.has('tenantId')) {
      tenantModels.add(model.name);
    }
    if (fieldNames.has('deletedAt')) {
      softDeleteModels.add(model.name);
    }
  }

  return { tenantModels, softDeleteModels };
}

/**
 * Core query interceptor logic. Separated from Prisma.defineExtension
 * so it can be unit-tested without a real Prisma client.
 *
 * @param tenantId - The tenant ID to inject
 * @param tenantModels - Set of model names that have a tenantId field
 * @param softDeleteModels - Set of model names that have a deletedAt field
 */
export function createAllOperationsHandler(
  tenantId: string,
  tenantModels: Set<string>,
  softDeleteModels: Set<string>,
) {
  return function allOperationsHandler({
    model,
    operation,
    args,
    query,
  }: {
    model?: string;
    operation: string;
    args: any;
    query: (args: any) => Promise<any>;
  }) {
    if (!model) return query(args);

    const hasTenant = tenantModels.has(model);
    const hasSoftDelete = softDeleteModels.has(model);

    // --- READ operations: inject where.tenantId + where.deletedAt ---
    if (READ_OPERATIONS.has(operation)) {
      if (hasTenant || hasSoftDelete) {
        args.where = args.where ?? {};

        if (hasTenant && args.where.tenantId === undefined) {
          args.where.tenantId = tenantId;
        }
        if (hasSoftDelete && args.where.deletedAt === undefined) {
          args.where.deletedAt = null;
        }
      }
      return query(args);
    }

    // --- CREATE operations: inject data.tenantId ---
    if (CREATE_OPERATIONS.has(operation) && hasTenant) {
      if (
        operation === 'createMany' ||
        operation === 'createManyAndReturn'
      ) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map((item: any) =>
            item.tenantId === undefined
              ? { ...item, tenantId }
              : item,
          );
        } else if (args.data && args.data.tenantId === undefined) {
          args.data.tenantId = tenantId;
        }
      } else {
        args.data = args.data ?? {};
        if (args.data.tenantId === undefined) {
          args.data.tenantId = tenantId;
        }
      }
      return query(args);
    }

    // --- MUTATION operations (update, delete, upsert): inject where.tenantId ---
    if (MUTATION_OPERATIONS.has(operation) && hasTenant) {
      if (operation === 'upsert') {
        args.where = args.where ?? {};
        if (args.where.tenantId === undefined) {
          args.where.tenantId = tenantId;
        }
        args.create = args.create ?? {};
        if (args.create.tenantId === undefined) {
          args.create.tenantId = tenantId;
        }
      } else {
        args.where = args.where ?? {};
        if (args.where.tenantId === undefined) {
          args.where.tenantId = tenantId;
        }
      }
      return query(args);
    }

    return query(args);
  };
}

/**
 * Creates a Prisma Client Extension that automatically injects:
 *   - `tenantId` into WHERE clauses (reads + mutations) and CREATE data
 *   - `deletedAt: null` into WHERE clauses (reads only)
 *
 * Usage:
 *   const scoped = prisma.$extends(tenantExtension(tenantId));
 *   // All queries from `scoped` auto-filter by tenantId + soft-delete
 *
 * Design decisions:
 *   - Does NOT double-filter: if tenantId is already in args, it's left as-is.
 *   - Skips models that don't have the relevant field (e.g., SystemConfig, Tenant).
 *   - Uses DMMF introspection so it stays correct if models change.
 */
export function tenantExtension(tenantId: string) {
  return Prisma.defineExtension((client) => {
    const { tenantModels, softDeleteModels } = buildModelFieldSets(
      client as unknown as PrismaClient,
    );

    return client.$extends({
      query: {
        $allOperations: createAllOperationsHandler(
          tenantId,
          tenantModels,
          softDeleteModels,
        ) as any,
      },
    });
  });
}
