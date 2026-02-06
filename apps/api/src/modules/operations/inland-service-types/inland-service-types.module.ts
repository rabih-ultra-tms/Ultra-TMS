import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { InlandServiceTypesController } from './inland-service-types.controller';
import { InlandServiceTypesService } from './inland-service-types.service';

@Module({
  controllers: [InlandServiceTypesController],
  providers: [InlandServiceTypesService, PrismaService],
  exports: [InlandServiceTypesService],
})
export class InlandServiceTypesModule {}
