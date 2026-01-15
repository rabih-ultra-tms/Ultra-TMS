import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierScopeGuard } from '../guards/carrier-scope.guard';
import { CarrierPortalLoadsService } from './carrier-portal-loads.service';
import { UpdateLoadStatusDto } from './dto/update-load-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SubmitBidDto } from './dto/submit-bid.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CarrierScope } from '../decorators/carrier-scope.decorator';
import type { CarrierScopeType } from '../decorators/carrier-scope.decorator';

@UseGuards(CarrierPortalAuthGuard, CarrierScopeGuard)
@Controller('carrier-portal')
@ApiTags('Carrier Portal')
@ApiBearerAuth('Portal-JWT')
export class CarrierPortalLoadsController {
  constructor(private readonly loadsService: CarrierPortalLoadsService) {}

  // Available loads
  @Get('loads/available')
  @ApiOperation({ summary: 'List available loads' })
  @ApiStandardResponse('Available loads list')
  @ApiErrorResponses()
  available(@CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.loadsService.available(scope.tenantId, scope.id, req.carrierPortalUser.id);
  }

  @Get('loads/available/:id')
  @ApiOperation({ summary: 'Get available load details' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Available load details')
  @ApiErrorResponses()
  availableDetail(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.availableDetail(scope.tenantId, id);
  }

  @Post('loads/available/:id/save')
  @ApiOperation({ summary: 'Save available load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load saved')
  @ApiErrorResponses()
  save(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.loadsService.saveLoad(scope.tenantId, req.carrierPortalUser.id, id);
  }

  @Delete('loads/saved/:id')
  @ApiOperation({ summary: 'Remove saved load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Saved load removed')
  @ApiErrorResponses()
  removeSaved(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.loadsService.removeSaved(scope.tenantId, req.carrierPortalUser.id, id);
  }

  @Get('loads/saved')
  @ApiOperation({ summary: 'List saved loads' })
  @ApiStandardResponse('Saved loads list')
  @ApiErrorResponses()
  saved(@CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.loadsService.saved(scope.tenantId, req.carrierPortalUser.id);
  }

  @Post('loads/:id/bid')
  @ApiOperation({ summary: 'Submit bid for load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Bid submitted')
  @ApiErrorResponses()
  bid(@Param('id') id: string, @Body() dto: SubmitBidDto, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.loadsService.bid(
      scope.tenantId,
      scope.id,
      req.carrierPortalUser.id,
      id,
      dto,
    );
  }

  @Get('loads/matching')
  @ApiOperation({ summary: 'List matching loads' })
  @ApiStandardResponse('Matching loads list')
  @ApiErrorResponses()
  matching(@CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.loadsService.matching(scope.tenantId, scope.id, req.carrierPortalUser.id);
  }

  // My loads
  @Get('loads')
  @ApiOperation({ summary: 'List my loads' })
  @ApiStandardResponse('My loads list')
  @ApiErrorResponses()
  myLoads(@CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.myLoads(scope.tenantId, scope.id);
  }

  @Get('loads/:id')
  @ApiOperation({ summary: 'Get my load by ID' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load details')
  @ApiErrorResponses()
  myLoad(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.myLoadDetail(scope.tenantId, scope.id, id);
  }

  @Post('loads/:id/accept')
  @ApiOperation({ summary: 'Accept load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load accepted')
  @ApiErrorResponses()
  accept(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.accept(scope.tenantId, scope.id, id);
  }

  @Post('loads/:id/decline')
  @ApiOperation({ summary: 'Decline load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load declined')
  @ApiErrorResponses()
  decline(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.decline(scope.tenantId, scope.id, id);
  }

  @Post('loads/:id/status')
  @ApiOperation({ summary: 'Update load status' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load status updated')
  @ApiErrorResponses()
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLoadStatusDto, @CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.updateStatus(scope.tenantId, scope.id, id, dto);
  }

  @Post('loads/:id/location')
  @ApiOperation({ summary: 'Update load location' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load location updated')
  @ApiErrorResponses()
  updateLocation(@Param('id') id: string, @Body() body: UpdateLocationDto, @CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.updateLocation(scope.tenantId, scope.id, id, body);
  }

  @Post('loads/:id/eta')
  @ApiOperation({ summary: 'Update load ETA' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load ETA updated')
  @ApiErrorResponses()
  updateEta(@Param('id') id: string, @Body('eta') eta: string, @CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.updateEta(scope.tenantId, scope.id, id, eta);
  }

  @Post('loads/:id/message')
  @ApiOperation({ summary: 'Send load message' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load message sent')
  @ApiErrorResponses()
  message(@Param('id') id: string, @Body('message') message: string, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.loadsService.message(
      scope.tenantId,
      scope.id,
      req.carrierPortalUser.id,
      id,
      message,
    );
  }
}