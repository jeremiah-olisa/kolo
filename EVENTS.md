# Kolo Events System

The Kolo storage system provides a comprehensive event system that allows you to listen to and intercept storage operations. This enables powerful features like logging, monitoring, validation, and custom business logic.

## Table of Contents

- [Overview](#overview)
- [Event Types](#event-types)
- [Usage Examples](#usage-examples)
  - [Basic Event Listening](#basic-event-listening)
  - [Creating a Logger](#creating-a-logger)
  - [Creating an Interceptor](#creating-an-interceptor)
  - [Error Handling](#error-handling)
- [Event Data](#event-data)
- [Best Practices](#best-practices)

## Overview

Every storage operation emits three types of events:

1. **Before events** - Triggered before the operation starts
2. **Success events** - Triggered after successful completion
3. **Failed events** - Triggered when the operation fails

This allows you to:

- Log all storage operations
- Monitor performance and track durations
- Validate inputs before operations
- Transform or enrich data
- Implement custom error handling
- Track correlation IDs across operations
- Build analytics and metrics

## Event Types

### Upload Events

- `beforeUpload` - Before a file upload starts
- `afterUploadSuccess` - After a successful upload
- `uploadFailed` - When an upload fails

### Download Events

- `beforeDownload` - Before a file download starts
- `afterDownloadSuccess` - After a successful download
- `downloadFailed` - When a download fails

### Delete Events

- `beforeDelete` - Before a file deletion starts
- `afterDeleteSuccess` - After a successful deletion
- `deleteFailed` - When a deletion fails

### Get Events

- `beforeGet` - Before getting file metadata
- `afterGetSuccess` - After successfully getting metadata
- `getFailed` - When getting metadata fails

### List Events

- `beforeList` - Before listing files
- `afterListSuccess` - After successfully listing files
- `listFailed` - When listing fails

### Exists Events

- `beforeExists` - Before checking if a file exists
- `afterExistsSuccess` - After successfully checking existence
- `existsFailed` - When existence check fails

## Usage Examples

### Basic Event Listening

```typescript
import { StorageManager, StorageEvent } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/local';

// Create storage manager
const storageManager = new StorageManager({
  defaultAdapter: 'local',
  adapters: [
    {
      name: 'local',
      enabled: true,
      config: {
        provider: 'local',
        rootPath: './uploads',
      },
    },
  ],
});

// Register adapter
storageManager.registerFactory('local', (config) => new LocalStorageAdapter(config));

// Get adapter
const adapter = storageManager.getDefaultAdapter();

// Get event emitter
const events = adapter.getEventEmitter();

// Listen to upload events
events.on(StorageEvent.BEFORE_UPLOAD, (data) => {
  console.log(`Starting upload: ${data.file.filename}`);
});

events.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
  console.log(`Upload completed: ${data.response.key} (${data.duration}ms)`);
});

events.on(StorageEvent.UPLOAD_FAILED, (data) => {
  console.error(`Upload failed: ${data.error.message} (${data.duration}ms)`);
});

// Perform an upload
await adapter.upload({
  filename: 'example.txt',
  content: Buffer.from('Hello, World!'),
  mimeType: 'text/plain',
  size: 13,
});
```

### Creating a Logger

Create a comprehensive logger that tracks all storage operations:

```typescript
import { StorageEventEmitter, StorageEvent } from '@kolo/core';

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
        correlationId: data.correlationId,
      });
    });

    this.eventEmitter.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
      this.log('info', 'UPLOAD_SUCCESS', {
        adapter: data.adapterName,
        key: data.response.key,
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
  }

  private log(level: string, event: string, data: any) {
    const timestamp = new Date().toISOString();
    console.log(
      JSON.stringify({
        timestamp,
        level,
        event,
        ...data,
      }),
    );
  }
}

// Usage
const adapter = storageManager.getDefaultAdapter();
const logger = new StorageLogger(adapter.getEventEmitter());
```

### Creating an Interceptor

Create an interceptor that validates files before upload:

```typescript
import { StorageEventEmitter, StorageEvent } from '@kolo/core';

class FileValidationInterceptor {
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private eventEmitter: StorageEventEmitter,
    options: {
      maxFileSize?: number;
      allowedMimeTypes?: string[];
    } = {},
  ) {
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.allowedMimeTypes = options.allowedMimeTypes || [];
    this.setupInterceptor();
  }

  private setupInterceptor() {
    this.eventEmitter.on(StorageEvent.BEFORE_UPLOAD, (data) => {
      // Validate file size
      if (data.file.size > this.maxFileSize) {
        throw new Error(
          `File size ${data.file.size} exceeds maximum allowed size ${this.maxFileSize}`,
        );
      }

      // Validate MIME type if restrictions are set
      if (this.allowedMimeTypes.length > 0) {
        if (!this.allowedMimeTypes.includes(data.file.mimeType)) {
          throw new Error(
            `File type ${data.file.mimeType} is not allowed. ` +
              `Allowed types: ${this.allowedMimeTypes.join(', ')}`,
          );
        }
      }

      console.log(`✓ File validation passed: ${data.file.filename}`);
    });
  }
}

// Usage
const adapter = storageManager.getDefaultAdapter();
const validator = new FileValidationInterceptor(adapter.getEventEmitter(), {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
});

// This will pass validation
await adapter.upload({
  filename: 'image.jpg',
  content: Buffer.from('...'),
  mimeType: 'image/jpeg',
  size: 1024 * 1024, // 1MB
});

// This will fail validation (too large)
try {
  await adapter.upload({
    filename: 'large-file.jpg',
    content: Buffer.from('...'),
    mimeType: 'image/jpeg',
    size: 10 * 1024 * 1024, // 10MB
  });
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Creating a Performance Monitor

Track and analyze performance metrics:

```typescript
import { StorageEventEmitter, StorageEvent } from '@kolo/core';

interface PerformanceMetrics {
  operation: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  failures: number;
}

class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();

  constructor(private eventEmitter: StorageEventEmitter) {
    this.setupMonitoring();
  }

  private setupMonitoring() {
    // Track upload performance
    this.eventEmitter.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
      this.recordMetric('upload', data.duration);
    });

    this.eventEmitter.on(StorageEvent.UPLOAD_FAILED, (data) => {
      this.recordMetric('upload', data.duration, true);
    });

    // Track download performance
    this.eventEmitter.on(StorageEvent.AFTER_DOWNLOAD_SUCCESS, (data) => {
      this.recordMetric('download', data.duration);
    });

    this.eventEmitter.on(StorageEvent.DOWNLOAD_FAILED, (data) => {
      this.recordMetric('download', data.duration, true);
    });

    // Track delete performance
    this.eventEmitter.on(StorageEvent.AFTER_DELETE_SUCCESS, (data) => {
      this.recordMetric('delete', data.duration);
    });

    this.eventEmitter.on(StorageEvent.DELETE_FAILED, (data) => {
      this.recordMetric('delete', data.duration, true);
    });
  }

  private recordMetric(operation: string, duration: number, failed = false) {
    const existing = this.metrics.get(operation) || {
      operation,
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      failures: 0,
    };

    existing.count++;
    existing.totalDuration += duration;
    existing.avgDuration = existing.totalDuration / existing.count;
    existing.minDuration = Math.min(existing.minDuration, duration);
    existing.maxDuration = Math.max(existing.maxDuration, duration);

    if (failed) {
      existing.failures++;
    }

    this.metrics.set(operation, existing);
  }

  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  printReport() {
    console.log('\n📊 Performance Report\n');
    console.log('Operation  | Count | Avg (ms) | Min (ms) | Max (ms) | Failures');
    console.log('-----------|-------|----------|----------|----------|----------');

    this.getMetrics().forEach((metric) => {
      console.log(
        `${metric.operation.padEnd(10)} | ` +
          `${metric.count.toString().padEnd(5)} | ` +
          `${metric.avgDuration.toFixed(2).padEnd(8)} | ` +
          `${metric.minDuration.toFixed(2).padEnd(8)} | ` +
          `${metric.maxDuration.toFixed(2).padEnd(8)} | ` +
          `${metric.failures}`,
      );
    });
  }
}

// Usage
const adapter = storageManager.getDefaultAdapter();
const monitor = new PerformanceMonitor(adapter.getEventEmitter());

// Perform operations...
await adapter.upload(/* ... */);
await adapter.download(/* ... */);
await adapter.delete(/* ... */);

// Print performance report
monitor.printReport();
```

### Error Handling

Handle errors gracefully with retry logic:

```typescript
import { StorageEventEmitter, StorageEvent } from '@kolo/core';

class RetryHandler {
  private retryMap = new Map<string, number>();

  constructor(
    private eventEmitter: StorageEventEmitter,
    private maxRetries: number = 3,
  ) {
    this.setupRetryLogic();
  }

  private setupRetryLogic() {
    this.eventEmitter.on(StorageEvent.UPLOAD_FAILED, async (data) => {
      const key = data.correlationId || 'unknown';
      const retries = this.retryMap.get(key) || 0;

      if (retries < this.maxRetries) {
        this.retryMap.set(key, retries + 1);
        console.log(`⚠️ Upload failed, retrying (${retries + 1}/${this.maxRetries})...`);

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, retries) * 1000);

        // Note: In a real implementation, you would need to trigger
        // the retry through the adapter reference
      } else {
        console.error(`❌ Upload failed after ${this.maxRetries} retries`);
        this.retryMap.delete(key);
      }
    });

    this.eventEmitter.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
      // Clear retry count on success
      if (data.correlationId) {
        this.retryMap.delete(data.correlationId);
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Usage
const adapter = storageManager.getDefaultAdapter();
const retryHandler = new RetryHandler(adapter.getEventEmitter(), 3);
```

## Event Data

All events include a base set of properties:

- `adapterName` - Name of the storage adapter that triggered the event
- `timestamp` - When the event was triggered
- `correlationId` - Unique ID to track related events

### Before Events

Before events include the operation parameters:

```typescript
interface BeforeUploadData {
  adapterName: string;
  timestamp: Date;
  correlationId: string;
  file: StorageFile;
  options?: UploadOptions;
}
```

### Success Events

Success events include the response and duration:

```typescript
interface AfterUploadSuccessData {
  adapterName: string;
  timestamp: Date;
  correlationId: string;
  file: StorageFile;
  options?: UploadOptions;
  response: UploadResponse;
  duration: number; // in milliseconds
}
```

### Failed Events

Failed events include the error and duration:

```typescript
interface UploadFailedData {
  adapterName: string;
  timestamp: Date;
  correlationId: string;
  file: StorageFile;
  options?: UploadOptions;
  error: Error;
  duration: number; // in milliseconds
}
```

## Best Practices

### 1. Use Correlation IDs

Track related operations by passing a correlation ID:

```typescript
const correlationId = 'user-123-upload-456';

await adapter.upload(
  {
    filename: 'document.pdf',
    content: buffer,
    mimeType: 'application/pdf',
    size: buffer.length,
  },
  {
    metadata: { correlationId },
  },
);
```

### 2. Async Event Handlers

Event handlers can be async and will be awaited:

```typescript
events.on(StorageEvent.AFTER_UPLOAD_SUCCESS, async (data) => {
  // Async operations are supported
  await saveToDatabase(data.response.key);
  await notifyWebhook(data);
});
```

### 3. Unsubscribe When Done

Clean up event listeners when they're no longer needed:

```typescript
const unsubscribe = events.on(StorageEvent.BEFORE_UPLOAD, (data) => {
  console.log('Upload starting...');
});

// Later, when you're done
unsubscribe();

// Or remove all listeners for an event
events.removeAllListeners(StorageEvent.BEFORE_UPLOAD);
```

### 4. One-Time Listeners

Use `once` for events that should only fire once:

```typescript
events.once(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
  console.log('First upload completed!');
});
```

### 5. Error Handling in Listeners

Always handle errors in your event listeners:

```typescript
events.on(StorageEvent.AFTER_UPLOAD_SUCCESS, async (data) => {
  try {
    await sendNotification(data);
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't let errors in listeners break the storage operation
  }
});
```

### 6. Centralized Event Management

Create a central event manager for your application:

```typescript
class StorageEventManager {
  private logger: StorageLogger;
  private monitor: PerformanceMonitor;
  private validator: FileValidationInterceptor;

  constructor(adapter: IStorageAdapter) {
    const emitter = adapter.getEventEmitter();

    this.logger = new StorageLogger(emitter);
    this.monitor = new PerformanceMonitor(emitter);
    this.validator = new FileValidationInterceptor(emitter, {
      maxFileSize: 10 * 1024 * 1024,
    });
  }

  getMonitor() {
    return this.monitor;
  }
}

// Usage
const eventManager = new StorageEventManager(adapter);

// Later...
eventManager.getMonitor().printReport();
```

## Sharing Events Across Adapters

You can share a single event emitter across multiple adapters:

```typescript
import { StorageEventEmitter } from '@kolo/core';

// Create a shared event emitter
const sharedEmitter = new StorageEventEmitter();

// Register a logger that will log all operations from all adapters
const logger = new StorageLogger(sharedEmitter);

// Create adapters with the shared emitter
const localAdapter = new LocalStorageAdapter(localConfig);
localAdapter.setEventEmitter(sharedEmitter);

const s3Adapter = new S3StorageAdapter(s3Config);
s3Adapter.setEventEmitter(sharedEmitter);

// Now all operations from both adapters will be logged
await localAdapter.upload(/* ... */);
await s3Adapter.upload(/* ... */);
```

## Conclusion

The Kolo event system provides a powerful and flexible way to extend storage functionality without modifying the core library. Use it to build logging, monitoring, validation, and custom business logic that integrates seamlessly with your storage operations.
