/**
 * Base configuration for all storage adapters
 */
export interface StorageConfig {
  /**
   * Provider name
   */
  provider: string;

  /**
   * Whether to enable debug logging
   */
  debug?: boolean;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}
