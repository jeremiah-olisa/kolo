/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageFile, UploadOptions, DownloadOptions, DeleteOptions, ListOptions } from '../types';
import {
  UploadResponse,
  DownloadResponse,
  DeleteResponse,
  GetResponse,
  ListResponse,
  ExistsResponse,
} from '../interfaces';

/**
 * Base event data that all events extend from
 */
export interface BaseEventData {
  /**
   * Name of the storage adapter that triggered the event
   */
  adapterName: string;

  /**
   * Timestamp when the event was triggered
   */
  timestamp: Date;

  /**
   * Optional correlation ID for tracking related events
   */
  correlationId?: string;
}

/**
 * Event data for upload operations
 */
export interface UploadEventData extends BaseEventData {
  file: StorageFile;
  options?: UploadOptions;
}

export interface UploadSuccessEventData extends UploadEventData {
  response: UploadResponse;
  duration: number;
}

export interface UploadFailedEventData extends UploadEventData {
  error: Error;
  duration: number;
}

/**
 * Event data for download operations
 */
export interface DownloadEventData extends BaseEventData {
  key: string;
  options?: DownloadOptions;
}

export interface DownloadSuccessEventData extends DownloadEventData {
  response: DownloadResponse;
  duration: number;
}

export interface DownloadFailedEventData extends DownloadEventData {
  error: Error;
  duration: number;
}

/**
 * Event data for delete operations
 */
export interface DeleteEventData extends BaseEventData {
  key: string;
  options?: DeleteOptions;
}

export interface DeleteSuccessEventData extends DeleteEventData {
  response: DeleteResponse;
  duration: number;
}

export interface DeleteFailedEventData extends DeleteEventData {
  error: Error;
  duration: number;
}

/**
 * Event data for get operations
 */
export interface GetEventData extends BaseEventData {
  key: string;
}

export interface GetSuccessEventData extends GetEventData {
  response: GetResponse;
  duration: number;
}

export interface GetFailedEventData extends GetEventData {
  error: Error;
  duration: number;
}

/**
 * Event data for list operations
 */
export interface ListEventData extends BaseEventData {
  options?: ListOptions;
}

export interface ListSuccessEventData extends ListEventData {
  response: ListResponse;
  duration: number;
}

export interface ListFailedEventData extends ListEventData {
  error: Error;
  duration: number;
}

/**
 * Event data for exists operations
 */
export interface ExistsEventData extends BaseEventData {
  key: string;
}

export interface ExistsSuccessEventData extends ExistsEventData {
  response: ExistsResponse;
  duration: number;
}

export interface ExistsFailedEventData extends ExistsEventData {
  error: Error;
  duration: number;
}

/**
 * All possible storage events
 */
export enum StorageEvent {
  // Upload events
  BEFORE_UPLOAD = 'beforeUpload',
  AFTER_UPLOAD_SUCCESS = 'afterUploadSuccess',
  UPLOAD_FAILED = 'uploadFailed',

  // Download events
  BEFORE_DOWNLOAD = 'beforeDownload',
  AFTER_DOWNLOAD_SUCCESS = 'afterDownloadSuccess',
  DOWNLOAD_FAILED = 'downloadFailed',

  // Delete events
  BEFORE_DELETE = 'beforeDelete',
  AFTER_DELETE_SUCCESS = 'afterDeleteSuccess',
  DELETE_FAILED = 'deleteFailed',

  // Get events
  BEFORE_GET = 'beforeGet',
  AFTER_GET_SUCCESS = 'afterGetSuccess',
  GET_FAILED = 'getFailed',

  // List events
  BEFORE_LIST = 'beforeList',
  AFTER_LIST_SUCCESS = 'afterListSuccess',
  LIST_FAILED = 'listFailed',

  // Exists events
  BEFORE_EXISTS = 'beforeExists',
  AFTER_EXISTS_SUCCESS = 'afterExistsSuccess',
  EXISTS_FAILED = 'existsFailed',
}

/**
 * Event data mapping for type safety
 */
export interface StorageEventDataMap {
  [StorageEvent.BEFORE_UPLOAD]: UploadEventData;
  [StorageEvent.AFTER_UPLOAD_SUCCESS]: UploadSuccessEventData;
  [StorageEvent.UPLOAD_FAILED]: UploadFailedEventData;

  [StorageEvent.BEFORE_DOWNLOAD]: DownloadEventData;
  [StorageEvent.AFTER_DOWNLOAD_SUCCESS]: DownloadSuccessEventData;
  [StorageEvent.DOWNLOAD_FAILED]: DownloadFailedEventData;

  [StorageEvent.BEFORE_DELETE]: DeleteEventData;
  [StorageEvent.AFTER_DELETE_SUCCESS]: DeleteSuccessEventData;
  [StorageEvent.DELETE_FAILED]: DeleteFailedEventData;

  [StorageEvent.BEFORE_GET]: GetEventData;
  [StorageEvent.AFTER_GET_SUCCESS]: GetSuccessEventData;
  [StorageEvent.GET_FAILED]: GetFailedEventData;

  [StorageEvent.BEFORE_LIST]: ListEventData;
  [StorageEvent.AFTER_LIST_SUCCESS]: ListSuccessEventData;
  [StorageEvent.LIST_FAILED]: ListFailedEventData;

  [StorageEvent.BEFORE_EXISTS]: ExistsEventData;
  [StorageEvent.AFTER_EXISTS_SUCCESS]: ExistsSuccessEventData;
  [StorageEvent.EXISTS_FAILED]: ExistsFailedEventData;
}

/**
 * Event listener function type
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>;

/**
 * Event interceptor that can modify the event data or cancel the operation
 */
export interface EventInterceptor<T = any> {
  (data: T): T | Promise<T> | null | Promise<null>;
}
