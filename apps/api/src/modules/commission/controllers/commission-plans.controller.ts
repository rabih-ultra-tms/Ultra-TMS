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

@Controller('commission/plans')
@UseGuards(JwtAuthGuard)
export class CommissionPlansController {
  constructor(private readonly plansService: CommissionPlansService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateCommissionPlanDto) {
    return this.plansService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.plansService.findAll(req.user.tenantId, status);
  }

  @Get('active')
  getActive(@Request() req: any) {
    return this.plansService.getActive(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.plansService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateCommissionPlanDto
  ) {
    return this.plansService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.plansService.remove(req.user.tenantId, id);
  }
}
