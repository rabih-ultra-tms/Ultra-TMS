import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AddDqfDocumentDto } from './dto/add-dqf-document.dto';
import { CreateDqfDto } from './dto/create-dqf.dto';
import { UpdateDqfDto } from './dto/update-dqf.dto';
import { DqfService } from './dqf.service';

@Controller('safety/dqf')
@UseGuards(JwtAuthGuard)
export class DqfController {
  constructor(private readonly service: DqfService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDqfDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get(':id')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDqfDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }

  @Get(':id/compliance')
  compliance(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.compliance(tenantId, id);
  }

  @Post(':id/documents')
  addDocument(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddDqfDocumentDto,
  ) {
    return this.service.addDocument(tenantId, userId, id, dto);
  }
}
