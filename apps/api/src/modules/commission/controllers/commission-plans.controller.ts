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
import { CommissionPlansService } from '../services';
import { CreateCommissionPlanDto, UpdateCommissionPlanDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('commission/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionPlansController {
  constructor(private readonly plansService: CommissionPlansService) {}

  @Post()
  @Roles('ADMIN')
  create(@Request() req: any, @Body() createDto: CreateCommissionPlanDto) {
    return this.plansService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER')
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.plansService.findAll(req.user.tenantId, status);
  }

  @Get('active')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER')
  getActive(@Request() req: any) {
    return this.plansService.getActive(req.user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.plansService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateCommissionPlanDto
  ) {
    return this.plansService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.plansService.remove(req.user.tenantId, id);
  }
}
