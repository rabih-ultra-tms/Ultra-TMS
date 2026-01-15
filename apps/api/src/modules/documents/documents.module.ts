import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  DocumentsService,
  DocumentTemplatesService,
  DocumentFoldersService,
} from './services';
import {
  DocumentsController,
  DocumentTemplatesController,
  DocumentFoldersController,
} from './controllers';
import { DocumentAccessGuard } from './guards/document-access.guard';

@Module({
  controllers: [
    DocumentsController,
    DocumentTemplatesController,
    DocumentFoldersController,
  ],
  providers: [
    PrismaService,
    DocumentsService,
    DocumentTemplatesService,
    DocumentFoldersService,
    DocumentAccessGuard,
  ],
  exports: [DocumentsService, DocumentTemplatesService, DocumentFoldersService],
})
export class DocumentsModule {}
