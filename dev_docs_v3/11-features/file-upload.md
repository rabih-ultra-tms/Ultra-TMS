# File Upload & Storage

> Source: `dev_docs/10-features/80-file-upload-storage-standards.md`
> Last updated: 2026-03-07

---

## Overview

All file storage uses **S3-compatible object storage** with tenant-isolated paths. Files are never stored on local disk. Signed URLs control access.

---

## Common File Types in 3PL

| Document Type | Formats | Max Size | Retention |
|---------------|---------|----------|-----------|
| BOL (Bill of Lading) | PDF, PNG, JPG | 10MB | 7 years |
| POD (Proof of Delivery) | PDF, PNG, JPG | 10MB | 7 years |
| Rate Confirmation | PDF | 5MB | 7 years |
| Insurance Certificate | PDF | 5MB | Until expiry + 1 year |
| W9 Forms | PDF | 2MB | 7 years |
| Driver License | PDF, PNG, JPG | 5MB | Until expiry + 1 year |
| Damage/Equipment Photos | PNG, JPG, HEIC | 15MB | 7 years |
| Invoices | PDF | 5MB | 7 years |
| Contracts | PDF | 10MB | 7 years |
| Import (CSV, Excel) | CSV, XLSX | 50MB | 30 days |

---

## Storage Path Structure

```
S3 Bucket: ultra-tms-{env}
├── tenants/
│   └── {tenantId}/
│       ├── loads/{loadId}/
│       │   ├── bol/
│       │   ├── pod/
│       │   ├── rate-con/
│       │   └── photos/
│       ├── carriers/{carrierId}/
│       │   ├── insurance/
│       │   ├── w9/
│       │   └── authority/
│       ├── invoices/{year}/{month}/
│       ├── imports/{uploadId}/
│       └── temp/{uploadId}/
└── platform/
    ├── templates/
    └── system/
```

---

## Core Rules

1. **NEVER store files on local disk** — Always use S3/object storage
2. **ALWAYS validate file types** — Whitelist allowed extensions (no `.exe`, `.bat`, etc.)
3. **ALWAYS scan for malware** — Before making files accessible
4. **Tenant isolation** — Storage paths MUST include `tenantId`
5. **Signed URLs** — Never expose bucket directly; generate time-limited signed URLs

---

## Backend: Storage Service

```typescript
@Injectable()
export class StorageService {
  constructor(@Inject('S3_CLIENT') private s3: S3Client) {}

  async upload(params: {
    tenantId: string;
    path: string;
    file: Buffer;
    contentType: string;
  }): Promise<{ key: string; url: string }> {
    const key = `tenants/${params.tenantId}/${params.path}`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: params.file,
      ContentType: params.contentType,
    }));
    return { key, url: await this.getSignedUrl(key) };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.s3, new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }), { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}
```

---

## Backend: Upload Controller

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|png|jpg|jpeg|csv|xlsx)$/i;
    if (!allowed.test(file.originalname)) {
      return cb(new BadRequestException('File type not allowed'), false);
    }
    cb(null, true);
  },
}))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: UploadFileDto,
  @CurrentUser() user: CurrentUserData,
) {
  return this.storageService.upload({
    tenantId: user.tenantId,
    path: `${dto.category}/${dto.entityId}/${file.originalname}`,
    file: file.buffer,
    contentType: file.mimetype,
  });
}
```

---

## Frontend: Upload Component Pattern

```typescript
export function FileUpload({ entityId, category, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('entityId', entityId);
    formData.append('category', category);

    try {
      const response = await apiClient.post('/documents/upload', formData);
      onUpload(response.data.data);
      toast.success('File uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dropzone onDrop={handleUpload} disabled={uploading}>
      {uploading ? <Spinner /> : <p>Drop files here or click to upload</p>}
    </Dropzone>
  );
}
```

---

## Security Checklist

- [ ] File type whitelist enforced server-side
- [ ] File size limits enforced server-side
- [ ] Tenant ID in storage path — no cross-tenant access
- [ ] Signed URLs with expiration (default 1 hour)
- [ ] Malware scanning before file is accessible
- [ ] No direct bucket access — all through API
