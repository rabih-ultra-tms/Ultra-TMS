import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommissionPlansService } from '../services';
import { CreateCommissionPlanDto, UpdateCommissionPlanDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('commissions/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Commission')
@ApiBearerAuth('JWT-auth')
export class CommissionPlansController {
  constructor(private readonly plansService: CommissionPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create commission plan' })
  @ApiStandardResponse('Commission plan created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  create(@Request() req: any, @Body() createDto: CreateCommissionPlanDto) {
    return this.plansService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'List commission plans' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiStandardResponse('Commission plans list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER')
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.plansService.findAll(req.user.tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status,
      type,
      isActive,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'List active commission plans' })
  @ApiStandardResponse('Active commission plans list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER')
  getActive(@Request() req: any) {
    return this.plansService.getActive(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get commission plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiStandardResponse('Commission plan details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.plansService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update commission plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiStandardResponse('Commission plan updated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateCommissionPlanDto
  ) {
    return this.plansService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete commission plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiStandardResponse('Commission plan deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.plansService.remove(req.user.tenantId, id);
  }
}
