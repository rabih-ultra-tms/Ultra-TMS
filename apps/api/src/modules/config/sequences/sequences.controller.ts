import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { UpdateNumberSequenceDto } from '../dto';
import { SequencesService } from './sequences.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('config/sequences')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class SequencesController {
  constructor(private readonly service: SequencesService) {}

  @Get()
  @ApiOperation({ summary: 'List number sequences' })
  @ApiStandardResponse('Number sequences list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Put(':type')
  @ApiOperation({ summary: 'Update number sequence' })
  @ApiParam({ name: 'type', description: 'Sequence type' })
  @ApiStandardResponse('Number sequence updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('type') type: string,
    @Body() dto: UpdateNumberSequenceDto,
  ) {
    return this.service.update(tenantId, type, dto);
  }

  @Post(':type/next')
  @ApiOperation({ summary: 'Get next sequence number' })
  @ApiParam({ name: 'type', description: 'Sequence type' })
  @ApiStandardResponse('Next sequence number')
  @ApiErrorResponses()
  next(@CurrentTenant() tenantId: string, @Param('type') type: string) {
    return this.service.next(tenantId, type);
  }
}
