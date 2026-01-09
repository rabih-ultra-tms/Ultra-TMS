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
  ],
  exports: [DocumentsService, DocumentTemplatesService, DocumentFoldersService],
})
export class DocumentsModule {}
