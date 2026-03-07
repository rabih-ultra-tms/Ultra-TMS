import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    const middleware = (this as any).$use;
    if (typeof middleware !== 'function') {
      return;
    }

    // Build the set of models that have a deletedAt field from Prisma DMMF
    const softDeleteModels = new Set<string>();
    const dmmf = (this as any)._baseDmmf ?? (this as any)._dmmf;
    if (dmmf?.datamodel?.models) {
      for (const model of dmmf.datamodel.models) {
        if (model.fields.some((f: any) => f.name === 'deletedAt')) {
          softDeleteModels.add(model.name);
        }
      }
    }

    middleware.call(this, async (params: any, next: any) => {
      if (!params.model || !softDeleteModels.has(params.model)) {
        return next(params);
      }

      if (
        params.action === 'findMany' ||
        params.action === 'findFirst' ||
        params.action === 'findUnique' ||
        params.action === 'count' ||
        params.action === 'aggregate'
      ) {
        params.args = params.args || {};
        params.args.where = params.args.where || {};

        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      }

      if (params.action === 'delete') {
        params.action = 'update';
        params.args = params.args || {};
        params.args.data = { deletedAt: new Date() };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args = params.args || {};
        params.args.data = { deletedAt: new Date() };
      }

      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
