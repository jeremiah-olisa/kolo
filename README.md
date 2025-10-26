# Kolo Monorepo

Secure storage adapter for documents and files (Kolo means "piggybank" or "secure box" in Yoruba).

This is a monorepo containing the Kolo storage packages with support for multiple storage backends.

## 📦 Packages

- **[@kolo/core](./packages/core)** - Core storage manager with interfaces and base classes
- **[@kolo/adapter-local](./packages/adapter-local)** - Local filesystem storage adapter
- **[@kolo/adapter-s3](./packages/adapter-s3)** - AWS S3 storage adapter
- **[@kolo/adapter-cloudinary](./packages/adapter-cloudinary)** - Cloudinary storage adapter
- **[@kolo/adapter-azure](./packages/adapter-azure)** - Azure Blob Storage adapter

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
import { LocalStorageAdapter } from '@kolo/adapter-local';
import { S3StorageAdapter } from '@kolo/adapter-s3';

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
│   ├── adapter-local/      # @kolo/adapter-local - Local filesystem adapter
│   ├── adapter-s3/         # @kolo/adapter-s3 - AWS S3 adapter
│   ├── adapter-cloudinary/ # @kolo/adapter-cloudinary - Cloudinary adapter
│   └── adapter-azure/      # @kolo/adapter-azure - Azure Blob Storage adapter
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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Jeremiah Olisa](https://github.com/jeremiah-olisa)

## 🔗 Links

- [GitHub Repository](https://github.com/jeremiah-olisa/kolo)
- [NPM Package](https://www.npmjs.com/package/@kolo/core)
