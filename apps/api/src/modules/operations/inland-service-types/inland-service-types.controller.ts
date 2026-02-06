import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { InlandServiceTypesService } from './inland-service-types.service';

@ApiTags('Operations - Inland Service Types')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('operations/inland-service-types')
export class InlandServiceTypesController {
  constructor(private readonly inlandServiceTypesService: InlandServiceTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List inland service types' })
  @ApiResponse({ status: 200, description: 'Inland service types retrieved' })
  async list() {
    const data = await this.inlandServiceTypesService.list();
    return { data };
  }
}
