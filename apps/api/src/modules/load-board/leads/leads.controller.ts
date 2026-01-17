import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { LeadsService } from './leads.service';
import {
  AssignLeadDto,
  ContactLeadDto,
  ConvertLeadDto,
  LeadQueryDto,
  QualifyLeadDto,
  UpdateLeadDto,
} from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('api/v1/load-board/leads')
  @ApiOperation({ summary: 'List load board leads' })
  @ApiStandardResponse('Load board leads list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @Query() query: LeadQueryDto) {
    return this.leadsService.list(tenantId, query);
  }

  @Get('api/v1/load-board/leads/:id')
  @ApiOperation({ summary: 'Get load board lead by ID' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Load board lead details')
  @ApiErrorResponses()
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Put('api/v1/load-board/leads/:id')
  @ApiOperation({ summary: 'Update load board lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Load board lead updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/assign')
  @ApiOperation({ summary: 'Assign load board lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Load board lead assigned')
  @ApiErrorResponses()
  assign(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: AssignLeadDto) {
    return this.leadsService.assign(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/contact')
  @ApiOperation({ summary: 'Contact load board lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Load board lead contacted')
  @ApiErrorResponses()
  contact(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ContactLeadDto) {
    return this.leadsService.contact(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/qualify')
  @ApiOperation({ summary: 'Qualify load board lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Load board lead qualified')
  @ApiErrorResponses()
  qualify(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: QualifyLeadDto) {
    return this.leadsService.qualify(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/convert')
  @ApiOperation({ summary: 'Convert load board lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Load board lead converted')
  @ApiErrorResponses()
  convert(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ConvertLeadDto) {
    return this.leadsService.convert(tenantId, id, dto);
  }
}
