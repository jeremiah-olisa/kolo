# @kolo/cloudinary

Cloudinary storage adapter for Kolo - fully implemented with Cloudinary SDK.

## Features

- ✅ Full Cloudinary integration
- ✅ Upload files with metadata and tags support
- ✅ Download files with signed URLs
- ✅ Delete files with invalidation
- ✅ Get file metadata (size, format, creation date, etc.)
- ✅ List files with pagination support
- ✅ Check file existence
- ✅ Support for images, videos, and raw files
- ✅ Automatic resource type detection
- ✅ Folder/prefix support for organized storage
- ✅ Secure HTTPS URLs by default

## Installation

```bash
npm install @kolo/cloudinary @kolo/core cloudinary
# or
pnpm add @kolo/cloudinary @kolo/core cloudinary
# or
yarn add @kolo/cloudinary @kolo/core cloudinary
```

## Usage

### Basic Setup

```typescript
import { StorageManager } from '@kolo/core';
import { CloudinaryStorageAdapter } from '@kolo/cloudinary';

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
import { CloudinaryStorageAdapter } from '@kolo/cloudinary';

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
        resourceType: 'auto',
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

// Upload an image
const result = await adapter.upload({
  filename: 'photo.jpg',
  content: imageBuffer,
  mimeType: 'image/jpeg',
  size: imageBuffer.length,
});

// Download with signed URL
const downloadResult = await adapter.download(result.key, {
  expiresIn: 3600, // URL expires in 1 hour
});

// List files in a folder
const listResult = await adapter.list({
  prefix: 'uploads/photos',
  maxKeys: 50,
});
```

## Configuration Options

- `provider` (string, required): Provider name (should be 'cloudinary')
- `cloudName` (string, required): Cloudinary cloud name (found in your dashboard)
- `apiKey` (string, required): API key (found in your dashboard)
- `apiSecret` (string, required): API secret (found in your dashboard)
- `folder` (string, optional): Default folder for uploads
- `secure` (boolean, optional): Whether to use secure HTTPS URLs (default: true)
- `resourceType` (string, optional): Resource type - 'image', 'video', 'raw', or 'auto' (default: 'auto')

## Resource Types

Cloudinary supports different resource types:

- **image**: For images (JPG, PNG, GIF, etc.)
- **video**: For videos (MP4, MOV, etc.)
- **raw**: For any other files (PDF, DOC, ZIP, etc.)
- **auto**: Automatically detects the resource type based on MIME type (recommended)

The adapter automatically detects the resource type when set to 'auto':

```typescript
// Image files → 'image'
// Video files → 'video'
// Other files → 'raw'
```

## Getting Cloudinary Credentials

1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Go to your Dashboard
3. Find your credentials:
   - Cloud Name
   - API Key
   - API Secret

## Advanced Features

### Upload with Tags

```typescript
const result = await adapter.upload(
  {
    filename: 'photo.jpg',
    content: imageBuffer,
    mimeType: 'image/jpeg',
    size: imageBuffer.length,
  },
  {
    metadata: {
      tags: 'profile,user,avatar',
    },
  },
);
```

### Signed URLs for Downloads

The download method automatically generates signed URLs when `expiresIn` is provided:

```typescript
const downloadResult = await adapter.download(publicId, {
  expiresIn: 3600, // Expires in 1 hour
  forceDownload: true, // Force download instead of display
  filename: 'custom-filename.jpg', // Custom filename for download
});
```

## License

MIT
