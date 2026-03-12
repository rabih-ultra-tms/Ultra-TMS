import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly storagePath: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get<string>(
      'STORAGE_LOCAL_PATH',
      './uploads'
    );
    this.publicUrl = this.configService.get<string>(
      'STORAGE_PUBLIC_URL',
      'http://localhost:3001/uploads'
    );
  }

  async onModuleInit() {
    // Ensure storage directory exists
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      this.logger.log(`Local storage initialized at: ${this.storagePath}`);
    } catch (error) {
      this.logger.error('Failed to create storage directory:', error);
    }
  }

  /**
   * Upload a file to local filesystem
   */
  async upload(
    file: Buffer,
    filename: string,
    folder?: string
  ): Promise<string> {
    try {
      // Construct full path
      const folderPath = folder
        ? path.join(this.storagePath, folder)
        : this.storagePath;
      const filepath = path.join(folderPath, filename);

      // SEC-027: Prevent path traversal attacks
      const resolvedFolderPath = path.resolve(folderPath);
      const resolvedFilePath = path.resolve(filepath);
      const baseDir = path.resolve(this.storagePath);

      if (
        (!resolvedFolderPath.startsWith(baseDir + path.sep) &&
          resolvedFolderPath !== baseDir) ||
        (!resolvedFilePath.startsWith(baseDir + path.sep) &&
          resolvedFilePath !== baseDir)
      ) {
        throw new Error('Path traversal detected');
      }

      // Ensure folder exists
      await fs.mkdir(resolvedFolderPath, { recursive: true });

      // Write file
      await fs.writeFile(resolvedFilePath, file);

      // Return public URL
      const relativePath = folder ? `${folder}/${filename}` : filename;
      this.logger.log(`File uploaded: ${relativePath}`);

      return this.getUrl(relativePath);
    } catch (error) {
      this.logger.error('Failed to upload file:', error);
      throw new Error('File upload failed');
    }
  }

  /**
   * Download a file from local filesystem
   */
  async download(filepath: string): Promise<Buffer> {
    try {
      const fullPath = path.resolve(path.join(this.storagePath, filepath));
      const baseDir = path.resolve(this.storagePath);

      // SEC-027: Prevent path traversal attacks
      if (!fullPath.startsWith(baseDir + path.sep) && fullPath !== baseDir) {
        throw new Error('Path traversal detected');
      }

      return await fs.readFile(fullPath);
    } catch (error) {
      this.logger.error(`Failed to download file: ${filepath}`, error);
      throw new Error('File download failed');
    }
  }

  /**
   * Delete a file from local filesystem
   */
  async delete(filepath: string): Promise<void> {
    try {
      const fullPath = path.resolve(path.join(this.storagePath, filepath));
      const baseDir = path.resolve(this.storagePath);

      // SEC-027: Prevent path traversal attacks
      if (!fullPath.startsWith(baseDir + path.sep) && fullPath !== baseDir) {
        throw new Error('Path traversal detected');
      }

      await fs.unlink(fullPath);
      this.logger.log(`File deleted: ${filepath}`);
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw new Error('File deletion failed');
    }
  }

  /**
   * Get public URL for a file
   */
  getUrl(filepath: string): string {
    return `${this.publicUrl}/${filepath}`;
  }

  /**
   * Get signed URL for a file (local storage uses a simple expiring query param)
   */
  async getSignedUrl(
    filepath: string,
    options?: { expiresIn?: number }
  ): Promise<string> {
    const url = this.getUrl(filepath);
    if (!options?.expiresIn) {
      return url;
    }

    const expiresAt = Math.floor(Date.now() / 1000) + options.expiresIn;
    return `${url}?expiresAt=${expiresAt}`;
  }

  /**
   * Check if a file exists
   */
  async exists(filepath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(path.join(this.storagePath, filepath));
      const baseDir = path.resolve(this.storagePath);

      // SEC-027: Prevent path traversal attacks
      if (!fullPath.startsWith(baseDir + path.sep) && fullPath !== baseDir) {
        return false;
      }

      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
