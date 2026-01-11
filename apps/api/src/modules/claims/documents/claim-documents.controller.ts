import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimDocumentsService } from './claim-documents.service';
import { CreateClaimDocumentDto } from './dto/create-claim-document.dto';

@Controller('claims/:claimId/documents')
@UseGuards(JwtAuthGuard)
export class ClaimDocumentsController {
  constructor(private readonly claimDocumentsService: ClaimDocumentsService) {}

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.claimDocumentsService.list(tenantId, claimId);
  }

  @Post()
  async add(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimDocumentDto,
  ) {
    return this.claimDocumentsService.add(tenantId, user.id, claimId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('id') id: string,
  ) {
    return this.claimDocumentsService.remove(tenantId, user.id, claimId, id);
  }
}
