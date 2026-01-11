import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { FileClaimDto } from './dto/file-claim.dto';
import { AssignClaimDto } from './dto/assign-claim.dto';
import { QueryClaimsDto } from './dto/query-claims.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateClaimDto,
  ) {
    return this.claimsService.create(tenantId, user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryClaimsDto,
  ) {
    return this.claimsService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.claimsService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claimsService.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.claimsService.delete(tenantId, user.id, id);
  }

  @Post(':id/file')
  @HttpCode(HttpStatus.OK)
  async fileClaim(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: FileClaimDto,
  ) {
    return this.claimsService.fileClaim(tenantId, user.id, id, dto);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assign(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AssignClaimDto,
  ) {
    return this.claimsService.assign(tenantId, user.id, id, dto);
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    return this.claimsService.updateStatus(tenantId, user.id, id, dto);
  }
}
