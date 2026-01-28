import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return callback(new BadRequestException('Only image files are allowed'), false);
  }
  callback(null, true);
};

export const getLocalStorageOptions = (destination: string) => ({
  storage: diskStorage({
    destination,
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export interface CloudStorageService {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

// Placeholder for cloud storage implementation
// In production, implement this with AWS S3, Azure Blob Storage, or GCS
export class CloudStorageAdapter implements CloudStorageService {
  async uploadFile(_file: Express.Multer.File, _folder: string): Promise<string> {
    // TODO: Implement cloud storage upload
    // For AWS S3:
    // const key = `${folder}/${Date.now()}-${file.originalname}`;
    // await s3.putObject({ Bucket: bucket, Key: key, Body: file.buffer });
    // return s3Url;
    
    throw new Error('Cloud storage not configured. Please set up AWS S3, Azure Blob, or GCS.');
  }

  async deleteFile(_fileUrl: string): Promise<void> {
    // TODO: Implement cloud storage deletion
    throw new Error('Cloud storage not configured.');
  }
}
