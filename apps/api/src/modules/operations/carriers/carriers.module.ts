import { Module } from '@nestjs/common';
import { CarriersController } from './carriers.controller';
import { CarriersService } from './carriers.service';
import { PrismaService } from '../../../prisma.service';

@Module({
  controllers: [CarriersController],
  providers: [CarriersService, PrismaService],
  exports: [CarriersService],
})
export class CarriersModule {}
