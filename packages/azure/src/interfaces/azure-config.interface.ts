import { StorageConfig } from '@kolo/core';

/**
 * Azure Blob Storage configuration
 */
export interface AzureConfig extends StorageConfig {
  /**
   * Azure storage account name
   */
  accountName: string;

  /**
   * Azure storage account key
   */
  accountKey?: string;

  /**
   * Container name
   */
  containerName: string;

  /**
   * Connection string (alternative to accountName/accountKey)
   */
  connectionString?: string;

  /**
   * Base path/prefix for all operations
   */
  basePath?: string;
}
