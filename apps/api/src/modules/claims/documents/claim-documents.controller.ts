import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimDocumentsService } from './claim-documents.service';
import { CreateClaimDocumentDto } from './dto/create-claim-document.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('claims/:claimId/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Claim Documents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
export class ClaimDocumentsController {
  constructor(private readonly claimDocumentsService: ClaimDocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List claim documents' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim documents list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.claimDocumentsService.list(tenantId, claimId);
  }

  @Post()
  @ApiOperation({ summary: 'Add claim document' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim document added')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async add(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimDocumentDto,
  ) {
    return this.claimDocumentsService.add(tenantId, user.id, claimId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete claim document' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Claim document deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
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
