import { Module } from '@nestjs/common';
import { ContractsController } from './contracts/contracts.controller';
import { ContractsService } from './contracts/contracts.service';
import { PrismaService } from '../../prisma.service';
import { ContractTemplatesController } from './templates/contract-templates.controller';
import { ContractTemplatesService } from './templates/contract-templates.service';
import { RateTablesController } from './rate-tables/rate-tables.controller';
import { RateTablesService } from './rate-tables/rate-tables.service';
import { RateLanesController } from './rate-lanes/rate-lanes.controller';
import { RateLanesService } from './rate-lanes/rate-lanes.service';
import { FuelSurchargeController } from './fuel-surcharge/fuel-surcharge.controller';
import { FuelSurchargeService } from './fuel-surcharge/fuel-surcharge.service';
import { SlasController } from './slas/slas.controller';
import { SlasService } from './slas/slas.service';
import { VolumeCommitmentsController } from './volume-commitments/volume-commitments.controller';
import { VolumeCommitmentsService } from './volume-commitments/volume-commitments.service';
import { AmendmentsController } from './amendments/amendments.controller';
import { AmendmentsService } from './amendments/amendments.service';
import { DocuSignService } from './integrations/docusign.service';
import { ContractsEventsListener } from './listeners/contracts-events.listener';

@Module({
  controllers: [
    ContractsController,
    ContractTemplatesController,
    RateTablesController,
    RateLanesController,
    FuelSurchargeController,
    SlasController,
    VolumeCommitmentsController,
    AmendmentsController,
  ],
  providers: [
    PrismaService,
    ContractsService,
    ContractTemplatesService,
    RateTablesService,
    RateLanesService,
    FuelSurchargeService,
    SlasService,
    VolumeCommitmentsService,
    AmendmentsService,
    DocuSignService,
    ContractsEventsListener,
  ],
})
export class ContractsModule {}
