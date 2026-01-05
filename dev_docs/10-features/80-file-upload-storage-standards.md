# 75 - File Upload & Storage Standards

**S3-compatible storage patterns for documents, PODs, and images**

---

## âš ï¸ CLAUDE CODE: File Handling Requirements

1. **NEVER store files on local disk** - Always use S3/object storage
2. **ALWAYS validate file types** - Whitelist allowed extensions
3. **ALWAYS scan for malware** - Before making files accessible
4. **Tenant isolation is critical** - Separate storage paths per tenant
5. **Generate signed URLs** - Never expose bucket directly

---

## Common File Types in 3PL

| Document Type              | Formats        | Max Size | Storage Duration      |
| -------------------------- | -------------- | -------- | --------------------- |
| BOL (Bill of Lading)       | PDF, PNG, JPG  | 10MB     | 7 years               |
| POD (Proof of Delivery)    | PDF, PNG, JPG  | 10MB     | 7 years               |
| Rate Confirmation          | PDF            | 5MB      | 7 years               |
| Insurance Certificate      | PDF            | 5MB      | Until expiry + 1 year |
| W9 Forms                   | PDF            | 2MB      | 7 years               |
| Driver License             | PDF, PNG, JPG  | 5MB      | Until expiry + 1 year |
| Photos (Damage, Equipment) | PNG, JPG, HEIC | 15MB     | 7 years               |
| Invoices                   | PDF            | 5MB      | 7 years               |
| Contracts                  | PDF            | 10MB     | 7 years               |
| Import (CSV, Excel)        | CSV, XLSX      | 50MB     | 30 days               |

---

## Storage Architecture

```
S3 Bucket: freight-platform-{env}
â”‚
â”œâ”€â”€ tenants/
â”‚   â”œâ”€â”€ {tenantId}/
â”‚   â”‚   â”œâ”€â”€ loads/
â”‚   â”‚   â”‚   â””â”€â”€ {loadId}/
â”‚   â”‚   â”‚       â”œâ”€â”€ bol/
â”‚   â”‚   â”‚       â”œâ”€â”€ pod/
â”‚   â”‚   â”‚       â”œâ”€â”€ rate-con/
â”‚   â”‚   â”‚       â””â”€â”€ photos/
â”‚   â”‚   â”œâ”€â”€ carriers/
â”‚   â”‚   â”‚   â””â”€â”€ {carrierId}/
â”‚   â”‚   â”‚       â”œâ”€â”€ insurance/
â”‚   â”‚   â”‚       â”œâ”€â”€ w9/
â”‚   â”‚   â”‚       â””â”€â”€ authority/
â”‚   â”‚   â”œâ”€â”€ invoices/
â”‚   â”‚   â”‚   â””â”€â”€ {year}/{month}/
â”‚   â”‚   â”œâ”€â”€ imports/
â”‚   â”‚   â”‚   â””â”€â”€ {uploadId}/
â”‚   â”‚   â””â”€â”€ temp/
â”‚   â”‚       â””â”€â”€ {uploadId}/
â”‚
â””â”€â”€ platform/
    â”œâ”€â”€ templates/
    â””â”€â”€ system/
```

---

## Backend Implementation

### Storage Module

```typescript
// apps/api/src/modules/storage/storage.module.ts

import { Module, Global } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: () => {
        return new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
```

### Storage Service

```typescript
// apps/api/src/modules/storage/storage.service.ts

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

interface UploadOptions {
  tenantId: string;
  folder: string; // e.g., 'loads/{loadId}/pod'
  filename?: string; // Optional, will generate if not provided
  contentType: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

interface PresignedUrlOptions {
  expiresIn?: number; // Seconds, default 3600 (1 hour)
}

@Injectable()
export class StorageService {
  private bucket = process.env.S3_BUCKET;

  constructor(@Inject('S3_CLIENT') private s3: S3Client) {}

  // Generate storage key (path)
  private getKey(tenantId: string, folder: string, filename: string): string {
    return `tenants/${tenantId}/${folder}/${filename}`;
  }

  // Upload file
  async upload(
    file: Buffer,
    options: UploadOptions
  ): Promise<{ key: string; url: string }> {
    const { tenantId, folder, contentType, metadata } = options;

    const filename =
      options.filename || `${uuid()}${this.getExtension(contentType)}`;
    const key = this.getKey(tenantId, folder, filename);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          tenantId,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      })
    );

    const url = await this.getSignedUrl(key);
    return { key, url };
  }

  // Get signed URL for download/viewing
  async getSignedUrl(
    key: string,
    options?: PresignedUrlOptions
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: options?.expiresIn || 3600,
    });
  }

  // Get signed URL for upload (presigned PUT)
  async getPresignedUploadUrl(
    tenantId: string,
    folder: string,
    filename: string,
    contentType: string
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = this.getKey(tenantId, folder, filename);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 3600, // 1 hour to upload
    });

    return { uploadUrl, key };
  }

  // Delete file
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  // Check if file exists
  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  // Copy file (for duplication)
  async copy(sourceKey: string, destKey: string): Promise<void> {
    // Implementation with CopyObjectCommand
  }

  private getExtension(contentType: string): string {
    const map: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/heic': '.heic',
      'text/csv': '.csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        '.xlsx',
    };
    return map[contentType] || '';
  }
}
```

### Document Model

```prisma
// prisma/schema.prisma

model Document {
  id            String        @id @default(cuid())

  // File info
  filename      String        // Original filename
  storageKey    String        // S3 key
  mimeType      String
  size          Int           // Bytes

  // Classification
  type          DocumentType  // BOL, POD, INSURANCE, W9, etc.
  category      String?       // Optional sub-category

  // Relations (polymorphic)
  entityType    String        // 'Load', 'Carrier', 'Invoice', etc.
  entityId      String

  // Metadata
  description   String?
  tags          String[]

  // Versioning
  version       Int           @default(1)
  parentId      String?       // Previous version

  // Status
  status        DocumentStatus @default(ACTIVE)

  // Migration
  externalId    String?
  sourceSystem  String?

  // Audit
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?
  createdById   String

  // Multi-tenancy
  tenantId      String
  tenant        Tenant        @relation(fields: [tenantId], references: [id])

  @@index([entityType, entityId])
  @@index([tenantId])
  @@index([type])
  @@index([storageKey])
}

enum DocumentType {
  BOL
  POD
  RATE_CONFIRMATION
  INSURANCE_CERTIFICATE
  W9
  DRIVER_LICENSE
  INVOICE
  CONTRACT
  PHOTO
  OTHER
}

enum DocumentStatus {
  PENDING
  ACTIVE
  ARCHIVED
  DELETED
}
```

---

## Upload Controller

```typescript
// apps/api/src/modules/document/document.controller.ts

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { DocumentService } from './document.service';
import { StorageService } from '../storage/storage.service';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

@Controller('api/v1/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private storageService: StorageService
  ) {}

  // Direct upload (small files)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      type: string;
      entityType: string;
      entityId: string;
      description?: string;
    },
    @CurrentUser() user: CurrentUserData
  ) {
    // Validate file
    this.validateFile(file);

    // Determine folder based on entity
    const folder = this.getFolderPath(
      body.entityType,
      body.entityId,
      body.type
    );

    // Upload to S3
    const { key, url } = await this.storageService.upload(file.buffer, {
      tenantId: user.tenantId,
      folder,
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedBy: user.id,
      },
    });

    // Create document record
    const document = await this.documentService.create({
      filename: file.originalname,
      storageKey: key,
      mimeType: file.mimetype,
      size: file.size,
      type: body.type,
      entityType: body.entityType,
      entityId: body.entityId,
      description: body.description,
      tenantId: user.tenantId,
      createdById: user.id,
    });

    return { data: { ...document, url } };
  }

  // Get presigned upload URL (for large files / direct browser upload)
  @Post('presigned-url')
  async getPresignedUrl(
    @Body()
    body: {
      filename: string;
      contentType: string;
      entityType: string;
      entityId: string;
    },
    @CurrentUser() user: CurrentUserData
  ) {
    // Validate content type
    if (!ALLOWED_MIME_TYPES.includes(body.contentType)) {
      throw new BadRequestException('File type not allowed');
    }

    const folder = this.getFolderPath(body.entityType, body.entityId, 'temp');
    const { uploadUrl, key } = await this.storageService.getPresignedUploadUrl(
      user.tenantId,
      folder,
      body.filename,
      body.contentType
    );

    return { data: { uploadUrl, key } };
  }

  // Confirm upload (after direct browser upload)
  @Post('confirm')
  async confirmUpload(
    @Body()
    body: {
      key: string;
      type: string;
      entityType: string;
      entityId: string;
      description?: string;
    },
    @CurrentUser() user: CurrentUserData
  ) {
    // Verify file exists in S3
    const exists = await this.storageService.exists(body.key);
    if (!exists) {
      throw new BadRequestException('File not found');
    }

    // TODO: Move from temp to permanent location if needed
    // TODO: Virus scan

    const document = await this.documentService.create({
      filename: body.key.split('/').pop(),
      storageKey: body.key,
      mimeType: this.getMimeType(body.key),
      size: 0, // Would need to get from S3 metadata
      type: body.type,
      entityType: body.entityType,
      entityId: body.entityId,
      description: body.description,
      tenantId: user.tenantId,
      createdById: user.id,
    });

    return { data: document };
  }

  // Get download URL
  @Get(':id/download')
  async getDownloadUrl(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    const document = await this.documentService.findOne(id, user.tenantId);
    const url = await this.storageService.getSignedUrl(document.storageKey, {
      expiresIn: 300, // 5 minutes for download
    });

    return { data: { url, filename: document.filename } };
  }

  // List documents for entity
  @Get()
  async findAll(
    @Query() query: { entityType: string; entityId: string; type?: string },
    @CurrentUser() user: CurrentUserData
  ) {
    const documents = await this.documentService.findByEntity(
      query.entityType,
      query.entityId,
      user.tenantId,
      query.type
    );

    // Add signed URLs
    const docsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        url: await this.storageService.getSignedUrl(doc.storageKey),
      }))
    );

    return { data: docsWithUrls };
  }

  // Delete document
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    const document = await this.documentService.findOne(id, user.tenantId);

    // Delete from S3
    await this.storageService.delete(document.storageKey);

    // Soft delete record
    await this.documentService.delete(id, user.tenantId);

    return { data: { deleted: true } };
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large (max 15MB)');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Additional validation for images (verify magic bytes)
    // Additional validation for PDFs
  }

  private getFolderPath(
    entityType: string,
    entityId: string,
    type: string
  ): string {
    switch (entityType) {
      case 'Load':
        return `loads/${entityId}/${type.toLowerCase()}`;
      case 'Carrier':
        return `carriers/${entityId}/${type.toLowerCase()}`;
      case 'Invoice':
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        return `invoices/${year}/${month}`;
      default:
        return `documents/${entityType.toLowerCase()}/${entityId}`;
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      heic: 'image/heic',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}
```

---

## Frontend Upload Components

### File Upload Hook

```typescript
// hooks/use-file-upload.ts
import { useState, useCallback } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

interface UseFileUploadOptions {
  onSuccess?: (document: Document) => void;
  onError?: (error: Error) => void;
  maxSize?: number;
  allowedTypes?: string[];
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      file: File,
      metadata: {
        type: string;
        entityType: string;
        entityId: string;
        description?: string;
      }
    ) => {
      setUploading(true);
      setProgress({ loaded: 0, total: file.size, percent: 0 });
      setError(null);

      try {
        // Validate client-side
        if (options.maxSize && file.size > options.maxSize) {
          throw new Error('File too large');
        }

        if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
          throw new Error('File type not allowed');
        }

        // For small files, use direct upload
        if (file.size < 5 * 1024 * 1024) {
          const formData = new FormData();
          formData.append('file', file);
          Object.entries(metadata).forEach(([key, value]) => {
            if (value) formData.append(key, value);
          });

          const response = await fetch('/api/v1/documents/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Upload failed');
          }

          const result = await response.json();
          setProgress({ loaded: file.size, total: file.size, percent: 100 });
          options.onSuccess?.(result.data);
          return result.data;
        }

        // For large files, use presigned URL
        // 1. Get presigned URL
        const urlResponse = await fetch('/api/v1/documents/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            ...metadata,
          }),
        });

        if (!urlResponse.ok) throw new Error('Failed to get upload URL');

        const {
          data: { uploadUrl, key },
        } = await urlResponse.json();

        // 2. Upload directly to S3
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress({
                loaded: e.loaded,
                total: e.total,
                percent: Math.round((e.loaded / e.total) * 100),
              });
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) resolve();
            else reject(new Error('Upload failed'));
          });
          xhr.addEventListener('error', () =>
            reject(new Error('Upload failed'))
          );
          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });

        // 3. Confirm upload
        const confirmResponse = await fetch('/api/v1/documents/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, ...metadata }),
        });

        if (!confirmResponse.ok) throw new Error('Failed to confirm upload');

        const result = await confirmResponse.json();
        options.onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        options.onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [options]
  );

  return { upload, uploading, progress, error };
}
```

### Upload Component

```typescript
// components/file-upload.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  entityType: string;
  entityId: string;
  documentType: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  onUploadComplete?: (documents: Document[]) => void;
}

export function FileUpload({
  entityType,
  entityId,
  documentType,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.jpg', '.jpeg', '.png'],
  },
  maxSize = 15 * 1024 * 1024,
  multiple = false,
  onUploadComplete,
}: FileUploadProps) {
  const [files, setFiles] = useState<Array<{
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
    document?: Document;
  }>>([]);

  const { upload } = useFileUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        status: 'pending' as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      const uploadedDocs: Document[] = [];

      for (const fileEntry of newFiles) {
        const index = files.length + newFiles.indexOf(fileEntry);

        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: 'uploading' } : f
          )
        );

        try {
          const doc = await upload(fileEntry.file, {
            type: documentType,
            entityType,
            entityId,
          });

          setFiles((prev) =>
            prev.map((f, i) =>
              i === index
                ? { ...f, status: 'success', progress: 100, document: doc }
                : f
            )
          );

          uploadedDocs.push(doc);
        } catch (err) {
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index
                ? {
                    ...f,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Upload failed',
                  }
                : f
            )
          );
        }
      }

      if (uploadedDocs.length > 0) {
        onUploadComplete?.(uploadedDocs);
      }
    },
    [upload, entityType, entityId, documentType, onUploadComplete, files.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, JPG, PNG up to {maxSize / (1024 * 1024)}MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileEntry, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <File className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileEntry.file.name}
                </p>
                {fileEntry.status === 'uploading' && (
                  <Progress value={fileEntry.progress} className="h-1 mt-1" />
                )}
                {fileEntry.status === 'error' && (
                  <p className="text-xs text-destructive">{fileEntry.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {fileEntry.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {fileEntry.status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {fileEntry.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Image Processing

### Thumbnail Generation

```typescript
// apps/api/src/modules/storage/image.service.ts

import sharp from 'sharp';

@Injectable()
export class ImageService {
  async generateThumbnail(
    input: Buffer,
    options: { width?: number; height?: number; quality?: number } = {}
  ): Promise<Buffer> {
    const { width = 200, height = 200, quality = 80 } = options;

    return sharp(input)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  }

  async optimizeImage(input: Buffer, maxWidth = 1920): Promise<Buffer> {
    const metadata = await sharp(input).metadata();

    if (metadata.width && metadata.width <= maxWidth) {
      return input;
    }

    return sharp(input)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  async convertHeicToJpeg(input: Buffer): Promise<Buffer> {
    return sharp(input).jpeg({ quality: 90 }).toBuffer();
  }
}
```

---

## Security Considerations

### Virus Scanning

```typescript
// Integration with ClamAV or cloud-based scanner

@Injectable()
export class VirusScanService {
  async scan(buffer: Buffer): Promise<{ safe: boolean; threat?: string }> {
    // Option 1: ClamAV
    // Option 2: AWS S3 Object Lambda with scanning
    // Option 3: Third-party API (e.g., VirusTotal)

    // For now, placeholder
    return { safe: true };
  }
}

// Usage in upload flow
async upload(file: Buffer, options: UploadOptions) {
  const scanResult = await this.virusScanService.scan(file);

  if (!scanResult.safe) {
    throw new BadRequestException(`File rejected: ${scanResult.threat}`);
  }

  // Proceed with upload
}
```

### Access Control

```typescript
// Verify user can access document
async getDownloadUrl(documentId: string, user: CurrentUserData) {
  const document = await this.prisma.document.findFirst({
    where: {
      id: documentId,
      tenantId: user.tenantId,  // CRITICAL: Tenant isolation
      deletedAt: null,
    },
  });

  if (!document) {
    throw new NotFoundException('Document not found');
  }

  // Additional checks based on entity type
  if (document.entityType === 'Load') {
    const load = await this.prisma.load.findFirst({
      where: { id: document.entityId, tenantId: user.tenantId },
    });
    if (!load) {
      throw new ForbiddenException('Access denied');
    }
  }

  return this.storageService.getSignedUrl(document.storageKey);
}
```

---

## File Upload Checklist

### Before Implementing

- [ ] Storage bucket created with proper permissions
- [ ] CORS configured for direct browser uploads
- [ ] Lifecycle rules for temp file cleanup

### Every Upload Flow

- [ ] File type validated (whitelist)
- [ ] File size validated
- [ ] Tenant ID included in storage path
- [ ] Document record created in database
- [ ] Signed URLs used (never direct bucket access)

### Security

- [ ] Virus scanning enabled
- [ ] Access control verified before download
- [ ] No sensitive data in storage keys
- [ ] Encryption at rest enabled

---

## Cross-References

- **Screen-API Registry (doc 72)**: Documents screens 10.01-10.08
- **Database Standards (doc 63)**: Document model schema
- **API Standards (doc 62)**: Multipart upload endpoints
- **Error Handling (doc 76)**: Storage error handling

---

## Navigation

- **Previous:** [Real-Time & WebSocket Standards](./74-real-time-websocket-standards.md)
- **Next:** [Error Handling & Logging Standards](./76-error-handling-logging-standards.md)
