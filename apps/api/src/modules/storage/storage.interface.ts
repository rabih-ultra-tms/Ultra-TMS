/**
 * Storage abstraction interface
 * Allows swapping between local filesystem, S3, or other providers
 */
export interface IStorageService {
  /**
   * Upload a file to storage
   * @param file - File buffer
   * @param filename - Destination filename
   * @param folder - Optional folder path
   * @returns Public URL to access the file
   */
  upload(file: Buffer, filename: string, folder?: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param filepath - Relative path to the file
   */
  delete(filepath: string): Promise<void>;

  /**
   * Get public URL for a file
   * @param filepath - Relative path to the file
   * @returns Public URL
   */
  getUrl(filepath: string): string;

  /**
   * Check if a file exists
   * @param filepath - Relative path to the file
   */
  exists(filepath: string): Promise<boolean>;
}
