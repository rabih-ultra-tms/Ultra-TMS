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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreditApplicationsService } from './credit-applications.service';
import { CreateCreditApplicationDto, UpdateCreditApplicationDto } from '../dto/create-application.dto';
import { ApproveCreditApplicationDto } from '../dto/approve-application.dto';
import { RejectCreditApplicationDto } from '../dto/reject-application.dto';
import { CreditApplicationQueryDto } from '../dto/application-query.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('credit/applications')
@UseGuards(JwtAuthGuard)
@ApiTags('Credit Applications')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CREDIT_ANALYST')
export class CreditApplicationsController {
  constructor(private readonly creditApplicationsService: CreditApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create credit application' })
  @ApiStandardResponse('Credit application created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCreditApplicationDto,
  ) {
    return this.creditApplicationsService.create(tenantId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List credit applications' })
  @ApiStandardResponse('Credit applications list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: CreditApplicationQueryDto,
  ) {
    return this.creditApplicationsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiStandardResponse('Credit application details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.creditApplicationsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update credit application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiStandardResponse('Credit application updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCreditApplicationDto,
  ) {
    return this.creditApplicationsService.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete credit application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiStandardResponse('Credit application deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.creditApplicationsService.delete(tenantId, user.id, id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit credit application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiStandardResponse('Credit application submitted')
  @ApiErrorResponses()
  @HttpCode(HttpStatus.OK)
  async submit(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.creditApplicationsService.submit(tenantId, id, user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve credit application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiStandardResponse('Credit application approved')
  @ApiErrorResponses()
  @Roles('ADMIN')
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
  @ApiOperation({ summary: 'Reject credit application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiStandardResponse('Credit application rejected')
  @ApiErrorResponses()
  @Roles('ADMIN')
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
