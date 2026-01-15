import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierScopeGuard } from '../guards/carrier-scope.guard';
import { CarrierPortalComplianceService } from './carrier-portal-compliance.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CarrierScope } from '../decorators/carrier-scope.decorator';
import type { CarrierScopeType } from '../decorators/carrier-scope.decorator';

@UseGuards(CarrierPortalAuthGuard, CarrierScopeGuard)
@Controller('carrier-portal/compliance')
@ApiTags('Carrier Portal')
@ApiBearerAuth('Portal-JWT')
export class CarrierPortalComplianceController {
  constructor(private readonly complianceService: CarrierPortalComplianceService) {}

  @Get()
  @ApiOperation({ summary: 'Get compliance status' })
  @ApiStandardResponse('Compliance status')
  @ApiErrorResponses()
  status(@CarrierScope() scope: CarrierScopeType) {
    return this.complianceService.status(scope.tenantId, scope.id);
  }

  @Get('documents')
  @ApiOperation({ summary: 'List required compliance documents' })
  @ApiStandardResponse('Required compliance documents')
  @ApiErrorResponses()
  required() {
    return this.complianceService.requiredDocs();
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload compliance document' })
  @ApiStandardResponse('Compliance document uploaded')
  @ApiErrorResponses()
  upload(@Body() body: any, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.complianceService.upload(scope.tenantId, scope.id, req.carrierPortalUser.id, body);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get compliance document status' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Compliance document status')
  @ApiErrorResponses()
  doc(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.complianceService.docStatus(scope.tenantId, scope.id, id);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring compliance documents' })
  @ApiStandardResponse('Expiring compliance documents')
  @ApiErrorResponses()
  expiring(@CarrierScope() scope: CarrierScopeType) {
    return this.complianceService.expiring(scope.tenantId, scope.id);
  }
}