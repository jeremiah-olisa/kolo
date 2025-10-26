# @kolo/adapter-local

Local filesystem storage adapter for Kolo.

## Installation

```bash
npm install @kolo/adapter-local @kolo/core
# or
pnpm add @kolo/adapter-local @kolo/core
# or
yarn add @kolo/adapter-local @kolo/core
```

## Usage

### Basic Setup

```typescript
import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/adapter-local';

// Create storage manager
const storageManager = new StorageManager();

// Register local adapter
storageManager.registerFactory('local', (config) => {
  return new LocalStorageAdapter(config);
});

// Or register directly
const localAdapter = new LocalStorageAdapter({
  provider: 'local',
  rootPath: './uploads',
  baseUrl: 'http://localhost:3000/uploads',
  createDirectory: true,
});

storageManager.registerAdapter('local', localAdapter);
```

### With Configuration

```typescript
import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/adapter-local';

const storageManager = new StorageManager({
  defaultAdapter: 'local',
  enableFallback: false,
  adapters: [
    {
      name: 'local',
      enabled: true,
      config: {
        provider: 'local',
        rootPath: './uploads',
        baseUrl: 'http://localhost:3000/uploads',
        createDirectory: true,
        filePermissions: 0o644,
        directoryPermissions: 0o755,
      },
    },
  ],
});

// Register the factory
storageManager.registerFactory('local', (config) => {
  return new LocalStorageAdapter(config);
});

// Use the adapter
const adapter = storageManager.getDefaultAdapter();
```

## Configuration Options

- `provider` (string, required): Provider name (should be 'local')
- `rootPath` (string, required): Root directory for file storage
- `baseUrl` (string, optional): Base URL for serving files
- `createDirectory` (boolean, optional): Whether to create directory if it doesn't exist (default: true)
- `filePermissions` (number, optional): Unix-style file permissions (e.g., 0o644)
- `directoryPermissions` (number, optional): Unix-style directory permissions (e.g., 0o755)

## License

MIT
