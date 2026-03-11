import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

// Injection token — use @Inject(STORAGE_SERVICE) to get the active IStorageService
export const STORAGE_SERVICE = 'STORAGE_SERVICE';

const logger = new Logger('StorageModule');

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: (configService: ConfigService): IStorageService => {
        const driver = configService.get<string>('STORAGE_DRIVER', 'local');

        switch (driver) {
          case 's3':
            logger.log('Using S3 storage driver');
            return new S3StorageService(configService);
          case 'local':
          default:
            logger.log('Using local filesystem storage driver');
            return new LocalStorageService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
