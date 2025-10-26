import { StorageObject, ListResult } from '../types';

/**
 * Response interfaces for storage operations
 */
export interface UploadResponse {
  success: boolean;
  key?: string;
  url?: string;
  publicUrl?: string;
  size?: number;
  metadata?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  raw?: unknown;
}

export interface DownloadResponse {
  success: boolean;
  url?: string;
  signedUrl?: string;
  content?: Buffer;
  metadata?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  raw?: unknown;
}

export interface DeleteResponse {
  success: boolean;
  key?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  raw?: unknown;
}

export interface GetResponse {
  success: boolean;
  object?: StorageObject;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  raw?: unknown;
}

export interface ListResponse {
  success: boolean;
  result?: ListResult;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  raw?: unknown;
}

export interface ExistsResponse {
  success: boolean;
  exists?: boolean;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  raw?: unknown;
}
