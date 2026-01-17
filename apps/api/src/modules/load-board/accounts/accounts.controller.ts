import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AccountsService } from './accounts.service';
import { AccountQueryDto, CreateAccountDto, UpdateAccountDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('load-board/accounts')
@UseGuards(JwtAuthGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List load board accounts' })
  @ApiStandardResponse('Load board accounts list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @Query() query: AccountQueryDto) {
    return this.accountsService.list(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create load board account' })
  @ApiStandardResponse('Load board account created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get load board account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiStandardResponse('Load board account details')
  @ApiErrorResponses()
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accountsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update load board account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiStandardResponse('Load board account updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete load board account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiStandardResponse('Load board account deleted')
  @ApiErrorResponses()
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accountsService.remove(tenantId, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test load board account connection' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiStandardResponse('Load board account connection tested')
  @ApiErrorResponses()
  test(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accountsService.testConnection(tenantId, id);
  }
}
