# Company Logo Upload Feature

## Overview
This feature allows users to upload a company logo when creating or editing customers. The logo is saved locally during development and supports cloud storage (AWS S3, Azure Blob, or GCS) for production environments.

## Changes Made

### 1. Database Schema
**File**: `apps/api/prisma/schema.prisma`
- Added `logoUrl` field to the `Company` model:
  ```prisma
  logoUrl String? @db.VarChar(500)
  ```
- Migration created: `20260123202650_add_company_logo`

### 2. Backend API

#### File Upload Utility
**File**: `apps/api/src/common/utils/file-upload.util.ts`
- Created file upload utility with:
  - Image file validation (JPG, PNG, GIF, WebP)
  - 5MB size limit
  - Local storage configuration for development
  - Cloud storage adapter interface for production

#### Company DTO
**File**: `apps/api/src/modules/crm/dto/create-company.dto.ts`
- Added optional `logoUrl` field to `CreateCompanyDto`
- Inherited by `UpdateCompanyDto`

#### API Endpoint
**File**: `apps/api/src/modules/crm/companies.controller.ts`
- New endpoint: `POST /api/v1/crm/companies/upload-logo`
  - Accepts multipart/form-data with `file` field
  - Validates file type and size
  - Saves to `uploads/logos/` directory in development
  - Returns logo URL for form submission

#### Static File Serving
**File**: `apps/api/src/main.ts`
- Configured Express to serve static files from `uploads/` directory in development mode
- URL prefix: `/uploads`

### 3. Frontend

#### Types & Validation
**Files**: 
- `apps/web/lib/types/crm.ts` - Added `logoUrl?` to `Customer` interface
- `apps/web/lib/validations/crm.ts` - Added `logoUrl` to `customerFormSchema`

#### Customer Form Component
**File**: `apps/web/components/crm/customers/customer-form.tsx`
- Added logo upload card with:
  - File input for image selection
  - Real-time image preview (square, max 5MB)
  - Remove logo button
  - Upload progress indicator
  - Placeholder icon when no logo is present
  - Automatic upload on file selection
  - Toast notifications for success/errors

## Usage

### For Developers (Local Development)

1. **Start the API server**:
   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Start the web app**:
   ```bash
   cd apps/web
   pnpm dev
   ```

3. **Create/Edit a customer**:
   - Navigate to Companies → New Company (or edit existing)
   - Scroll to "Company logo" section
   - Click "Choose File" and select an image
   - Logo will upload automatically and show preview
   - Complete the form and submit

4. **Uploaded logos are stored in**: `apps/api/uploads/logos/`

### API Usage

#### Upload Logo
```bash
curl -X POST http://localhost:3001/api/v1/crm/companies/upload-logo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/logo.png"
```

Response:
```json
{
  "data": {
    "logoUrl": "/uploads/logos/file-1234567890-123456789.png"
  }
}
```

#### Create Company with Logo
```bash
curl -X POST http://localhost:3001/api/v1/crm/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "logoUrl": "/uploads/logos/file-1234567890-123456789.png",
    "companyType": "CUSTOMER"
  }'
```

## Production Deployment

### Cloud Storage Configuration

To use cloud storage in production, implement the `CloudStorageAdapter` in `file-upload.util.ts`:

#### AWS S3 Example
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class CloudStorageAdapter implements CloudStorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET!;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract key from URL and delete from S3
  }
}
```

#### Environment Variables Needed
```env
NODE_ENV=production

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name

# OR Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER=logos

# OR Google Cloud Storage
GCS_PROJECT_ID=your_project_id
GCS_BUCKET_NAME=your-bucket-name
GCS_KEYFILE_PATH=/path/to/keyfile.json
```

#### Update Controller for Production
In `companies.controller.ts`, replace the production section:

```typescript
if (isProduction) {
  const cloudStorage = new CloudStorageAdapter();
  const cloudUrl = await cloudStorage.uploadFile(file, 'logos');
  return { data: { logoUrl: cloudUrl } };
}
```

## File Specifications

- **Allowed formats**: JPG, JPEG, PNG, GIF, WebP
- **Maximum size**: 5MB
- **Recommended**: Square images (1:1 aspect ratio)
- **Storage location (dev)**: `apps/api/uploads/logos/`
- **URL format (dev)**: `http://localhost:3001/uploads/logos/filename.ext`
- **URL format (prod)**: `https://your-cdn.com/logos/filename.ext`

## Security Considerations

1. **File validation**: Only image files are accepted
2. **Size limits**: 5MB maximum to prevent abuse
3. **Authentication**: Upload endpoint requires valid JWT token
4. **RBAC**: Only ADMIN, SALES_MANAGER, and ACCOUNT_MANAGER roles can upload
5. **File naming**: Generated unique filenames prevent collisions and path traversal
6. **CORS**: Configured to allow uploads from authorized origins

## Future Enhancements

1. **Image optimization**: Resize/compress images before storage
2. **CDN integration**: Serve images through CloudFront/Cloudflare
3. **Multiple images**: Support gallery of images per company
4. **Image cropping**: Allow users to crop/adjust uploaded images
5. **Drag & drop**: Add drag-and-drop upload interface
6. **Old file cleanup**: Delete old logo when uploading new one
7. **Image formats**: Support SVG for vector logos
