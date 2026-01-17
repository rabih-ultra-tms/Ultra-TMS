import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('communication/preferences')
@UseGuards(JwtAuthGuard)
@ApiTags('Communication')
@ApiBearerAuth('JWT-auth')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get communication preferences' })
  @ApiStandardResponse('Preferences')
  @ApiErrorResponses()
  async get(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.preferencesService.get(tenantId, userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update communication preferences' })
  @ApiStandardResponse('Preferences updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.preferencesService.update(tenantId, userId, dto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset communication preferences' })
  @ApiStandardResponse('Preferences reset')
  @ApiErrorResponses()
  async reset(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.preferencesService.reset(tenantId, userId);
  }
}
