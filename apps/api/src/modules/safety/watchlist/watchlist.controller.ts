import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { ResolveWatchlistDto } from './dto/resolve-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';
import { WatchlistService } from './watchlist.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/watchlist')
@UseGuards(JwtAuthGuard)
@ApiTags('Safety Scores')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class WatchlistController {
  constructor(private readonly service: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: 'List safety watchlist entries' })
  @ApiStandardResponse('Watchlist entries')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Add to safety watchlist' })
  @ApiStandardResponse('Watchlist entry created')
  @ApiErrorResponses()
  @Roles('admin')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWatchlistDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update watchlist entry' })
  @ApiParam({ name: 'id', description: 'Watchlist ID' })
  @ApiStandardResponse('Watchlist entry updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWatchlistDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve watchlist entry' })
  @ApiParam({ name: 'id', description: 'Watchlist ID' })
  @ApiStandardResponse('Watchlist entry resolved')
  @ApiErrorResponses()
  @Roles('admin')
  resolve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ResolveWatchlistDto,
  ) {
    return this.service.resolve(tenantId, userId, id, dto);
  }
}
