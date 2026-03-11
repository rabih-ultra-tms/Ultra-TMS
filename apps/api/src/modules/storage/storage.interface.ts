/**
 * Storage abstraction interface
 * Allows swapping between local filesystem, S3, Azure Blob, or GCS providers.
 *
 * Implementations:
 *  - LocalStorageService  (STORAGE_DRIVER=local)  — dev default, writes to disk
 *  - S3StorageService     (STORAGE_DRIVER=s3)     — AWS S3 / S3-compatible
 */
export interface IStorageService {
  /**
   * Upload a file to storage
   * @param file - File buffer
   * @param filename - Destination filename
   * @param folder - Optional folder/prefix path
   * @param contentType - Optional MIME type (used by cloud providers for Content-Type header)
   * @returns Public or pre-signed URL to access the file
   */
  upload(
    file: Buffer,
    filename: string,
    folder?: string,
    contentType?: string
  ): Promise<string>;

  /**
   * Download a file from storage
   * @param filepath - Relative path / key of the file
   * @returns File contents as a Buffer
   */
  download(filepath: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   * @param filepath - Relative path / key of the file
   */
  delete(filepath: string): Promise<void>;

  /**
   * Get public URL for a file (not signed — only useful when bucket is public or for local dev)
   * @param filepath - Relative path / key of the file
   * @returns Public URL
   */
  getUrl(filepath: string): string;

  /**
   * Get a time-limited signed URL for a file
   * @param filepath - Relative path / key of the file
   * @param options - Signing options
   */
  getSignedUrl(
    filepath: string,
    options?: { expiresIn?: number }
  ): Promise<string>;

  /**
   * Check if a file exists in storage
   * @param filepath - Relative path / key of the file
   */
  exists(filepath: string): Promise<boolean>;
}
