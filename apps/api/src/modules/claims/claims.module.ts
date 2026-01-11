import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ClaimsController } from './claims/claims.controller';
import { ClaimsService } from './claims/claims.service';
import { ClaimItemsController } from './items/claim-items.controller';
import { ClaimItemsService } from './items/claim-items.service';
import { ClaimDocumentsController } from './documents/claim-documents.controller';
import { ClaimDocumentsService } from './documents/claim-documents.service';
import { ClaimNotesController } from './notes/claim-notes.controller';
import { ClaimNotesService } from './notes/claim-notes.service';
import { ResolutionController } from './resolution/resolution.controller';
import { ResolutionService } from './resolution/resolution.service';
import { SubrogationController } from './subrogation/subrogation.controller';
import { SubrogationService } from './subrogation/subrogation.service';
import { ClaimsReportsController } from './reports/reports.controller';
import { ClaimsReportsService } from './reports/reports.service';

@Module({
  controllers: [
    ClaimsController,
    ClaimItemsController,
    ClaimDocumentsController,
    ClaimNotesController,
    ResolutionController,
    SubrogationController,
    ClaimsReportsController,
  ],
  providers: [
    PrismaService,
    ClaimsService,
    ClaimItemsService,
    ClaimDocumentsService,
    ClaimNotesService,
    ResolutionService,
    SubrogationService,
    ClaimsReportsService,
  ],
  exports: [
    ClaimsService,
    ClaimItemsService,
    ClaimDocumentsService,
    ClaimNotesService,
    ResolutionService,
    SubrogationService,
    ClaimsReportsService,
  ],
})
export class ClaimsModule {}
