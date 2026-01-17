import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ContractTemplatesService } from './contract-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { Roles } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('contract-templates')
@UseGuards(JwtAuthGuard)
@ApiTags('Contract Templates')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER')
export class ContractTemplatesController {
  constructor(private readonly templatesService: ContractTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List contract templates' })
  @ApiStandardResponse('Contract templates list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER')
  list(@CurrentUser() user: CurrentUserData) {
    return this.templatesService.list(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create contract template' })
  @ApiStandardResponse('Contract template created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  create(@Body() dto: CreateTemplateDto, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.create(user.tenantId, user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Contract template details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.detail(user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contract template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Contract template updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Contract template deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.delete(user.tenantId, id);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone contract template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Contract template cloned')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  clone(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.clone(user.tenantId, id, user.userId);
  }
}
