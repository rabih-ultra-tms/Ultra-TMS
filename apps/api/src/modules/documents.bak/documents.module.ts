import { Module } from '@nestjs/common';
import { DocumentsController, EntityDocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { SharesController, PublicSharesController } from './shares.controller';
import { SharesService } from './shares.service';
import { GenerationService } from './generation.service';
import { GenerationController, EntityGenerationController } from './generation.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [
    DocumentsController,
    EntityDocumentsController,
    TemplatesController,
    FoldersController,
    SharesController,
    PublicSharesController,
    GenerationController,
    EntityGenerationController,
  ],
  providers: [
    PrismaService,
    DocumentsService,
    TemplatesService,
    FoldersService,
    SharesService,
    GenerationService,
  ],
  exports: [
    DocumentsService,
    TemplatesService,
    FoldersService,
    SharesService,
    GenerationService,
  ],
})
export class DocumentsModule {}
