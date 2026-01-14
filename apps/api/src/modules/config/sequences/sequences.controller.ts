import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { UpdateNumberSequenceDto } from '../dto';
import { SequencesService } from './sequences.service';

@Controller('config/sequences')
@UseGuards(JwtAuthGuard)
export class SequencesController {
  constructor(private readonly service: SequencesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Put(':type')
  update(
    @CurrentTenant() tenantId: string,
    @Param('type') type: string,
    @Body() dto: UpdateNumberSequenceDto,
  ) {
    return this.service.update(tenantId, type, dto);
  }

  @Post(':type/next')
  next(@CurrentTenant() tenantId: string, @Param('type') type: string) {
    return this.service.next(tenantId, type);
  }
}
