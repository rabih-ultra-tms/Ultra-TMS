import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import { UpdateSystemConfigDto } from '../dto';
import { SystemConfigService } from './system-config.service';

@Controller('config/system')
@UseGuards(JwtAuthGuard)
export class SystemConfigController {
  constructor(private readonly service: SystemConfigService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get('categories')
  categories() {
    return this.service.categories();
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.service.get(key);
  }

  @Put(':key')
  update(@Param('key') key: string, @Body() dto: UpdateSystemConfigDto, @CurrentUser('id') userId: string) {
    return this.service.update(key, dto, userId);
  }

  @Post('validate')
  validate(@Body() dto: { key: string; value: unknown }) {
    return this.service.validate(dto.key, dto.value);
  }
}
