import { Module } from '@nestjs/common';
import { LoadPlannerQuotesController } from './load-planner-quotes.controller';
import { LoadPlannerQuotesService } from './load-planner-quotes.service';
import { PrismaService } from '../../../prisma.service';

@Module({
  controllers: [LoadPlannerQuotesController],
  providers: [LoadPlannerQuotesService, PrismaService],
  exports: [LoadPlannerQuotesService],
})
export class LoadPlannerQuotesModule {}
