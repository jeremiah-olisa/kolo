# @kolo/adapter-cloudinary

Cloudinary storage adapter for Kolo.

## Installation

```bash
npm install @kolo/adapter-cloudinary @kolo/core
# or
pnpm add @kolo/adapter-cloudinary @kolo/core
# or
yarn add @kolo/adapter-cloudinary @kolo/core
```

For full functionality, you'll also need the Cloudinary SDK:

```bash
npm install cloudinary
```

## Usage

### Basic Setup

```typescript
import { StorageManager } from '@kolo/core';
import { CloudinaryStorageAdapter } from '@kolo/adapter-cloudinary';

// Create storage manager
const storageManager = new StorageManager();

// Register Cloudinary adapter
storageManager.registerFactory('cloudinary', (config) => {
  return new CloudinaryStorageAdapter(config);
});

// Or register directly
const cloudinaryAdapter = new CloudinaryStorageAdapter({
  provider: 'cloudinary',
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: 'uploads',
});

storageManager.registerAdapter('cloudinary', cloudinaryAdapter);
```

### With Configuration

```typescript
import { StorageManager } from '@kolo/core';
import { CloudinaryStorageAdapter } from '@kolo/adapter-cloudinary';

const storageManager = new StorageManager({
  defaultAdapter: 'cloudinary',
  enableFallback: true,
  adapters: [
    {
      name: 'cloudinary',
      enabled: true,
      config: {
        provider: 'cloudinary',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        folder: 'uploads',
        secure: true,
      },
    },
  ],
});

// Register the factory
storageManager.registerFactory('cloudinary', (config) => {
  return new CloudinaryStorageAdapter(config);
});

// Use the adapter
const adapter = storageManager.getDefaultAdapter();
```

## Configuration Options

- `provider` (string, required): Provider name (should be 'cloudinary')
- `cloudName` (string, required): Cloudinary cloud name
- `apiKey` (string, required): API key
- `apiSecret` (string, required): API secret
- `folder` (string, optional): Default folder for uploads
- `secure` (boolean, optional): Whether to use secure URLs (default: true)
- `resourceType` (string, optional): Resource type ('image', 'video', 'raw', 'auto')

## License

MIT
