import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  LoadPostingsService,
  LoadBidsService,
  LoadTendersService,
} from './services';
import {
  LoadPostingsController,
  LoadBidsController,
  LoadTendersController,
} from './controllers';

@Module({
  controllers: [LoadPostingsController, LoadBidsController, LoadTendersController],
  providers: [PrismaService, LoadPostingsService, LoadBidsService, LoadTendersService],
  exports: [LoadPostingsService, LoadBidsService, LoadTendersService],
})
export class LoadBoardModule {}
