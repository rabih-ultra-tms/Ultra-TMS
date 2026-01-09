import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { QuotesService } from './quotes.service';
import { RateContractsService } from './rate-contracts.service';
import { QuotesController } from './quotes.controller';
import { RateContractsController } from './rate-contracts.controller';

@Module({
  controllers: [QuotesController, RateContractsController],
  providers: [PrismaService, QuotesService, RateContractsService],
  exports: [QuotesService, RateContractsService],
})
export class SalesModule {}
