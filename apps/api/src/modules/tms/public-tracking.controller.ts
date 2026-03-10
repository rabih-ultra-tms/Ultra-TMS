import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';
import { TrackingService } from './tracking.service';

@Controller('public/tracking')
@ApiTags('Public Tracking')
@Public()
export class PublicTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':trackingCode')
  @Throttle({ long: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get public shipment tracking data (no auth required)',
  })
  @ApiParam({
    name: 'trackingCode',
    description: 'Load number / tracking code (e.g. LD-202602-00145)',
  })
  @ApiStandardResponse('Public tracking data')
  @ApiErrorResponses()
  async getPublicTracking(@Param('trackingCode') trackingCode: string) {
    const result =
      await this.trackingService.getPublicTrackingByCode(trackingCode);
    if (!result) {
      throw new NotFoundException('Shipment not found');
    }
    return { data: result };
  }
}
