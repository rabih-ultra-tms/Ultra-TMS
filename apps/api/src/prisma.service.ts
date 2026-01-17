import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      if (!params.model) {
        return next(params);
      }

      const softDeleteModels = new Set([
        'Company',
        'Contact',
        'Location',
        'Load',
        'Carrier',
        'Driver',
        'CarrierContact',
        'InsuranceCertificate',
        'CarrierDocument',
        'Document',
        'DocumentTemplate',
        'DocumentFolder',
        'LoadPosting',
        'LoadBid',
        'LoadTender',
        'TenderRecipient',
        'Integration',
        'WebhookEndpoint',
        'WebhookSubscription',
        'Contract',
        'ContractTemplate',
        'ContractRateTable',
        'ContractRateLane',
        'ContractSLA',
        'VolumeCommitment',
        'ContractAmendment',
        'FuelSurchargeTable',
        'FuelSurchargeTier',
        'RateContract',
        'CommissionPlan',
        'CommissionEntry',
        'CommissionPayout',
      ]);

      if (softDeleteModels.has(params.model)) {
        if (params.action === 'findMany' || params.action === 'findFirst') {
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
      }

      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
