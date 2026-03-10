import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { EntitySearchService } from './entity-search.service';
import { EntitySearchDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Entity Search')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP', 'ACCOUNTING', 'CARRIER_MANAGER', 'AGENT')
export class EntitySearchController {
  constructor(private readonly entitySearchService: EntitySearchService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Search orders' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Order search results')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  searchOrders(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'orders', query);
  }

  @Get('loads')
  @ApiOperation({ summary: 'Search loads' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Load search results')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  searchLoads(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'loads', query);
  }

  @Get('companies')
  @ApiOperation({ summary: 'Search companies' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Company search results')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  searchCompanies(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'companies', query);
  }

  @Get('carriers')
  @ApiOperation({ summary: 'Search carriers' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Carrier search results')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  searchCarriers(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'carriers', query);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Search contacts' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Contact search results')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  searchContacts(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'contacts', query);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Search invoices' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Invoice search results')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  searchInvoices(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'invoices', query);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Search documents' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Document search results')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  searchDocuments(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'documents', query);
  }
}
