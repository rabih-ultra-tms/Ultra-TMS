import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { TruckTypesService } from './truck-types.service';

@ApiTags('Operations - Truck Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operations/truck-types')
export class TruckTypesController {
  constructor(private truckTypesService: TruckTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all truck types' })
  @ApiResponse({ status: 200, description: 'Truck types retrieved' })
  async listTruckTypes(@Query('category') category?: string) {
    return this.truckTypesService.list(category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all truck type categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories() {
    return this.truckTypesService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get truck type by ID' })
  @ApiResponse({ status: 200, description: 'Truck type retrieved' })
  async getTruckType(@Param('id') id: string) {
    return this.truckTypesService.getById(id);
  }
}
