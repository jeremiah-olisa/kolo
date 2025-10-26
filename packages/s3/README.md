# @kolo/s3

AWS S3 storage adapter for Kolo - fully implemented with the AWS SDK v3.

## Features

- ✅ Full AWS S3 integration with AWS SDK v3
- ✅ Upload files with metadata and ACL support
- ✅ Download files with signed URL support
- ✅ Delete files from S3 buckets
- ✅ Get file metadata (size, content type, etag, etc.)
- ✅ List files with pagination support
- ✅ Check file existence
- ✅ Support for custom S3-compatible endpoints
- ✅ Path-style URL support for S3-compatible services
- ✅ Base path/prefix support for organized storage

## Installation

```bash
npm install @kolo/s3 @kolo/core @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
# or
pnpm add @kolo/s3 @kolo/core @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
# or
yarn add @kolo/s3 @kolo/core @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
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

// Upload a file
const result = await adapter.upload({
  filename: 'document.pdf',
  content: fileBuffer,
  mimeType: 'application/pdf',
  size: fileBuffer.length,
});

// Download a file with signed URL
const downloadResult = await adapter.download(result.key, {
  expiresIn: 3600, // URL expires in 1 hour
});

// List files
const listResult = await adapter.list({
  prefix: 'documents/',
  maxKeys: 100,
});
```

## Configuration Options

- `provider` (string, required): Provider name (should be 's3')
- `region` (string, required): AWS region
- `bucket` (string, required): S3 bucket name
- `accessKeyId` (string, optional): AWS access key ID (can also use IAM roles)
- `secretAccessKey` (string, optional): AWS secret access key (can also use IAM roles)
- `endpoint` (string, optional): Custom S3 endpoint for S3-compatible services (e.g., MinIO, DigitalOcean Spaces)
- `forcePathStyle` (boolean, optional): Whether to force path-style URLs (required for some S3-compatible services)
- `acl` (string, optional): Default ACL for uploads (e.g., 'public-read', 'private')
- `basePath` (string, optional): Base path/prefix for all operations

## S3-Compatible Services

This adapter works with S3-compatible services like MinIO, DigitalOcean Spaces, Wasabi, etc.

```typescript
const s3Adapter = new S3StorageAdapter({
  provider: 's3',
  region: 'us-east-1',
  bucket: 'my-bucket',
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  forcePathStyle: false,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
});
```

## License

MIT
