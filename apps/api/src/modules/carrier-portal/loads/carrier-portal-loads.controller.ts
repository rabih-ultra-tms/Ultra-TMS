import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierPortalLoadsService } from './carrier-portal-loads.service';
import { UpdateLoadStatusDto } from './dto/update-load-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SubmitBidDto } from './dto/submit-bid.dto';

@UseGuards(CarrierPortalAuthGuard)
@Controller('carrier-portal')
export class CarrierPortalLoadsController {
  constructor(private readonly loadsService: CarrierPortalLoadsService) {}

  // Available loads
  @Get('loads/available')
  available(@Req() req: any) {
    return this.loadsService.available(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id);
  }

  @Get('loads/available/:id')
  availableDetail(@Param('id') id: string, @Req() req: any) {
    return this.loadsService.availableDetail(req.carrierPortalUser.tenantId, id);
  }

  @Post('loads/available/:id/save')
  save(@Param('id') id: string, @Req() req: any) {
    return this.loadsService.saveLoad(req.carrierPortalUser.tenantId, req.carrierPortalUser.id, id);
  }

  @Delete('loads/saved/:id')
  removeSaved(@Param('id') id: string, @Req() req: any) {
    return this.loadsService.removeSaved(req.carrierPortalUser.tenantId, req.carrierPortalUser.id, id);
  }

  @Get('loads/saved')
  saved(@Req() req: any) {
    return this.loadsService.saved(req.carrierPortalUser.tenantId, req.carrierPortalUser.id);
  }

  @Post('loads/:id/bid')
  bid(@Param('id') id: string, @Body() dto: SubmitBidDto, @Req() req: any) {
    return this.loadsService.bid(
      req.carrierPortalUser.tenantId,
      req.carrierPortalUser.carrierId,
      req.carrierPortalUser.id,
      id,
      dto,
    );
  }

  @Get('loads/matching')
  matching(@Req() req: any) {
    return this.loadsService.matching(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id);
  }

  // My loads
  @Get('loads')
  myLoads(@Req() req: any) {
    return this.loadsService.myLoads(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Get('loads/:id')
  myLoad(@Param('id') id: string, @Req() req: any) {
    return this.loadsService.myLoadDetail(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Post('loads/:id/accept')
  accept(@Param('id') id: string, @Req() req: any) {
    return this.loadsService.accept(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Post('loads/:id/decline')
  decline(@Param('id') id: string, @Req() req: any) {
    return this.loadsService.decline(req.carrierPortalUser.tenantId, id);
  }

  @Post('loads/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLoadStatusDto, @Req() req: any) {
    return this.loadsService.updateStatus(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id, dto);
  }

  @Post('loads/:id/location')
  updateLocation(@Param('id') id: string, @Body() body: UpdateLocationDto, @Req() req: any) {
    return this.loadsService.updateLocation(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id, body);
  }

  @Post('loads/:id/eta')
  updateEta(@Param('id') id: string, @Body('eta') eta: string, @Req() req: any) {
    return this.loadsService.updateEta(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id, eta);
  }

  @Post('loads/:id/message')
  message(@Param('id') id: string, @Body('message') message: string, @Req() req: any) {
    return this.loadsService.message(
      req.carrierPortalUser.tenantId,
      req.carrierPortalUser.carrierId,
      req.carrierPortalUser.id,
      id,
      message,
    );
  }
}