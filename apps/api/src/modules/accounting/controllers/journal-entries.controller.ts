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
import { JournalEntriesService } from '../services';
import { CreateJournalEntryDto } from '../dto';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.journalEntriesService.create(tenantId, userId, dto);
  }

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
  async getAccountLedger(
    @Param('accountId') accountId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.journalEntriesService.getAccountLedger(tenantId, accountId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.journalEntriesService.findOne(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: Partial<CreateJournalEntryDto>,
  ) {
    return this.journalEntriesService.update(id, tenantId, dto);
  }

  @Post(':id/post')
  async post(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.journalEntriesService.post(id, tenantId, userId);
  }

  @Post(':id/void')
  async voidEntry(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.journalEntriesService.void(id, tenantId, userId);
  }
}
