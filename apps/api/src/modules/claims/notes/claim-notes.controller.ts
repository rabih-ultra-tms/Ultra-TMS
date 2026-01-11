import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimNotesService } from './claim-notes.service';
import { CreateClaimNoteDto } from './dto/create-claim-note.dto';
import { UpdateClaimNoteDto } from './dto/update-claim-note.dto';

@Controller('claims/:claimId/notes')
@UseGuards(JwtAuthGuard)
export class ClaimNotesController {
  constructor(private readonly claimNotesService: ClaimNotesService) {}

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.claimNotesService.list(tenantId, claimId);
  }

  @Get(':noteId')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.claimNotesService.findOne(tenantId, claimId, noteId);
  }

  @Post()
  async add(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimNoteDto,
  ) {
    return this.claimNotesService.add(tenantId, user.id, claimId, dto);
  }

  @Put(':noteId')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateClaimNoteDto,
  ) {
    return this.claimNotesService.update(tenantId, user.id, claimId, noteId, dto);
  }

  @Delete(':noteId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.claimNotesService.remove(tenantId, user.id, claimId, noteId);
  }
}
