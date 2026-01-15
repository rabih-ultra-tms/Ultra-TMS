import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimNotesService } from './claim-notes.service';
import { CreateClaimNoteDto } from './dto/create-claim-note.dto';
import { UpdateClaimNoteDto } from './dto/update-claim-note.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('claims/:claimId/notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Claims')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
export class ClaimNotesController {
  constructor(private readonly claimNotesService: ClaimNotesService) {}

  @Get()
  @ApiOperation({ summary: 'List claim notes' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim notes list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.claimNotesService.list(tenantId, claimId);
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Get claim note by ID' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiStandardResponse('Claim note details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.claimNotesService.findOne(tenantId, claimId, noteId);
  }

  @Post()
  @ApiOperation({ summary: 'Create claim note' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim note created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async add(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimNoteDto,
  ) {
    return this.claimNotesService.add(tenantId, user.id, claimId, dto);
  }

  @Put(':noteId')
  @ApiOperation({ summary: 'Update claim note' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiStandardResponse('Claim note updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
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
  @ApiOperation({ summary: 'Delete claim note' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiStandardResponse('Claim note deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
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
