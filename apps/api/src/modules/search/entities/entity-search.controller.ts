import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { EntitySearchService } from './entity-search.service';
import { EntitySearchDto } from '../dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class EntitySearchController {
  constructor(private readonly entitySearchService: EntitySearchService) {}

  @Get('orders')
  searchOrders(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'orders', query);
  }

  @Get('loads')
  searchLoads(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'loads', query);
  }

  @Get('companies')
  searchCompanies(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'companies', query);
  }

  @Get('carriers')
  searchCarriers(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'carriers', query);
  }

  @Get('contacts')
  searchContacts(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'contacts', query);
  }

  @Get('invoices')
  searchInvoices(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'invoices', query);
  }

  @Get('documents')
  searchDocuments(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Query() query: EntitySearchDto) {
    return this.entitySearchService.search(tenantId, userId, 'documents', query);
  }
}
