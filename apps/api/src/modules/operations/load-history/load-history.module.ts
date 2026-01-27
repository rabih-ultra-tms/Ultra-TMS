import { Module } from '@nestjs/common';
import { LoadHistoryService } from './load-history.service';
import { LoadHistoryController } from './load-history.controller';
import { PrismaService } from '../../../prisma.service';

@Module({
  controllers: [LoadHistoryController],
  providers: [LoadHistoryService, PrismaService],
  exports: [LoadHistoryService],
})
export class LoadHistoryModule {}
