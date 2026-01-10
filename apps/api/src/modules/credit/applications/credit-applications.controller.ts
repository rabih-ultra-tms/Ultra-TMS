import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreditApplicationsService } from './credit-applications.service';
import { CreateCreditApplicationDto, UpdateCreditApplicationDto } from '../dto/create-application.dto';
import { ApproveCreditApplicationDto } from '../dto/approve-application.dto';
import { RejectCreditApplicationDto } from '../dto/reject-application.dto';
import { CreditApplicationQueryDto } from '../dto/application-query.dto';

@Controller('credit/applications')
@UseGuards(JwtAuthGuard)
export class CreditApplicationsController {
  constructor(private readonly creditApplicationsService: CreditApplicationsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCreditApplicationDto,
  ) {
    return this.creditApplicationsService.create(tenantId, user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: CreditApplicationQueryDto,
  ) {
    return this.creditApplicationsService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.creditApplicationsService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCreditApplicationDto,
  ) {
    return this.creditApplicationsService.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.creditApplicationsService.delete(tenantId, user.id, id);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.creditApplicationsService.submit(tenantId, id, user.id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ApproveCreditApplicationDto,
  ) {
    return this.creditApplicationsService.approve(tenantId, id, user.id, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: RejectCreditApplicationDto,
  ) {
    return this.creditApplicationsService.reject(tenantId, id, user.id, dto);
  }
}
