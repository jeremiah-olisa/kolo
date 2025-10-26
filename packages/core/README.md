# @kolo/core

Secure storage adapter for documents and files (Kolo means "piggybank" or "secure box" in Yoruba).

**Status:** ✅ Production Ready

## Features

- 📦 **Multiple storage backends** - S3, Azure Blob, Cloudinary, Local filesystem
- 🏭 **Factory Pattern** - Easy registration and management of multiple adapters
- 🔄 **Fallback Support** - Automatic fallback to alternative adapters
- 📡 **Event System** - Comprehensive hooks for all storage operations
- 🔍 **Interceptors** - Validate and transform data before operations
- 📊 **Performance Monitoring** - Built-in support for tracking metrics
- 🎯 **Type-Safe** - Full TypeScript support
- 🛡️ **Secure** - Production-ready file handling

## Installation

```bash
npm install @kolo/core

# Install storage adapters as needed
npm install @kolo/local
npm install @kolo/s3
npm install @kolo/azure
npm install @kolo/cloudinary
```

## Quick Start

```typescript
import { StorageManager } from '@kolo/core';
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

// Register adapter factory
storageManager.registerFactory('local', (config) => new LocalStorageAdapter(config));

// Get adapter
const adapter = storageManager.getDefaultAdapter();

// Upload a file
const result = await adapter.upload({
  filename: 'example.txt',
  content: Buffer.from('Hello, Kolo!'),
  mimeType: 'text/plain',
  size: 12,
});

console.log('File uploaded:', result.key);
```

## Event System

Kolo provides powerful event hooks for all storage operations:

```typescript
import { StorageEvent } from '@kolo/core';

const events = adapter.getEventEmitter();

// Listen to upload events
events.on(StorageEvent.BEFORE_UPLOAD, (data) => {
  console.log(`Uploading: ${data.file.filename}`);
});

events.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
  console.log(`Uploaded: ${data.response.key} (${data.duration}ms)`);
});

events.on(StorageEvent.UPLOAD_FAILED, (data) => {
  console.error(`Upload failed: ${data.error.message}`);
});
```

### Available Events

Every operation emits three types of events:

- **Before events** - `beforeUpload`, `beforeDownload`, `beforeDelete`, etc.
- **Success events** - `afterUploadSuccess`, `afterDownloadSuccess`, etc.
- **Failed events** - `uploadFailed`, `downloadFailed`, etc.

### Use Cases

- **Logging** - Track all storage operations
- **Validation** - Validate files before upload
- **Monitoring** - Track performance metrics
- **Security** - Audit storage operations
- **Workflows** - Trigger custom logic

See the [complete events documentation](../../EVENTS.md) for more examples.

## Documentation

- [Event System Documentation](../../EVENTS.md) - Complete guide to the event system
- [Examples](../../examples/events) - Working examples with code
- [Migration Guide](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md) - For extracting to a separate repo

## Related Packages

- [@kolo/local](../adapter-local) - Local filesystem storage
- [@kolo/s3](../adapter-s3) - AWS S3 storage
- [@kolo/azure](../adapter-azure) - Azure Blob Storage
- [@kolo/cloudinary](../adapter-cloudinary) - Cloudinary storage

## License

MIT © [Jeremiah Olisa](https://github.com/jeremiah-olisa)
