import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser, Roles } from '../../../common/decorators';
import { UpdateSystemConfigDto } from '../dto';
import { SystemConfigService } from './system-config.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('config/system')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class SystemConfigController {
  constructor(private readonly service: SystemConfigService) {}

  @Get()
  @ApiOperation({ summary: 'List system configuration' })
  @ApiStandardResponse('System configuration list')
  @ApiErrorResponses()
  list() {
    return this.service.list();
  }

  @Get('categories')
  @ApiOperation({ summary: 'List system config categories' })
  @ApiStandardResponse('System config categories')
  @ApiErrorResponses()
  categories() {
    return this.service.categories();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get system config value' })
  @ApiParam({ name: 'key', description: 'Config key' })
  @ApiStandardResponse('System config value')
  @ApiErrorResponses()
  get(@Param('key') key: string) {
    return this.service.get(key);
  }

  @Put(':key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update system config value' })
  @ApiParam({ name: 'key', description: 'Config key' })
  @ApiStandardResponse('System config updated')
  @ApiErrorResponses()
  update(@Param('key') key: string, @Body() dto: UpdateSystemConfigDto, @CurrentUser('id') userId: string) {
    return this.service.update(key, dto, userId);
  }

  @Post('validate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Validate system config value' })
  @ApiStandardResponse('System config validation result')
  @ApiErrorResponses()
  validate(@Body() dto: { key: string; value: unknown }) {
    return this.service.validate(dto.key, dto.value);
  }
}
