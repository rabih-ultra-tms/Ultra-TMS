import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TradingPartnersController } from './trading-partners/trading-partners.controller';
import { TradingPartnersService } from './trading-partners/trading-partners.service';
import {
  EdiDocumentsController,
  EdiLoadDocumentsController,
  EdiOrderDocumentsController,
} from './documents/edi-documents.controller';
import { EdiDocumentsService } from './documents/edi-documents.service';
import { EdiGenerationController, EdiSendController } from './generation/edi-generation.controller';
import { EdiGenerationService } from './generation/edi-generation.service';
import { EdiMappingsController } from './mappings/edi-mappings.controller';
import { EdiMappingsService } from './mappings/edi-mappings.service';
import { EdiQueueController } from './queue/edi-queue.controller';
import { EdiQueueService } from './queue/edi-queue.service';
import { EdiParserService } from './parsing/edi-parser.service';
import { EdiControlNumberService } from './control-number.service';
import { Edi204Generator } from './generation/generators/edi-204.generator';
import { Edi210Generator } from './generation/generators/edi-210.generator';
import { Edi214Generator } from './generation/generators/edi-214.generator';
import { Edi990Generator } from './generation/generators/edi-990.generator';
import { Edi997Generator } from './generation/generators/edi-997.generator';
import { FtpTransport } from './transport/ftp.transport';
import { SftpTransport } from './transport/sftp.transport';
import { As2Transport } from './transport/as2.transport';

@Module({
  controllers: [
    TradingPartnersController,
    EdiDocumentsController,
    EdiOrderDocumentsController,
    EdiLoadDocumentsController,
    EdiGenerationController,
    EdiSendController,
    EdiMappingsController,
    EdiQueueController,
  ],
  providers: [
    PrismaService,
    TradingPartnersService,
    EdiDocumentsService,
    EdiGenerationService,
    EdiMappingsService,
    EdiQueueService,
    EdiParserService,
    EdiControlNumberService,
    Edi204Generator,
    Edi210Generator,
    Edi214Generator,
    Edi990Generator,
    Edi997Generator,
    FtpTransport,
    SftpTransport,
    As2Transport,
  ],
  exports: [EdiDocumentsService, EdiGenerationService, EdiMappingsService, EdiQueueService],
})
export class EdiModule {}
