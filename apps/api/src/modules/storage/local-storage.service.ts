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
    this.storagePath = this.configService.get<string>('STORAGE_LOCAL_PATH', './uploads');
    this.publicUrl = this.configService.get<string>('STORAGE_PUBLIC_URL', 'http://localhost:3001/uploads');
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
  async upload(file: Buffer, filename: string, folder?: string): Promise<string> {
    try {
      // Construct full path
      const folderPath = folder ? path.join(this.storagePath, folder) : this.storagePath;
      const filepath = path.join(folderPath, filename);

      // Ensure folder exists
      await fs.mkdir(folderPath, { recursive: true });

      // Write file
      await fs.writeFile(filepath, file);

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
   * Delete a file from local filesystem
   */
  async delete(filepath: string): Promise<void> {
    try {
      const fullPath = path.join(this.storagePath, filepath);
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
   * Check if a file exists
   */
  async exists(filepath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.storagePath, filepath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
