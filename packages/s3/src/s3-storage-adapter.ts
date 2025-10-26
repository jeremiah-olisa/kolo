import {
  BaseStorageAdapter,
  StorageFile,
  UploadOptions,
  UploadResponse,
  DownloadOptions,
  DownloadResponse,
  DeleteOptions,
  DeleteResponse,
  GetResponse,
  ListOptions,
  ListResponse,
  ExistsResponse,
  StorageObject,
  StorageConfigurationException,
  FileNotFoundException,
  generateKey,
  sanitizeFilename,
} from '@kolo/core';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Config } from './interfaces';

/**
 * AWS S3 storage adapter
 */
export class S3StorageAdapter extends BaseStorageAdapter {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly basePath?: string;
  protected static readonly ADAPTER_NAME = 'S3';

  constructor(config: S3Config) {
    super(config, S3StorageAdapter.ADAPTER_NAME);

    if (!config.bucket) {
      throw new StorageConfigurationException('Bucket name is required for S3 storage', {
        provider: S3StorageAdapter.ADAPTER_NAME,
      });
    }

    if (!config.region) {
      throw new StorageConfigurationException('Region is required for S3 storage', {
        provider: S3StorageAdapter.ADAPTER_NAME,
      });
    }

    this.bucket = config.bucket;
    this.region = config.region;
    this.basePath = config.basePath;

    // Initialize the S3 client
    this.s3Client = new S3Client({
      region: config.region,
      credentials:
        config.accessKeyId && config.secretAccessKey
          ? {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            }
          : undefined,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
    });
  }

  /**
   * Upload a file to S3
   */
  protected async performUpload(
    file: StorageFile,
    options?: UploadOptions,
  ): Promise<UploadResponse> {
    try {
      const key = this.getFullKey(options?.key || this.generateFileKey(file.filename));
      const config = this.config as S3Config;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.content,
        ContentType: options?.contentType || file.mimeType,
        ACL: options?.public
          ? ('public-read' as ObjectCannedACL)
          : (config.acl as ObjectCannedACL | undefined),
        Metadata: options?.metadata
          ? Object.fromEntries(Object.entries(options.metadata).map(([k, v]) => [k, String(v)]))
          : undefined,
      });

      await this.s3Client.send(command);

      const url = this.getObjectUrl(key);

      return {
        success: true,
        key,
        url,
        publicUrl: options?.public ? url : undefined,
        size: file.size,
        metadata: {
          ...options?.metadata,
          filename: file.filename,
          mimeType: file.mimeType,
        },
      };
    } catch (error) {
      return this.handleError(error, 'Failed to upload file to S3');
    }
  }

  /**
   * Download a file from S3
   */
  protected async performDownload(
    key: string,
    options?: DownloadOptions,
  ): Promise<DownloadResponse> {
    try {
      const fullKey = this.getFullKey(key);

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fullKey,
      });

      const response = await this.s3Client.send(command);
      const content = await this.streamToBuffer(response.Body);

      const url = this.getObjectUrl(fullKey);

      // Generate signed URL if requested
      let signedUrl: string | undefined;
      if (options?.expiresIn) {
        signedUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: options.expiresIn,
        });
      }

      return {
        success: true,
        url,
        content,
        signedUrl,
      };
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to download file from S3');
    }
  }

  /**
   * Delete a file from S3
   */
  protected async performDelete(key: string, _options?: DeleteOptions): Promise<DeleteResponse> {
    try {
      const fullKey = this.getFullKey(key);

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fullKey,
      });

      await this.s3Client.send(command);

      return {
        success: true,
        key: fullKey,
      };
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to delete file from S3');
    }
  }

  /**
   * Get file metadata from S3
   */
  protected async performGet(key: string): Promise<GetResponse> {
    try {
      const fullKey = this.getFullKey(key);

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fullKey,
      });

      const response = await this.s3Client.send(command);

      const object: StorageObject = {
        key: fullKey,
        url: this.getObjectUrl(fullKey),
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        etag: response.ETag,
        metadata: response.Metadata,
      };

      return {
        success: true,
        object,
      };
    } catch (error: any) {
      if (error.name === 'NotFound') {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to get file metadata from S3');
    }
  }

  /**
   * List files in S3
   */
  protected async performList(options?: ListOptions): Promise<ListResponse> {
    try {
      const prefix = this.getFullKey(options?.prefix || '');

      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: options?.maxKeys,
        ContinuationToken: options?.continuationToken,
      });

      const response = await this.s3Client.send(command);

      const objects: StorageObject[] = (response.Contents || []).map((item) => ({
        key: item.Key!,
        url: this.getObjectUrl(item.Key!),
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag,
      }));

      return {
        success: true,
        result: {
          objects,
          nextContinuationToken: response.NextContinuationToken,
          hasMore: response.IsTruncated || false,
        },
      };
    } catch (error) {
      return this.handleError(error, 'Failed to list files from S3');
    }
  }

  /**
   * Check if file exists in S3
   */
  protected async performExists(key: string): Promise<ExistsResponse> {
    try {
      const fullKey = this.getFullKey(key);

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fullKey,
      });

      try {
        await this.s3Client.send(command);
        return { success: true, exists: true };
      } catch (error: any) {
        if (error.name === 'NotFound') {
          return { success: true, exists: false };
        }
        throw error;
      }
    } catch (error) {
      return this.handleError(error, 'Failed to check file existence in S3');
    }
  }

  /**
   * Check if adapter is ready
   */
  isReady(): boolean {
    return !!(this.config as S3Config).bucket && !!(this.config as S3Config).region;
  }

  /**
   * Get full key with base path
   */
  private getFullKey(key: string): string {
    if (this.basePath) {
      return `${this.basePath}/${key}`.replace(/\/+/g, '/');
    }
    return key;
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    if (!stream) {
      return Buffer.from([]);
    }

    if (Buffer.isBuffer(stream)) {
      return stream;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  /**
   * Get object URL
   */
  private getObjectUrl(key: string): string {
    const config = this.config as S3Config;
    if (config.endpoint) {
      return `${config.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Generate file key
   */
  private generateFileKey(filename: string): string {
    const sanitized = sanitizeFilename(filename);
    const parts = sanitized.split('.');
    const ext = parts.length > 1 ? parts[parts.length - 1] : '';
    const base = parts.slice(0, -1).join('.');
    return generateKey(base, ext);
  }

  /**
   * Handle errors
   */
  private handleError(
    error: unknown,
    defaultMessage: string,
  ):
    | UploadResponse
    | DownloadResponse
    | DeleteResponse
    | GetResponse
    | ListResponse
    | ExistsResponse {
    if (error instanceof Error) {
      return {
        success: false,
        error: {
          code: 'S3_ERROR',
          message: error.message || defaultMessage,
          details: error,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: defaultMessage,
        details: error,
      },
    };
  }
}
