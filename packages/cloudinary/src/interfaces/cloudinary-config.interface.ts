import { StorageConfig } from '@kolo/core';

/**
 * Cloudinary storage configuration
 */
export interface CloudinaryConfig extends StorageConfig {
  /**
   * Cloudinary cloud name
   */
  cloudName: string;

  /**
   * API key
   */
  apiKey: string;

  /**
   * API secret
   */
  apiSecret: string;

  /**
   * Default folder for uploads
   */
  folder?: string;

  /**
   * Whether to use secure URLs
   */
  secure?: boolean;

  /**
   * Resource type (image, video, raw, auto)
   */
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}
