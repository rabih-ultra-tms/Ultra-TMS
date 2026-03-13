import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CommandCenterController } from './command-center.controller';
import { CommandCenterService } from './command-center.service';

@Module({
  controllers: [CommandCenterController],
  providers: [CommandCenterService, PrismaService],
  exports: [CommandCenterService],
})
export class CommandCenterModule {}
