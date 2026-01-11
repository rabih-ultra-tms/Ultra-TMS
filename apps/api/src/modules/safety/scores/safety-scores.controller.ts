import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CalculateSafetyScoreDto } from './dto/calculate-score.dto';
import { SafetyScoresService } from './safety-scores.service';

@Controller('safety/scores')
@UseGuards(JwtAuthGuard)
export class SafetyScoresController {
  constructor(private readonly service: SafetyScoresService) {}

  @Get(':carrierId')
  getScore(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getScore(tenantId, carrierId);
  }

  @Get(':carrierId/history')
  history(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.history(tenantId, carrierId);
  }

  @Post('calculate')
  calculate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CalculateSafetyScoreDto,
  ) {
    return this.service.calculate({ ...dto, tenantId, userId });
  }
}
