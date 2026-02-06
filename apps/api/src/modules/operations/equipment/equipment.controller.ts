import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { EquipmentService } from './equipment.service';
import {
  GetModelsQueryDto,
  GetModelsWithAvailabilityQueryDto,
  GetDimensionsQueryDto,
  GetRatesQueryDto,
  SearchEquipmentQueryDto,
  UpdateEquipmentImagesDto,
} from './dto/equipment.dto';

@ApiTags('Operations - Equipment')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('operations/equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get('makes')
  @ApiOperation({ summary: 'Get equipment makes' })
  @ApiResponse({ status: 200, description: 'Equipment makes retrieved' })
  async getMakes() {
    const data = await this.equipmentService.getMakes();
    return { data };
  }

  @Get('models')
  @ApiOperation({ summary: 'Get equipment models for a make' })
  @ApiResponse({ status: 200, description: 'Equipment models retrieved' })
  async getModels(@Query() query: GetModelsQueryDto) {
    const data = await this.equipmentService.getModels(query.makeId);
    return { data };
  }

  @Get('models-availability')
  @ApiOperation({ summary: 'Get equipment models with availability flags' })
  @ApiResponse({ status: 200, description: 'Equipment models availability retrieved' })
  async getModelsWithAvailability(@Query() query: GetModelsWithAvailabilityQueryDto) {
    const data = await this.equipmentService.getModelsWithAvailability(query.makeId, query.location);
    return { data };
  }

  @Get('dimensions')
  @ApiOperation({ summary: 'Get equipment dimensions for a model' })
  @ApiResponse({ status: 200, description: 'Equipment dimensions retrieved' })
  async getDimensions(@Query() query: GetDimensionsQueryDto) {
    const data = await this.equipmentService.getDimensions(query.modelId);
    return { data };
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get equipment rates for a model and location' })
  @ApiResponse({ status: 200, description: 'Equipment rates retrieved' })
  async getRates(@Query() query: GetRatesQueryDto) {
    const data = await this.equipmentService.getRates(query.modelId, query.location);
    return { data };
  }

  @Get('rates/all')
  @ApiOperation({ summary: 'Get all equipment rates for a model' })
  @ApiResponse({ status: 200, description: 'Equipment rates retrieved' })
  async getAllRates(@Query() query: GetDimensionsQueryDto) {
    const data = await this.equipmentService.getAllRatesForModel(query.modelId);
    return { data };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search equipment makes and models' })
  @ApiResponse({ status: 200, description: 'Equipment search results retrieved' })
  async search(@Query() query: SearchEquipmentQueryDto) {
    const data = await this.equipmentService.search(query.query);
    return { data };
  }

  @Patch('images')
  @ApiOperation({ summary: 'Update equipment images' })
  @ApiResponse({ status: 200, description: 'Equipment images updated' })
  async updateImages(@Body() body: UpdateEquipmentImagesDto) {
    return this.equipmentService.updateImages(body.modelId, body.frontImageUrl, body.sideImageUrl);
  }
}
