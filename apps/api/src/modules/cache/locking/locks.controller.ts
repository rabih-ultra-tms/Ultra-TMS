import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { DistributedLockService } from './distributed-lock.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('cache/locks')
@UseGuards(JwtAuthGuard)
@ApiTags('Cache')
@ApiBearerAuth('JWT-auth')
export class LocksController {
  constructor(private readonly locks: DistributedLockService) {}

  @Get()
  @ApiOperation({ summary: 'List active locks' })
  @ApiStandardResponse('Active locks list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.locks.listActive(tenantId);
  }

  @Get('history/all')
  @ApiOperation({ summary: 'Get lock history' })
  @ApiQuery({ name: 'key', required: false, type: String })
  @ApiStandardResponse('Lock history')
  @ApiErrorResponses()
  history(@Query('key') key?: string) {
    return this.locks.history(key);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get lock details' })
  @ApiParam({ name: 'key', description: 'Lock key' })
  @ApiStandardResponse('Lock details')
  @ApiErrorResponses()
  details(@Param('key') key: string) {
    return this.locks.lockDetails(key);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Force release lock' })
  @ApiParam({ name: 'key', description: 'Lock key' })
  @ApiStandardResponse('Lock released')
  @ApiErrorResponses()
  forceRelease(@Param('key') key: string) {
    return this.locks.forceRelease(key);
  }
}
