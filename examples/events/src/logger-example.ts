/**
 * Logger Example: Comprehensive Logging for Storage Operations
 *
 * This example demonstrates how to create a comprehensive logger
 * that tracks all storage operations with detailed information.
 */

import { StorageManager, StorageEventEmitter, StorageEvent, LocalConfig } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/local';
import * as path from 'path';

/**
 * Storage Logger Class
 * Logs all storage operations to console with structured data
 */
class StorageLogger {
  constructor(private eventEmitter: StorageEventEmitter) {
    this.setupListeners();
  }

  private setupListeners() {
    // Upload events
    this.eventEmitter.on(StorageEvent.BEFORE_UPLOAD, (data) => {
      this.log('info', 'UPLOAD_START', {
        adapter: data.adapterName,
        filename: data.file.filename,
        size: data.file.size,
        mimeType: data.file.mimeType,
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
      this.log('info', 'UPLOAD_SUCCESS', {
        adapter: data.adapterName,
        key: data.response.key,
        url: data.response.url,
        size: data.response.size,
        duration: data.duration,
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.UPLOAD_FAILED, (data) => {
      this.log('error', 'UPLOAD_FAILED', {
        adapter: data.adapterName,
        filename: data.file.filename,
        error: data.error.message,
        duration: data.duration,
        correlationId: data.correlationId,
      });
    });

    // Download events
    this.eventEmitter.on(StorageEvent.BEFORE_DOWNLOAD, (data) => {
      this.log('info', 'DOWNLOAD_START', {
        adapter: data.adapterName,
        key: data.key,
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.AFTER_DOWNLOAD_SUCCESS, (data) => {
      this.log('info', 'DOWNLOAD_SUCCESS', {
        adapter: data.adapterName,
        key: data.key,
        duration: data.duration,
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.DOWNLOAD_FAILED, (data) => {
      this.log('error', 'DOWNLOAD_FAILED', {
        adapter: data.adapterName,
        key: data.key,
        error: data.error.message,
        duration: data.duration,
        correlationId: data.correlationId,
      });
    });

    // Delete events
    this.eventEmitter.on(StorageEvent.BEFORE_DELETE, (data) => {
      this.log('info', 'DELETE_START', {
        adapter: data.adapterName,
        key: data.key,
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.AFTER_DELETE_SUCCESS, (data) => {
      this.log('info', 'DELETE_SUCCESS', {
        adapter: data.adapterName,
        key: data.key,
        duration: data.duration,
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.DELETE_FAILED, (data) => {
      this.log('error', 'DELETE_FAILED', {
        adapter: data.adapterName,
        key: data.key,
        error: data.error.message,
        duration: data.duration,
        correlationId: data.correlationId,
      });
    });

    // List events
    this.eventEmitter.on(StorageEvent.BEFORE_LIST, (data) => {
      this.log('info', 'LIST_START', {
        adapter: data.adapterName,
        prefix: data.options?.prefix,
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.AFTER_LIST_SUCCESS, (data) => {
      this.log('info', 'LIST_SUCCESS', {
        adapter: data.adapterName,
        count: data.response.result?.objects.length,
        duration: data.duration,
        correlationId: data.correlationId,
      });
    });
  }

  private log(level: string, event: string, data: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      event,
      ...data,
    };

    // Format for console output
    const color = level === 'error' ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(`${color}[${timestamp}] ${level.toUpperCase()} - ${event}${reset}`);
    console.log(JSON.stringify(logEntry, null, 2));
    console.log('');
  }
}

async function main() {
  console.log('📝 Kolo Storage - Logger Example\n');

  // Setup Storage Manager
  const storageManager = new StorageManager({
    defaultAdapter: 'local',
    adapters: [
      {
        name: 'local',
        enabled: true,
        config: {
          provider: 'local',
          rootPath: path.join(__dirname, '../temp-uploads'),
          baseUrl: 'http://localhost:3000/uploads',
          createDirectory: true,
        },
      },
    ],
  });

  // Register adapter factory
  storageManager.registerFactory<LocalConfig>('local', (config) => {
    return new LocalStorageAdapter(config);
  });

  // Get adapter and set up logger
  const adapter = storageManager.getDefaultAdapter();
  const logger = new StorageLogger(adapter.getEventEmitter());

  console.log('✅ Logger initialized\n');
  console.log('📦 Performing storage operations...\n');

  // Perform various operations
  try {
    // Upload a file
    const uploadResult = await adapter.upload({
      filename: 'test-log.txt',
      content: Buffer.from('This is a test file for logging'),
      mimeType: 'text/plain',
      size: 31,
    });

    // Download the file
    await adapter.download(uploadResult.key!);

    // List files
    await adapter.list({ maxKeys: 10 });

    // Check if file exists
    await adapter.exists(uploadResult.key!);

    // Get file metadata
    await adapter.get(uploadResult.key!);

    // Delete the file
    await adapter.delete(uploadResult.key!);

    console.log('\n✅ All operations completed successfully!');
  } catch (error) {
    console.error('\n❌ Operation failed:', error);
  }
}

// Run the example
main()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
