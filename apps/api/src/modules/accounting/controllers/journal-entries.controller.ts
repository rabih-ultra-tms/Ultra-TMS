import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JournalEntriesService } from '../services';
import { CreateJournalEntryDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @ApiOperation({ summary: 'Create journal entry' })
  @ApiStandardResponse('Journal entry created')
  @ApiErrorResponses()
  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.journalEntriesService.create(tenantId, userId, dto);
  }

  @ApiOperation({ summary: 'List journal entries' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  @ApiStandardResponse('Journal entries list')
  @ApiErrorResponses()
  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('referenceType') referenceType?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.journalEntriesService.findAll(tenantId, {
      status,
      referenceType,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('account-ledger/:accountId')
  @ApiOperation({ summary: 'Get account ledger' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiStandardResponse('Account ledger')
  @ApiErrorResponses()
  async getAccountLedger(
    @Param('accountId') accountId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.journalEntriesService.getAccountLedger(tenantId, accountId);
  }

  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiStandardResponse('Journal entry details')
  @ApiErrorResponses()
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.journalEntriesService.findOne(id, tenantId);
  }

  @ApiOperation({ summary: 'Update journal entry' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiStandardResponse('Journal entry updated')
  @ApiErrorResponses()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: Partial<CreateJournalEntryDto>,
  ) {
    return this.journalEntriesService.update(id, tenantId, dto);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post journal entry' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiStandardResponse('Journal entry posted')
  @ApiErrorResponses()
  async post(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.journalEntriesService.post(id, tenantId, userId);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void journal entry' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiStandardResponse('Journal entry voided')
  @ApiErrorResponses()
  async voidEntry(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.journalEntriesService.void(id, tenantId, userId);
  }
}
