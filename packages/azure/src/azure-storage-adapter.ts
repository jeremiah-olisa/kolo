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
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerClient,
} from '@azure/storage-blob';
import { AzureConfig } from './interfaces';

/**
 * Azure Blob Storage adapter
 */
export class AzureStorageAdapter extends BaseStorageAdapter {
  private readonly containerClient: ContainerClient;
  private readonly containerName: string;
  private readonly basePath?: string;
  protected static readonly ADAPTER_NAME = 'Azure';

  constructor(config: AzureConfig) {
    super(config, AzureStorageAdapter.ADAPTER_NAME);

    if (!config.containerName) {
      throw new StorageConfigurationException('Container name is required for Azure storage', {
        provider: AzureStorageAdapter.ADAPTER_NAME,
      });
    }

    if (!config.connectionString && (!config.accountName || !config.accountKey)) {
      throw new StorageConfigurationException(
        'Either connectionString or accountName/accountKey is required for Azure storage',
        {
          provider: AzureStorageAdapter.ADAPTER_NAME,
        },
      );
    }

    this.containerName = config.containerName;
    this.basePath = config.basePath;

    // Initialize the Azure Blob client
    let blobServiceClient: BlobServiceClient;

    if (config.connectionString) {
      blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
    } else if (config.accountName && config.accountKey) {
      const credential = new StorageSharedKeyCredential(config.accountName, config.accountKey);
      blobServiceClient = new BlobServiceClient(
        `https://${config.accountName}.blob.core.windows.net`,
        credential,
      );
    } else {
      throw new StorageConfigurationException('Invalid Azure configuration', {
        provider: AzureStorageAdapter.ADAPTER_NAME,
      });
    }

    this.containerClient = blobServiceClient.getContainerClient(config.containerName);
  }

  /**
   * Upload a file to Azure Blob Storage
   */
  protected async performUpload(
    file: StorageFile,
    options?: UploadOptions,
  ): Promise<UploadResponse> {
    try {
      const key = this.getFullKey(options?.key || this.generateFileKey(file.filename));
      const blockBlobClient = this.containerClient.getBlockBlobClient(key);

      await blockBlobClient.upload(file.content, file.size, {
        blobHTTPHeaders: {
          blobContentType: options?.contentType || file.mimeType,
        },
        metadata: options?.metadata
          ? Object.fromEntries(Object.entries(options.metadata).map(([k, v]) => [k, String(v)]))
          : undefined,
      });

      const url = blockBlobClient.url;

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
      return this.handleError(error, 'Failed to upload file to Azure Blob Storage');
    }
  }

  /**
   * Download a file from Azure Blob Storage
   */
  protected async performDownload(
    key: string,
    _options?: DownloadOptions,
  ): Promise<DownloadResponse> {
    try {
      const fullKey = this.getFullKey(key);
      const blockBlobClient = this.containerClient.getBlockBlobClient(fullKey);

      const downloadResponse = await blockBlobClient.download();
      const content = await this.streamToBuffer(downloadResponse.readableStreamBody);

      return {
        success: true,
        url: blockBlobClient.url,
        content,
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to download file from Azure Blob Storage');
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   */
  protected async performDelete(key: string, _options?: DeleteOptions): Promise<DeleteResponse> {
    try {
      const fullKey = this.getFullKey(key);
      const blockBlobClient = this.containerClient.getBlockBlobClient(fullKey);

      await blockBlobClient.delete();

      return {
        success: true,
        key: fullKey,
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to delete file from Azure Blob Storage');
    }
  }

  /**
   * Get file metadata from Azure Blob Storage
   */
  protected async performGet(key: string): Promise<GetResponse> {
    try {
      const fullKey = this.getFullKey(key);
      const blockBlobClient = this.containerClient.getBlockBlobClient(fullKey);

      const properties = await blockBlobClient.getProperties();

      const object: StorageObject = {
        key: fullKey,
        url: blockBlobClient.url,
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        etag: properties.etag,
        metadata: properties.metadata,
      };

      return {
        success: true,
        object,
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to get file metadata from Azure Blob Storage');
    }
  }

  /**
   * List files in Azure Blob Storage
   */
  protected async performList(options?: ListOptions): Promise<ListResponse> {
    try {
      const prefix = this.getFullKey(options?.prefix || '');
      const maxPageSize = options?.maxKeys || 1000;

      const objects: StorageObject[] = [];
      const iterator = this.containerClient
        .listBlobsFlat({
          prefix,
        })
        .byPage({ maxPageSize });

      const firstPage = await iterator.next();
      if (!firstPage.done && firstPage.value) {
        for (const blob of firstPage.value.segment.blobItems) {
          objects.push({
            key: blob.name,
            url: `${this.containerClient.url}/${blob.name}`,
            size: blob.properties.contentLength,
            contentType: blob.properties.contentType,
            lastModified: blob.properties.lastModified,
            etag: blob.properties.etag,
          });
        }
      }

      return {
        success: true,
        result: {
          objects,
          hasMore: !firstPage.done,
        },
      };
    } catch (error) {
      return this.handleError(error, 'Failed to list files from Azure Blob Storage');
    }
  }

  /**
   * Check if file exists in Azure Blob Storage
   */
  protected async performExists(key: string): Promise<ExistsResponse> {
    try {
      const fullKey = this.getFullKey(key);
      const blockBlobClient = this.containerClient.getBlockBlobClient(fullKey);

      const exists = await blockBlobClient.exists();

      return {
        success: true,
        exists,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to check file existence in Azure Blob Storage');
    }
  }

  /**
   * Check if adapter is ready
   */
  isReady(): boolean {
    const config = this.config as AzureConfig;
    return !!(
      config.containerName &&
      (config.connectionString || (config.accountName && config.accountKey))
    );
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
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: NodeJS.ReadableStream | undefined): Promise<Buffer> {
    if (!stream) {
      return Buffer.from([]);
    }

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
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
          code: 'AZURE_ERROR',
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
