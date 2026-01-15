import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CalculateSafetyScoreDto } from './dto/calculate-score.dto';
import { SafetyScoresService } from './safety-scores.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/scores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Safety Scores')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SAFETY_MANAGER', 'CARRIER_MANAGER', 'DISPATCHER')
export class SafetyScoresController {
  constructor(private readonly service: SafetyScoresService) {}

  @Get(':carrierId')
  @ApiOperation({ summary: 'Get safety score' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Safety score')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'CARRIER_MANAGER', 'DISPATCHER')
  getScore(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getScore(tenantId, carrierId);
  }

  @Get(':carrierId/history')
  @ApiOperation({ summary: 'Get safety score history' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Safety score history')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'CARRIER_MANAGER', 'DISPATCHER')
  history(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.history(tenantId, carrierId);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Recalculate safety scores' })
  @ApiStandardResponse('Safety scores recalculated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  calculate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CalculateSafetyScoreDto,
  ) {
    return this.service.calculate({ ...dto, tenantId, userId });
  }
}
