import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseBoolPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TruckTypesService } from './truck-types.service';
import { CreateTruckTypeDto, UpdateTruckTypeDto } from './truck-types.dto';

@ApiTags('Operations - Truck Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operations/truck-types')
export class TruckTypesController {
  constructor(private truckTypesService: TruckTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all truck types' })
  @ApiResponse({ status: 200, description: 'Truck types retrieved' })
  async listTruckTypes(
    @Query('category') category?: string,
    @Query('loadingMethod') loadingMethod?: string,
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe) includeInactive?: boolean,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
  ) {
    return this.truckTypesService.list({
      category,
      loadingMethod,
      includeInactive,
      search,
      page,
      limit,
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all truck type categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories() {
    return this.truckTypesService.getCategories();
  }

  @Get('category-counts')
  @ApiOperation({ summary: 'Get truck type counts by category' })
  @ApiResponse({ status: 200, description: 'Category counts retrieved' })
  async getCategoryCounts() {
    const counts = await this.truckTypesService.getCategoryCounts();
    return counts;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get truck type by ID' })
  @ApiResponse({ status: 200, description: 'Truck type retrieved' })
  async getTruckType(@Param('id') id: string) {
    const data = await this.truckTypesService.getById(id);
    return { data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Create a new truck type' })
  @ApiResponse({ status: 201, description: 'Truck type created' })
  async createTruckType(@Body() body: CreateTruckTypeDto) {
    const data = await this.truckTypesService.create(body);
    return { data };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Update a truck type' })
  @ApiResponse({ status: 200, description: 'Truck type updated' })
  async updateTruckType(@Param('id') id: string, @Body() body: UpdateTruckTypeDto) {
    const data = await this.truckTypesService.update(id, body);
    return { data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Delete (deactivate) a truck type' })
  @ApiResponse({ status: 200, description: 'Truck type deleted' })
  async deleteTruckType(@Param('id') id: string) {
    await this.truckTypesService.delete(id);
    return { message: 'Truck type deleted successfully' };
  }

  @Patch(':id/restore')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Restore a deleted truck type' })
  @ApiResponse({ status: 200, description: 'Truck type restored' })
  async restoreTruckType(@Param('id') id: string) {
    const data = await this.truckTypesService.restore(id);
    return { data };
  }
}
