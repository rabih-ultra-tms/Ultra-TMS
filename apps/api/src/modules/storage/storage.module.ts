import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';

// Factory to select storage provider based on config
export const STORAGE_SERVICE = 'STORAGE_SERVICE';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: (configService: ConfigService): IStorageService => {
        const driver = configService.get<string>('STORAGE_DRIVER', 'local');

        switch (driver) {
          case 'local':
            return new LocalStorageService(configService);
          // Future: Add S3StorageService here
          // case 's3':
          //   return new S3StorageService(configService);
          default:
            return new LocalStorageService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
