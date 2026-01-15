import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto, ShareSavedSearchDto, UpdateSavedSearchDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('searches/saved')
@UseGuards(JwtAuthGuard)
@ApiTags('Saved Searches')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved searches' })
  @ApiStandardResponse('Saved searches list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.savedSearchesService.listSaved(tenantId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get saved search by ID' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiStandardResponse('Saved search details')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  getOne(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.savedSearchesService.getSaved(tenantId, userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create saved search' })
  @ApiStandardResponse('Saved search created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSavedSearchDto,
  ) {
    return this.savedSearchesService.createSaved(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update saved search' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiStandardResponse('Saved search updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSavedSearchDto,
  ) {
    return this.savedSearchesService.updateSaved(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete saved search' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiStandardResponse('Saved search deleted')
  @ApiErrorResponses()
  @Roles('manager', 'admin')
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    await this.savedSearchesService.deleteSaved(tenantId, userId, id);
    return { success: true };
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute saved search' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiStandardResponse('Saved search executed')
  @ApiErrorResponses()
  execute(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.savedSearchesService.executeSaved(tenantId, userId, id);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share saved search' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiStandardResponse('Saved search shared')
  @ApiErrorResponses()
  share(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: ShareSavedSearchDto,
  ) {
    return this.savedSearchesService.shareSaved(tenantId, userId, id, dto);
  }
}
