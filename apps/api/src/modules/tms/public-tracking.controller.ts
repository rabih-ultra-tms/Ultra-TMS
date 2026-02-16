import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';
import { TrackingService } from './tracking.service';

@Controller('public/tracking')
@ApiTags('Public Tracking')
export class PublicTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':trackingCode')
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
