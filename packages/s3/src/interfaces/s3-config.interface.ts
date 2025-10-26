import { StorageConfig } from '@kolo/core';

/**
 * S3 storage configuration
 */
export interface S3Config extends StorageConfig {
  /**
   * AWS region
   */
  region: string;

  /**
   * S3 bucket name
   */
  bucket: string;

  /**
   * AWS access key ID
   */
  accessKeyId?: string;

  /**
   * AWS secret access key
   */
  secretAccessKey?: string;

  /**
   * Custom S3 endpoint (for S3-compatible services)
   */
  endpoint?: string;

  /**
   * Whether to force path-style URLs
   */
  forcePathStyle?: boolean;

  /**
   * Default ACL for uploads
   */
  acl?: string;

  /**
   * Base path/prefix for all operations
   */
  basePath?: string;
}
