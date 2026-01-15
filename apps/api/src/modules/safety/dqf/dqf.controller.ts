import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AddDqfDocumentDto } from './dto/add-dqf-document.dto';
import { CreateDqfDto } from './dto/create-dqf.dto';
import { UpdateDqfDto } from './dto/update-dqf.dto';
import { DqfService } from './dqf.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/dqf')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Safety Scores')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SAFETY_MANAGER')
export class DqfController {
  constructor(private readonly service: DqfService) {}

  @Get()
  @ApiOperation({ summary: 'List DQF records' })
  @ApiStandardResponse('DQF records list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create DQF record' })
  @ApiStandardResponse('DQF record created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDqfDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get DQF record by ID' })
  @ApiParam({ name: 'id', description: 'DQF ID' })
  @ApiStandardResponse('DQF record details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update DQF record' })
  @ApiParam({ name: 'id', description: 'DQF ID' })
  @ApiStandardResponse('DQF record updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDqfDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete DQF record' })
  @ApiParam({ name: 'id', description: 'DQF ID' })
  @ApiStandardResponse('DQF record deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }

  @Get(':id/compliance')
  @ApiOperation({ summary: 'Get DQF compliance' })
  @ApiParam({ name: 'id', description: 'DQF ID' })
  @ApiStandardResponse('DQF compliance')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  compliance(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.compliance(tenantId, id);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add DQF document' })
  @ApiParam({ name: 'id', description: 'DQF ID' })
  @ApiStandardResponse('DQF document added')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  addDocument(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddDqfDocumentDto,
  ) {
    return this.service.addDocument(tenantId, userId, id, dto);
  }
}
