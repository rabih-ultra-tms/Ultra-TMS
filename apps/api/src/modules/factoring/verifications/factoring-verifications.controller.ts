import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FactoringVerificationsService } from './factoring-verifications.service';
import { CreateFactoringVerificationDto } from './dto/create-verification.dto';
import { RespondToVerificationDto } from './dto/respond-verification.dto';
import { VerificationQueryDto } from './dto/verification-query.dto';

@Controller('factoring-verifications')
@UseGuards(JwtAuthGuard)
export class FactoringVerificationsController {
  constructor(private readonly service: FactoringVerificationsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: VerificationQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get('pending')
  async pending(
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.getPending(tenantId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFactoringVerificationDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post(':id/respond')
  async respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: RespondToVerificationDto,
  ) {
    return this.service.respond(tenantId, user.id, id, dto);
  }

  @Get('/loads/:loadId/verification')
  async getByLoad(
    @CurrentTenant() tenantId: string,
    @Param('loadId') loadId: string,
  ) {
    return this.service.getByLoad(tenantId, loadId);
  }
}
