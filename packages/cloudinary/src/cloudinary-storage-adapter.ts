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
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CloudinaryConfig } from './interfaces';

/**
 * Cloudinary storage adapter
 */
export class CloudinaryStorageAdapter extends BaseStorageAdapter {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly folder?: string;
  private readonly secure: boolean;
  private readonly resourceType: string;
  protected static readonly ADAPTER_NAME = 'Cloudinary';

  constructor(config: CloudinaryConfig) {
    super(config, CloudinaryStorageAdapter.ADAPTER_NAME);

    if (!config.cloudName) {
      throw new StorageConfigurationException('Cloud name is required for Cloudinary storage', {
        provider: CloudinaryStorageAdapter.ADAPTER_NAME,
      });
    }

    if (!config.apiKey) {
      throw new StorageConfigurationException('API key is required for Cloudinary storage', {
        provider: CloudinaryStorageAdapter.ADAPTER_NAME,
      });
    }

    if (!config.apiSecret) {
      throw new StorageConfigurationException('API secret is required for Cloudinary storage', {
        provider: CloudinaryStorageAdapter.ADAPTER_NAME,
      });
    }

    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.folder = config.folder;
    this.secure = config.secure !== false;
    this.resourceType = config.resourceType || 'auto';

    // Initialize the Cloudinary client
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: this.secure,
    });
  }

  /**
   * Upload a file to Cloudinary
   */
  protected async performUpload(
    file: StorageFile,
    options?: UploadOptions,
  ): Promise<UploadResponse> {
    try {
      const publicId = options?.key || this.generateFileKey(file.filename);
      const fullPublicId = this.folder ? `${this.folder}/${publicId}` : publicId;

      // Convert buffer to base64 data URI
      const base64Data = `data:${file.mimeType};base64,${file.content.toString('base64')}`;

      const result: UploadApiResponse = await cloudinary.uploader.upload(base64Data, {
        public_id: fullPublicId,
        resource_type: this.getResourceType(file.mimeType),
        context: options?.metadata
          ? Object.fromEntries(Object.entries(options.metadata).map(([k, v]) => [k, String(v)]))
          : undefined,
        tags: options?.metadata?.tags ? String(options.metadata.tags).split(',') : undefined,
      });

      return {
        success: true,
        key: result.public_id,
        url: result.secure_url || result.url,
        publicUrl: result.url,
        size: file.size,
        metadata: {
          ...options?.metadata,
          filename: file.filename,
          mimeType: file.mimeType,
          cloudinaryPublicId: result.public_id,
          cloudinaryVersion: String(result.version),
        },
      };
    } catch (error) {
      return this.handleError(error, 'Failed to upload file to Cloudinary');
    }
  }

  /**
   * Download a file from Cloudinary (get URL)
   */
  protected async performDownload(
    key: string,
    options?: DownloadOptions,
  ): Promise<DownloadResponse> {
    try {
      const url = cloudinary.url(key, {
        resource_type: this.resourceType,
        secure: this.secure,
        sign_url: true,
        expires_at: options?.expiresIn
          ? Math.floor(Date.now() / 1000) + options.expiresIn
          : undefined,
        attachment: options?.forceDownload,
        custom_filename: options?.filename,
      });

      return {
        success: true,
        url,
        signedUrl: url,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get file URL from Cloudinary');
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  protected async performDelete(key: string, _options?: DeleteOptions): Promise<DeleteResponse> {
    try {
      const result = await cloudinary.uploader.destroy(key, {
        resource_type: this.resourceType,
        invalidate: true,
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Failed to delete file: ${result.result}`);
      }

      return {
        success: true,
        key,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to delete file from Cloudinary');
    }
  }

  /**
   * Get file metadata from Cloudinary
   */
  protected async performGet(key: string): Promise<GetResponse> {
    try {
      const result: any = await cloudinary.api.resource(key, {
        resource_type: this.resourceType,
      });

      const object: StorageObject = {
        key: result.public_id,
        url: result.secure_url || result.url,
        publicUrl: result.url,
        size: result.bytes,
        contentType: result.format,
        lastModified: new Date(result.created_at),
        metadata: result.context,
      };

      return {
        success: true,
        object,
      };
    } catch (error: any) {
      if (error.error?.http_code === 404) {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to get file metadata from Cloudinary');
    }
  }

  /**
   * List files in Cloudinary
   */
  protected async performList(options?: ListOptions): Promise<ListResponse> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: options?.prefix || this.folder,
        max_results: options?.maxKeys || 500,
        next_cursor: options?.continuationToken,
        resource_type: this.resourceType,
      });

      const objects: StorageObject[] = result.resources.map((resource: any) => ({
        key: resource.public_id,
        url: resource.secure_url || resource.url,
        publicUrl: resource.url,
        size: resource.bytes,
        contentType: resource.format,
        lastModified: new Date(resource.created_at),
        metadata: resource.context,
      }));

      return {
        success: true,
        result: {
          objects,
          nextContinuationToken: result.next_cursor,
          hasMore: !!result.next_cursor,
        },
      };
    } catch (error) {
      return this.handleError(error, 'Failed to list files from Cloudinary');
    }
  }

  /**
   * Check if file exists in Cloudinary
   */
  protected async performExists(key: string): Promise<ExistsResponse> {
    try {
      try {
        await cloudinary.api.resource(key, { resource_type: this.resourceType });
        return { success: true, exists: true };
      } catch (error: any) {
        if (error.error?.http_code === 404) {
          return { success: true, exists: false };
        }
        throw error;
      }
    } catch (error) {
      return this.handleError(error, 'Failed to check file existence in Cloudinary');
    }
  }

  /**
   * Check if adapter is ready
   */
  isReady(): boolean {
    const config = this.config as CloudinaryConfig;
    return !!(config.cloudName && config.apiKey && config.apiSecret);
  }

  /**
   * Get resource type from MIME type
   */
  private getResourceType(mimeType: string): 'image' | 'video' | 'raw' | 'auto' {
    if (this.resourceType !== 'auto') {
      return this.resourceType as 'image' | 'video' | 'raw' | 'auto';
    }

    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    return 'raw';
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
          code: 'CLOUDINARY_ERROR',
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
