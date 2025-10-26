# Kolo Monorepo

Secure storage adapter for documents and files (Kolo means "piggybank" or "secure box" in Yoruba).

This is a monorepo containing the Kolo storage packages with support for multiple storage backends - **all fully implemented and production-ready**.

## 📦 Packages

- **[@kolo/core](./packages/core)** - Core storage manager with interfaces and base classes ✅
- **[@kolo/local](./packages/local)** - Local filesystem storage adapter ✅
- **[@kolo/s3](./packages/s3)** - AWS S3 storage adapter (fully implemented) ✅
- **[@kolo/azure](./packages/azure)** - Azure Blob Storage adapter (fully implemented) ✅
- **[@kolo/cloudinary](./packages/cloudinary)** - Cloudinary storage adapter (fully implemented) ✅

All adapters are fully implemented with their respective SDKs and include:

- ✅ Upload files with metadata
- ✅ Download files
- ✅ Delete files
- ✅ Get file metadata
- ✅ List files with pagination
- ✅ Check file existence

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build
```

### Usage Example

```typescript
import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/local';
import { S3StorageAdapter } from '@kolo/s3';

// Create storage manager with multiple adapters and fallback support
const storageManager = new StorageManager({
  defaultAdapter: 's3',
  enableFallback: true,
  adapters: [
    {
      name: 's3',
      enabled: true,
      priority: 2,
      config: {
        provider: 's3',
        region: 'us-east-1',
        bucket: 'my-bucket',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
    {
      name: 'local',
      enabled: true,
      priority: 1,
      config: {
        provider: 'local',
        rootPath: './uploads',
        baseUrl: 'http://localhost:3000/uploads',
      },
    },
  ],
});

// Register adapter factories
storageManager.registerFactory('s3', (config) => new S3StorageAdapter(config));
storageManager.registerFactory('local', (config) => new LocalStorageAdapter(config));

// Get adapter with automatic fallback
const adapter = storageManager.getAdapterWithFallback('s3');

// Upload a file
const result = await adapter.upload({
  filename: 'example.txt',
  content: Buffer.from('Hello, Kolo!'),
  mimeType: 'text/plain',
  size: 12,
});
```

## 📚 Development

### Available Scripts

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm run build

# Build specific package
pnpm run build:core

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Lint code
pnpm run lint

# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Clean dependencies
pnpm run clean

# Clean build outputs
pnpm run clean:build
```

### Version Management

```bash
# Version with conventional commits
pnpm run version

# Patch version
pnpm run version:patch

# Minor version
pnpm run version:minor

# Major version
pnpm run version:major

# Prerelease version
pnpm run version:prerelease
```

### Publishing

```bash
# Publish packages
pnpm run publish

# Publish in CI
pnpm run publish:ci

# Canary publish
pnpm run publish:canary

# Build and publish
pnpm run publish:now

# Release with version bump
pnpm run release:patch
pnpm run release:minor
pnpm run release:major
pnpm run release:alpha
```

## 🏗️ Project Structure

```
kolo-monorepo/
├── packages/
│   ├── core/               # @kolo/core - Core storage manager
│   ├── adapter-local/      # @kolo/local - Local filesystem adapter
│   ├── adapter-s3/         # @kolo/s3 - AWS S3 adapter
│   ├── adapter-cloudinary/ # @kolo/cloudinary - Cloudinary adapter
│   └── adapter-azure/      # @kolo/azure - Azure Blob Storage adapter
├── examples/               # Example applications
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # PNPM workspace configuration
├── tsconfig.base.json      # Base TypeScript configuration
├── lerna.json              # Lerna configuration
└── .eslintrc.js            # ESLint configuration
```

## ✨ Features

- 🔌 **Multiple Storage Adapters** - Support for local, S3, Azure, and Cloudinary storage
- 🔄 **Fallback Support** - Automatic fallback to alternative adapters when primary fails
- 🏭 **Factory Pattern** - Easy registration and management of multiple adapters
- 📦 **Modular Architecture** - Individual packages for each adapter with minimal dependencies
- 🎯 **Type-Safe** - Full TypeScript support
- 🔧 **Extensible** - Easy to add custom storage adapters
- 📡 **Event System** - Comprehensive event hooks for all storage operations
- 🔍 **Interceptors** - Validate and transform data before operations
- 📊 **Built-in Monitoring** - Track performance and create custom loggers

## 📡 Event System

Kolo provides a powerful event system that allows you to listen to and intercept all storage operations. Perfect for logging, monitoring, validation, and custom business logic.

```typescript
import { StorageEvent } from '@kolo/core';

const adapter = storageManager.getDefaultAdapter();
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

Every storage operation emits three types of events:

**Upload Events:** `beforeUpload`, `afterUploadSuccess`, `uploadFailed`  
**Download Events:** `beforeDownload`, `afterDownloadSuccess`, `downloadFailed`  
**Delete Events:** `beforeDelete`, `afterDeleteSuccess`, `deleteFailed`  
**Get Events:** `beforeGet`, `afterGetSuccess`, `getFailed`  
**List Events:** `beforeList`, `afterListSuccess`, `listFailed`  
**Exists Events:** `beforeExists`, `afterExistsSuccess`, `existsFailed`

### Use Cases

- **Logging** - Track all storage operations
- **Validation** - Validate files before upload (size, type, etc.)
- **Performance Monitoring** - Track operation durations and success rates
- **Security Auditing** - Log security-relevant operations
- **Custom Business Logic** - Trigger workflows based on storage events

See [EVENTS.md](./EVENTS.md) for complete documentation and examples.

## 📚 Examples

The repository includes comprehensive examples:

- **[Basic Example](./examples/basic)** - Getting started with Kolo storage
- **[Events Example](./examples/events)** - Complete event system usage
  - Logger implementation
  - File validation interceptor
  - Performance monitoring

Run examples:

```bash
cd examples/events
pnpm install
pnpm start           # Basic events example
pnpm start:logger    # Logger example
pnpm start:interceptor  # Validation example
pnpm start:monitor   # Performance monitoring
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Jeremiah Olisa](https://github.com/jeremiah-olisa)

## 🔗 Links

- [GitHub Repository](https://github.com/jeremiah-olisa/kolo)
- [NPM Package](https://www.npmjs.com/package/@kolo/core)
