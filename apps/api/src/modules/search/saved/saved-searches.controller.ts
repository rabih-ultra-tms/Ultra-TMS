import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto, ShareSavedSearchDto, UpdateSavedSearchDto } from '../dto';

@Controller('searches/saved')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.savedSearchesService.listSaved(tenantId, userId);
  }

  @Get(':id')
  getOne(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.savedSearchesService.getSaved(tenantId, userId, id);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSavedSearchDto,
  ) {
    return this.savedSearchesService.createSaved(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSavedSearchDto,
  ) {
    return this.savedSearchesService.updateSaved(tenantId, userId, id, dto);
  }

  @Delete(':id')
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    await this.savedSearchesService.deleteSaved(tenantId, userId, id);
    return { success: true };
  }

  @Post(':id/execute')
  execute(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.savedSearchesService.executeSaved(tenantId, userId, id);
  }

  @Post(':id/share')
  share(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: ShareSavedSearchDto,
  ) {
    return this.savedSearchesService.shareSaved(tenantId, userId, id, dto);
  }
}
