import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { BusinessHoursController } from './business-hours/business-hours.controller';
import { BusinessHoursService } from './business-hours/business-hours.service';
import { ConfigCacheService } from './config-cache.service';
import { FeaturesController } from './features/features.controller';
import { FeatureFlagEvaluator } from './features/feature-flag.evaluator';
import { FeaturesService } from './features/features.service';
import { ConfigHistoryService } from './history/config-history.service';
import { PreferencesController } from './preferences/preferences.controller';
import { PreferencesService } from './preferences/preferences.service';
import { SequencesController } from './sequences/sequences.controller';
import { SequencesService } from './sequences/sequences.service';
import { SystemConfigController } from './system/system-config.controller';
import { SystemConfigService } from './system/system-config.service';
import { TemplatesController } from './templates/templates.controller';
import { TemplatesService } from './templates/templates.service';
import { TenantConfigController } from './tenant/tenant-config.controller';
import { TenantConfigService } from './tenant/tenant-config.service';

@Module({
  controllers: [
    SystemConfigController,
    TenantConfigController,
    PreferencesController,
    FeaturesController,
    BusinessHoursController,
    SequencesController,
    TemplatesController,
  ],
  providers: [
    PrismaService,
    ConfigCacheService,
    ConfigHistoryService,
    SystemConfigService,
    TenantConfigService,
    PreferencesService,
    FeaturesService,
    FeatureFlagEvaluator,
    BusinessHoursService,
    SequencesService,
    TemplatesService,
  ],
  exports: [SystemConfigService, TenantConfigService, PreferencesService, FeaturesService],
})
export class ConfigModule {}
