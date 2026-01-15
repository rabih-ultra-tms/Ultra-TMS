import { Exclude, Expose, Transform } from 'class-transformer';

export class DocumentResponseDto {
  @Exclude()
  filePath?: string | null;

  @Exclude()
  bucketName?: string | null;

  @Expose()
  @Transform(() => null)
  downloadUrl?: string | null;
}

export class DocumentDownloadDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  downloadUrl!: string;

  @Expose()
  expiresAt!: Date;
}
