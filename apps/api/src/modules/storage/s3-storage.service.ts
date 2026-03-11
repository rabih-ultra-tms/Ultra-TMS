import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';

/**
 * S3-backed storage service.
 *
 * Uses dynamic `import()` for `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
 * so the application still boots when the SDK is not installed (local-dev scenario).
 * Install the SDK when you need S3 in production:
 *
 *   pnpm --filter api add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *
 * Required environment variables (see .env.example):
 *   STORAGE_DRIVER=s3
 *   AWS_S3_BUCKET=my-bucket
 *   AWS_S3_REGION=us-east-1
 *   AWS_ACCESS_KEY_ID=...
 *   AWS_SECRET_ACCESS_KEY=...
 *
 * Optional:
 *   AWS_S3_ENDPOINT=        — for S3-compatible stores (MinIO, R2, etc.)
 *   AWS_S3_PREFIX=          — key prefix (e.g. "uploads/")
 *   AWS_S3_FORCE_PATH_STYLE=true  — required for MinIO / local S3 emulators
 */
@Injectable()
export class S3StorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);

  private readonly bucket: string;
  private readonly region: string;
  private readonly prefix: string;
  private readonly endpoint: string | undefined;
  private readonly forcePathStyle: boolean;

  // Lazily resolved AWS SDK references
  private s3Client: any; // S3Client instance
  private sdkCommands: {
    PutObjectCommand: any;
    GetObjectCommand: any;
    DeleteObjectCommand: any;
    HeadObjectCommand: any;
  } | null = null;
  private getSignedUrlFn:
    | ((client: any, command: any, options: any) => Promise<string>)
    | null = null;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', '');
    this.region = this.configService.get<string>('AWS_S3_REGION', 'us-east-1');
    this.prefix = this.configService.get<string>('AWS_S3_PREFIX', '');
    this.endpoint =
      this.configService.get<string>('AWS_S3_ENDPOINT') || undefined;
    this.forcePathStyle =
      this.configService.get<string>('AWS_S3_FORCE_PATH_STYLE', 'false') ===
      'true';
  }

  async onModuleInit(): Promise<void> {
    if (!this.bucket) {
      this.logger.error(
        'AWS_S3_BUCKET is not configured. S3 storage will not work. ' +
          'Set STORAGE_DRIVER=local or provide a valid bucket name.'
      );
      return;
    }

    try {
      await this.loadSdk();
      this.logger.log(
        `S3 storage initialized — bucket: ${this.bucket}, region: ${this.region}` +
          (this.endpoint ? `, endpoint: ${this.endpoint}` : '') +
          (this.prefix ? `, prefix: ${this.prefix}` : '')
      );
    } catch (error) {
      this.logger.error(
        'Failed to load @aws-sdk/client-s3. Install it with: ' +
          'pnpm --filter api add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner',
        error instanceof Error ? error.message : error
      );
    }
  }

  // ---------------------------------------------------------------------------
  // IStorageService
  // ---------------------------------------------------------------------------

  async upload(
    file: Buffer,
    filename: string,
    folder?: string,
    contentType?: string
  ): Promise<string> {
    this.ensureSdk();

    const key = this.buildKey(filename, folder);

    const command = new this.sdkCommands!.PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType || 'application/octet-stream',
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded to S3: ${key}`);
      return this.getUrl(folder ? `${folder}/${filename}` : filename);
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${key}`, error);
      throw new Error('File upload to S3 failed');
    }
  }

  async download(filepath: string): Promise<Buffer> {
    this.ensureSdk();

    const key = this.resolveKey(filepath);

    const command = new this.sdkCommands!.GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      // response.Body is a Readable stream in Node
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to download file from S3: ${key}`, error);
      throw new Error('File download from S3 failed');
    }
  }

  async delete(filepath: string): Promise<void> {
    this.ensureSdk();

    const key = this.resolveKey(filepath);

    const command = new this.sdkCommands!.DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${key}`, error);
      throw new Error('File deletion from S3 failed');
    }
  }

  getUrl(filepath: string): string {
    const key = this.resolveKey(filepath);

    if (this.endpoint) {
      // For custom endpoints (MinIO, R2)
      const base = this.endpoint.replace(/\/$/, '');
      return this.forcePathStyle
        ? `${base}/${this.bucket}/${key}`
        : `${base}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async getSignedUrl(
    filepath: string,
    options?: { expiresIn?: number }
  ): Promise<string> {
    this.ensureSdk();

    const key = this.resolveKey(filepath);
    const expiresIn = options?.expiresIn ?? 3600; // default 1 hour

    const command = new this.sdkCommands!.GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await this.getSignedUrlFn!(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for: ${key}`, error);
      throw new Error('Signed URL generation failed');
    }
  }

  async exists(filepath: string): Promise<boolean> {
    this.ensureSdk();

    const key = this.resolveKey(filepath);

    const command = new this.sdkCommands!.HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Build the full S3 object key from filename + optional folder + configured prefix.
   */
  private buildKey(filename: string, folder?: string): string {
    const parts: string[] = [];
    if (this.prefix) parts.push(this.prefix.replace(/\/$/, ''));
    if (folder) parts.push(folder);
    parts.push(filename);
    return parts.join('/');
  }

  /**
   * Resolve a relative filepath into the full S3 key (prepend prefix if configured).
   */
  private resolveKey(filepath: string): string {
    if (this.prefix && !filepath.startsWith(this.prefix)) {
      return `${this.prefix.replace(/\/$/, '')}/${filepath}`;
    }
    return filepath;
  }

  /**
   * Dynamically load the AWS SDK so it is an optional dependency.
   * Throws a clear error if the packages are not installed.
   */
  private async loadSdk(): Promise<void> {
    try {
      const s3Module = await (Function(
        'return import("@aws-sdk/client-s3")'
      )() as Promise<any>);
      const presignerModule = await (Function(
        'return import("@aws-sdk/s3-request-presigner")'
      )() as Promise<any>);

      const clientOptions: Record<string, any> = {
        region: this.region,
        ...(this.endpoint ? { endpoint: this.endpoint } : {}),
        ...(this.forcePathStyle ? { forcePathStyle: true } : {}),
      };

      // If explicit credentials are provided, use them; otherwise the SDK
      // falls back to its default credential chain (IAM role, env vars, etc.)
      const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get<string>(
        'AWS_SECRET_ACCESS_KEY'
      );
      if (accessKeyId && secretAccessKey) {
        clientOptions.credentials = {
          accessKeyId,
          secretAccessKey,
        };
      }

      this.s3Client = new s3Module.S3Client(clientOptions);
      this.sdkCommands = {
        PutObjectCommand: s3Module.PutObjectCommand,
        GetObjectCommand: s3Module.GetObjectCommand,
        DeleteObjectCommand: s3Module.DeleteObjectCommand,
        HeadObjectCommand: s3Module.HeadObjectCommand,
      };
      this.getSignedUrlFn = presignerModule.getSignedUrl;
    } catch (error: any) {
      throw new Error(
        `@aws-sdk/client-s3 or @aws-sdk/s3-request-presigner is not installed. ` +
          `Run: pnpm --filter api add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner\n` +
          `Original error: ${error.message}`
      );
    }
  }

  /**
   * Guard: throws if the SDK was not loaded successfully.
   */
  private ensureSdk(): void {
    if (!this.s3Client || !this.sdkCommands || !this.getSignedUrlFn) {
      throw new Error(
        'S3 SDK not initialized. Ensure @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner ' +
          'are installed, and AWS_S3_BUCKET is configured.'
      );
    }
  }
}
