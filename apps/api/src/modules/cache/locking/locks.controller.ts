import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { DistributedLockService } from './distributed-lock.service';

@Controller('cache/locks')
@UseGuards(JwtAuthGuard)
export class LocksController {
  constructor(private readonly locks: DistributedLockService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.locks.listActive(tenantId);
  }

  @Get('history/all')
  history(@Query('key') key?: string) {
    return this.locks.history(key);
  }

  @Get(':key')
  details(@Param('key') key: string) {
    return this.locks.lockDetails(key);
  }

  @Delete(':key')
  forceRelease(@Param('key') key: string) {
    return this.locks.forceRelease(key);
  }
}
