import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { CannedResponsesService } from './canned-responses.service';
import { CreateCannedResponseDto, UpdateCannedResponseDto } from '../dto/help-desk.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('support/canned-responses')
@UseGuards(JwtAuthGuard)
@ApiTags('FAQ')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class CannedResponsesController {
  constructor(private readonly cannedResponsesService: CannedResponsesService) {}

  @Get()
  @ApiOperation({ summary: 'List canned responses' })
  @ApiStandardResponse('Canned responses list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string) {
    return this.cannedResponsesService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create canned response' })
  @ApiStandardResponse('Canned response created')
  @ApiErrorResponses()
  @Roles('admin')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCannedResponseDto,
  ) {
    return this.cannedResponsesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update canned response' })
  @ApiParam({ name: 'id', description: 'Response ID' })
  @ApiStandardResponse('Canned response updated')
  @ApiErrorResponses()
  @Roles('admin')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCannedResponseDto,
  ) {
    return this.cannedResponsesService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete canned response' })
  @ApiParam({ name: 'id', description: 'Response ID' })
  @ApiStandardResponse('Canned response deleted')
  @ApiErrorResponses()
  @Roles('admin')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.cannedResponsesService.remove(tenantId, id);
  }
}
