import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { GlobalSearchController } from './global/global-search.controller';
import { GlobalSearchService } from './global/global-search.service';
import { EntitySearchController } from './entities/entity-search.controller';
import { EntitySearchService } from './entities/entity-search.service';
import { SavedSearchesController } from './saved/saved-searches.controller';
import { SavedSearchesService } from './saved/saved-searches.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { IndexingService } from './indexing/indexing.service';
import { QueueProcessorService } from './indexing/queue-processor.service';
import { IndexManagerService } from './indexing/index-manager.service';

@Module({
  imports: [ElasticsearchModule],
  controllers: [
    GlobalSearchController,
    EntitySearchController,
    SavedSearchesController,
    AdminController,
  ],
  providers: [
    PrismaService,
    GlobalSearchService,
    EntitySearchService,
    SavedSearchesService,
    AdminService,
    IndexingService,
    QueueProcessorService,
    IndexManagerService,
  ],
})
export class SearchModule {}
