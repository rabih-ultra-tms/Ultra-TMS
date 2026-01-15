import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FactoringVerificationsService } from './factoring-verifications.service';
import { CreateFactoringVerificationDto } from './dto/create-verification.dto';
import { RespondToVerificationDto } from './dto/respond-verification.dto';
import { VerificationQueryDto } from './dto/verification-query.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('factoring-verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Factoring Requests')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING', 'BILLING')
export class FactoringVerificationsController {
  constructor(private readonly service: FactoringVerificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List factoring verifications' })
  @ApiStandardResponse('Factoring verifications list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: VerificationQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending factoring verifications' })
  @ApiStandardResponse('Pending verifications list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  async pending(
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.getPending(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create factoring verification' })
  @ApiStandardResponse('Factoring verification created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING', 'BILLING')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFactoringVerificationDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get factoring verification by ID' })
  @ApiParam({ name: 'id', description: 'Verification ID' })
  @ApiStandardResponse('Factoring verification details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Respond to factoring verification' })
  @ApiParam({ name: 'id', description: 'Verification ID' })
  @ApiStandardResponse('Factoring verification response recorded')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING', 'BILLING')
  async respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: RespondToVerificationDto,
  ) {
    return this.service.respond(tenantId, user.id, id, dto);
  }

  @Get('/loads/:loadId/verification')
  @ApiOperation({ summary: 'Get factoring verification by load' })
  @ApiParam({ name: 'loadId', description: 'Load ID' })
  @ApiStandardResponse('Factoring verification details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  async getByLoad(
    @CurrentTenant() tenantId: string,
    @Param('loadId') loadId: string,
  ) {
    return this.service.getByLoad(tenantId, loadId);
  }
}
