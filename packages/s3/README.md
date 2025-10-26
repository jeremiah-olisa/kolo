# @kolo/s3

AWS S3 storage adapter for Kolo.

## Installation

```bash
npm install @kolo/s3 @kolo/core
# or
pnpm add @kolo/s3 @kolo/core
# or
yarn add @kolo/s3 @kolo/core
```

For full functionality, you'll also need the AWS SDK:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Usage

### Basic Setup

```typescript
import { StorageManager } from '@kolo/core';
import { S3StorageAdapter } from '@kolo/s3';

// Create storage manager
const storageManager = new StorageManager();

// Register S3 adapter
storageManager.registerFactory('s3', (config) => {
  return new S3StorageAdapter(config);
});

// Or register directly
const s3Adapter = new S3StorageAdapter({
  provider: 's3',
  region: 'us-east-1',
  bucket: 'my-bucket',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

storageManager.registerAdapter('s3', s3Adapter);
```

### With Configuration

```typescript
import { StorageManager } from '@kolo/core';
import { S3StorageAdapter } from '@kolo/s3';

const storageManager = new StorageManager({
  defaultAdapter: 's3',
  enableFallback: true,
  adapters: [
    {
      name: 's3',
      enabled: true,
      config: {
        provider: 's3',
        region: 'us-east-1',
        bucket: 'my-bucket',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        basePath: 'uploads',
      },
    },
  ],
});

// Register the factory
storageManager.registerFactory('s3', (config) => {
  return new S3StorageAdapter(config);
});

// Use the adapter
const adapter = storageManager.getDefaultAdapter();
```

## Configuration Options

- `provider` (string, required): Provider name (should be 's3')
- `region` (string, required): AWS region
- `bucket` (string, required): S3 bucket name
- `accessKeyId` (string, optional): AWS access key ID
- `secretAccessKey` (string, optional): AWS secret access key
- `endpoint` (string, optional): Custom S3 endpoint for S3-compatible services
- `forcePathStyle` (boolean, optional): Whether to force path-style URLs
- `acl` (string, optional): Default ACL for uploads
- `basePath` (string, optional): Base path/prefix for all operations

## License

MIT
