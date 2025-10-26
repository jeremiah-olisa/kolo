import { StorageConfig } from '@kolo/core';

/**
 * Local filesystem storage configuration
 */
export interface LocalConfig extends StorageConfig {
  /**
   * Root directory for file storage
   */
  rootPath: string;

  /**
   * Base URL for serving files
   */
  baseUrl?: string;

  /**
   * Whether to create directory if it doesn't exist
   */
  createDirectory?: boolean;

  /**
   * File permissions (Unix-style)
   */
  filePermissions?: number;

  /**
   * Directory permissions (Unix-style)
   */
  directoryPermissions?: number;
}
