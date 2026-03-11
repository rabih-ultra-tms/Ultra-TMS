import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed'),
      false
    );
  }
  callback(null, true);
};

export const documentFileFilter = (req: any, file: any, callback: any) => {
  if (
    !file.originalname.match(
      /\.(jpg|jpeg|png|gif|webp|pdf|tiff|tif|doc|docx|xls|xlsx|csv|txt)$/i
    )
  ) {
    return callback(
      new BadRequestException(
        'Unsupported file type. Accepted: PDF, JPG, PNG, TIFF, GIF, WEBP, DOC, DOCX, XLS, XLSX, CSV, TXT'
      ),
      false
    );
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

/**
 * Multer options for document uploads.
 * Uses memory storage so the file buffer is available for the storage service.
 * Accepts common document types up to 25MB.
 */
export const getDocumentUploadOptions = () => ({
  storage: memoryStorage(),
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB — matches frontend limit
  },
});

/**
 * @deprecated Use IStorageService from modules/storage/storage.interface.ts instead.
 * Inject via @Inject(STORAGE_SERVICE) from modules/storage/storage.module.ts.
 *
 * INFRA-006: Cloud storage is now implemented through the StorageModule.
 * Set STORAGE_DRIVER=s3 and configure AWS_S3_* env vars for production.
 * See .env.example for all available configuration options.
 */
export interface CloudStorageService {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
