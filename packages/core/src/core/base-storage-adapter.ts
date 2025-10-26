import { IStorageAdapter } from '../interfaces/storage-adapter.interface';
import { StorageConfig } from '../interfaces/storage-config.interface';
import { StorageConfigurationException } from '../exceptions';
import {
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
} from '../interfaces';
import { StorageEventEmitter, StorageEvent } from '../events';
import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract base class for storage adapter implementations
 */
export abstract class BaseStorageAdapter implements IStorageAdapter {
  protected config: StorageConfig;
  protected providerName: string;
  protected eventEmitter: StorageEventEmitter;

  constructor(config: StorageConfig, providerName: string, eventEmitter?: StorageEventEmitter) {
    this.config = config;
    this.providerName = providerName;
    this.eventEmitter = eventEmitter || new StorageEventEmitter();
    this.validateConfig();
  }

  /**
   * Validate adapter configuration
   * @throws {StorageConfigurationException} If configuration is invalid
   */
  protected validateConfig(): void {
    if (!this.config) {
      throw new StorageConfigurationException(`${this.providerName}: Configuration is required`, {
        providerName: this.providerName,
      });
    }
  }

  /**
   * Get the provider name
   */
  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Check if the adapter is ready
   */
  isReady(): boolean {
    return !!this.config;
  }

  /**
   * Get the event emitter for this adapter
   */
  getEventEmitter(): StorageEventEmitter {
    return this.eventEmitter;
  }

  /**
   * Set a custom event emitter
   */
  setEventEmitter(emitter: StorageEventEmitter): void {
    this.eventEmitter = emitter;
  }

  /**
   * Upload with event hooks
   */
  async upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse> {
    const correlationId = options?.metadata?.correlationId as string | undefined || uuidv4();
    const startTime = Date.now();

    try {
      // Emit before upload event
      await this.eventEmitter.emit(StorageEvent.BEFORE_UPLOAD, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        file,
        options,
      });

      // Perform the actual upload
      const response = await this.performUpload(file, options);

      const duration = Date.now() - startTime;

      // Emit success event
      await this.eventEmitter.emit(StorageEvent.AFTER_UPLOAD_SUCCESS, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        file,
        options,
        response,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Emit failure event
      await this.eventEmitter.emit(StorageEvent.UPLOAD_FAILED, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        file,
        options,
        error: error as Error,
        duration,
      });

      throw error;
    }
  }

  /**
   * Download with event hooks
   */
  async download(key: string, options?: DownloadOptions): Promise<DownloadResponse> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      // Emit before download event
      await this.eventEmitter.emit(StorageEvent.BEFORE_DOWNLOAD, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        options,
      });

      // Perform the actual download
      const response = await this.performDownload(key, options);

      const duration = Date.now() - startTime;

      // Emit success event
      await this.eventEmitter.emit(StorageEvent.AFTER_DOWNLOAD_SUCCESS, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        options,
        response,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Emit failure event
      await this.eventEmitter.emit(StorageEvent.DOWNLOAD_FAILED, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        options,
        error: error as Error,
        duration,
      });

      throw error;
    }
  }

  /**
   * Delete with event hooks
   */
  async delete(key: string, options?: DeleteOptions): Promise<DeleteResponse> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      // Emit before delete event
      await this.eventEmitter.emit(StorageEvent.BEFORE_DELETE, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        options,
      });

      // Perform the actual delete
      const response = await this.performDelete(key, options);

      const duration = Date.now() - startTime;

      // Emit success event
      await this.eventEmitter.emit(StorageEvent.AFTER_DELETE_SUCCESS, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        options,
        response,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Emit failure event
      await this.eventEmitter.emit(StorageEvent.DELETE_FAILED, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        options,
        error: error as Error,
        duration,
      });

      throw error;
    }
  }

  /**
   * Get with event hooks
   */
  async get(key: string): Promise<GetResponse> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      // Emit before get event
      await this.eventEmitter.emit(StorageEvent.BEFORE_GET, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
      });

      // Perform the actual get
      const response = await this.performGet(key);

      const duration = Date.now() - startTime;

      // Emit success event
      await this.eventEmitter.emit(StorageEvent.AFTER_GET_SUCCESS, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        response,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Emit failure event
      await this.eventEmitter.emit(StorageEvent.GET_FAILED, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        error: error as Error,
        duration,
      });

      throw error;
    }
  }

  /**
   * List with event hooks
   */
  async list(options?: ListOptions): Promise<ListResponse> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      // Emit before list event
      await this.eventEmitter.emit(StorageEvent.BEFORE_LIST, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        options,
      });

      // Perform the actual list
      const response = await this.performList(options);

      const duration = Date.now() - startTime;

      // Emit success event
      await this.eventEmitter.emit(StorageEvent.AFTER_LIST_SUCCESS, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        options,
        response,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Emit failure event
      await this.eventEmitter.emit(StorageEvent.LIST_FAILED, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        options,
        error: error as Error,
        duration,
      });

      throw error;
    }
  }

  /**
   * Exists with event hooks
   */
  async exists(key: string): Promise<ExistsResponse> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      // Emit before exists event
      await this.eventEmitter.emit(StorageEvent.BEFORE_EXISTS, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
      });

      // Perform the actual exists check
      const response = await this.performExists(key);

      const duration = Date.now() - startTime;

      // Emit success event
      await this.eventEmitter.emit(StorageEvent.AFTER_EXISTS_SUCCESS, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        response,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Emit failure event
      await this.eventEmitter.emit(StorageEvent.EXISTS_FAILED, {
        adapterName: this.providerName,
        timestamp: new Date(),
        correlationId,
        key,
        error: error as Error,
        duration,
      });

      throw error;
    }
  }

  // Abstract methods to be implemented by concrete classes
  protected abstract performUpload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
  protected abstract performDownload(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
  protected abstract performDelete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
  protected abstract performGet(key: string): Promise<GetResponse>;
  protected abstract performList(options?: ListOptions): Promise<ListResponse>;
  protected abstract performExists(key: string): Promise<ExistsResponse>;
}
