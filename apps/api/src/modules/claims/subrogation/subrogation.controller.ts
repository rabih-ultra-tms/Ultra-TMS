import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SubrogationService } from './subrogation.service';
import { CreateSubrogationDto } from './dto/create-subrogation.dto';
import { UpdateSubrogationDto } from './dto/update-subrogation.dto';
import { RecoverSubrogationDto } from './dto/recover-subrogation.dto';

@Controller('claims/:claimId/subrogation')
@UseGuards(JwtAuthGuard)
export class SubrogationController {
  constructor(private readonly subrogationService: SubrogationService) {}

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.subrogationService.list(tenantId, claimId);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
    @Param('id') id: string,
  ) {
    return this.subrogationService.findOne(tenantId, claimId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateSubrogationDto,
  ) {
    return this.subrogationService.create(tenantId, user.id, claimId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubrogationDto,
  ) {
    return this.subrogationService.update(tenantId, user.id, claimId, id, dto);
  }

  @Post(':id/recover')
  @HttpCode(HttpStatus.OK)
  async recover(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('id') id: string,
    @Body() dto: RecoverSubrogationDto,
  ) {
    return this.subrogationService.recover(tenantId, user.id, claimId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('id') id: string,
  ) {
    return this.subrogationService.remove(tenantId, user.id, claimId, id);
  }
}
