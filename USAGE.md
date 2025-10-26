# Kolo Storage - Usage Examples

This document provides comprehensive examples of how to use Kolo storage adapters in your applications.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Multiple Adapters with Fallback](#multiple-adapters-with-fallback)
- [Registering Adapters](#registering-adapters)
- [Uploading Files](#uploading-files)
- [Downloading Files](#downloading-files)
- [Deleting Files](#deleting-files)
- [Listing Files](#listing-files)
- [Checking File Existence](#checking-file-existence)
- [Error Handling](#error-handling)

## Basic Setup

### Single Adapter (Local Storage)

```typescript
import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/local';

// Create storage manager
const storageManager = new StorageManager();

// Create and register local adapter
const localAdapter = new LocalStorageAdapter({
  provider: 'local',
  rootPath: './uploads',
  baseUrl: 'http://localhost:3000/uploads',
  createDirectory: true,
  filePermissions: 0o644,
  directoryPermissions: 0o755,
});

storageManager.registerAdapter('local', localAdapter);
storageManager.setDefaultAdapter('local');

// Get the adapter
const adapter = storageManager.getDefaultAdapter();
```

## Multiple Adapters with Fallback

Set up multiple storage adapters with automatic fallback support:

```typescript
import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/local';
import { S3StorageAdapter } from '@kolo/s3';
import { CloudinaryStorageAdapter } from '@kolo/cloudinary';

const storageManager = new StorageManager({
  defaultAdapter: 's3',
  enableFallback: true,
  adapters: [
    {
      name: 's3',
      enabled: true,
      priority: 3, // Highest priority
      config: {
        provider: 's3',
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
    {
      name: 'cloudinary',
      enabled: true,
      priority: 2,
      config: {
        provider: 'cloudinary',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        folder: 'uploads',
        secure: true,
      },
    },
    {
      name: 'local',
      enabled: true,
      priority: 1, // Fallback
      config: {
        provider: 'local',
        rootPath: './uploads',
        baseUrl: 'http://localhost:3000/uploads',
      },
    },
  ],
});

// Register factories
storageManager.registerFactory('s3', (config) => new S3StorageAdapter(config));
storageManager.registerFactory('cloudinary', (config) => new CloudinaryStorageAdapter(config));
storageManager.registerFactory('local', (config) => new LocalStorageAdapter(config));

// Get adapter with fallback
// If S3 fails, it will try Cloudinary, then Local
const adapter = storageManager.getAdapterWithFallback('s3');
```

## Registering Adapters

### Using Factory Pattern (Recommended)

```typescript
import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/local';

const storageManager = new StorageManager({
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

// Register factory - adapter is created automatically
storageManager.registerFactory('local', (config) => {
  return new LocalStorageAdapter(config);
});
```

### Direct Registration

```typescript
import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/local';

const storageManager = new StorageManager();

// Create adapter instance
const localAdapter = new LocalStorageAdapter({
  provider: 'local',
  rootPath: './uploads',
});

// Register the instance directly
storageManager.registerAdapter('local', localAdapter);
```

## Uploading Files

### Basic Upload

```typescript
const result = await adapter.upload({
  filename: 'document.pdf',
  content: fileBuffer, // Buffer or stream
  mimeType: 'application/pdf',
  size: fileBuffer.length,
});

if (result.success) {
  console.log('File uploaded:', result.key);
  console.log('URL:', result.url);
  console.log('Public URL:', result.publicUrl);
} else {
  console.error('Upload failed:', result.error);
}
```

### Upload with Options

```typescript
const result = await adapter.upload(
  {
    filename: 'profile-photo.jpg',
    content: imageBuffer,
    mimeType: 'image/jpeg',
    size: imageBuffer.length,
  },
  {
    key: 'users/123/profile.jpg', // Custom path/key
    public: true, // Make file publicly accessible
    contentType: 'image/jpeg',
    metadata: {
      userId: '123',
      uploadedBy: 'admin',
      timestamp: new Date().toISOString(),
    },
  },
);
```

## Downloading Files

### Get File URL

```typescript
const result = await adapter.download('path/to/file.pdf');

if (result.success) {
  console.log('File URL:', result.url);
  console.log('Signed URL:', result.signedUrl); // For private files
}
```

### Download File Content

```typescript
const result = await adapter.download('path/to/file.txt');

if (result.success && result.content) {
  const fileContent = result.content.toString('utf-8');
  console.log('File content:', fileContent);
}
```

### Download with Expiration

```typescript
const result = await adapter.download('private/document.pdf', {
  expiresIn: 3600, // URL expires in 1 hour
  forceDownload: true,
  filename: 'downloaded-document.pdf',
});
```

## Deleting Files

```typescript
const result = await adapter.delete('path/to/file.pdf');

if (result.success) {
  console.log('File deleted:', result.key);
} else {
  console.error('Delete failed:', result.error);
}
```

## Listing Files

### List All Files

```typescript
const result = await adapter.list();

if (result.success && result.result) {
  console.log('Files:', result.result.objects);
  console.log('Has more:', result.result.hasMore);
}
```

### List with Prefix

```typescript
const result = await adapter.list({
  prefix: 'users/123/', // List files in this "folder"
  maxKeys: 100, // Limit results
});

if (result.success && result.result) {
  result.result.objects.forEach((file) => {
    console.log('File:', file.key);
    console.log('Size:', file.size);
    console.log('Last modified:', file.lastModified);
    console.log('URL:', file.url);
  });
}
```

### Pagination

```typescript
let continuationToken: string | undefined;
const allFiles = [];

do {
  const result = await adapter.list({
    maxKeys: 100,
    continuationToken,
  });

  if (result.success && result.result) {
    allFiles.push(...result.result.objects);
    continuationToken = result.result.nextContinuationToken;
  } else {
    break;
  }
} while (continuationToken);

console.log('Total files:', allFiles.length);
```

## Checking File Existence

```typescript
const result = await adapter.exists('path/to/file.pdf');

if (result.success) {
  if (result.exists) {
    console.log('File exists');
  } else {
    console.log('File does not exist');
  }
}
```

## Error Handling

### Handling Upload Errors

```typescript
try {
  const result = await adapter.upload(file);

  if (!result.success) {
    switch (result.error?.code) {
      case 'STORAGE_CONFIGURATION_ERROR':
        console.error('Configuration error:', result.error.message);
        break;
      case 'STORAGE_UPLOAD_ERROR':
        console.error('Upload error:', result.error.message);
        break;
      default:
        console.error('Unknown error:', result.error?.message);
    }
  }
} catch (error) {
  console.error('Exception:', error);
}
```

### Using Fallback for Reliability

```typescript
const storageManager = new StorageManager({
  defaultAdapter: 's3',
  enableFallback: true,
  adapters: [
    { name: 's3', enabled: true, priority: 2, config: s3Config },
    { name: 'local', enabled: true, priority: 1, config: localConfig },
  ],
});

// Register adapters
storageManager.registerFactory('s3', (config) => new S3StorageAdapter(config));
storageManager.registerFactory('local', (config) => new LocalStorageAdapter(config));

// This will automatically fallback to local if S3 fails
const adapter = storageManager.getAdapterWithFallback('s3');

const result = await adapter.upload(file);
console.log('Adapter used:', adapter.getProviderName());
```

## Advanced Patterns

### Conditional Adapter Selection

```typescript
function getAdapter(fileType: string) {
  if (fileType.startsWith('image/') || fileType.startsWith('video/')) {
    // Use Cloudinary for media
    return storageManager.getAdapter('cloudinary');
  } else if (fileType === 'application/pdf') {
    // Use S3 for documents
    return storageManager.getAdapter('s3');
  } else {
    // Use local for everything else
    return storageManager.getAdapter('local');
  }
}

const adapter = getAdapter(file.mimeType);
const result = await adapter.upload(file);
```

### Multi-Upload to Different Adapters

```typescript
async function uploadToMultipleAdapters(file: StorageFile) {
  const adapters = ['s3', 'cloudinary', 'local'];
  const results = await Promise.allSettled(
    adapters.map((name) => {
      const adapter = storageManager.getAdapter(name);
      return adapter.upload(file);
    }),
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`Uploaded to ${adapters[index]}:`, result.value.key);
    } else {
      console.error(`Failed to upload to ${adapters[index]}`);
    }
  });
}
```

### Custom Metadata Tracking

```typescript
const result = await adapter.upload(file, {
  metadata: {
    originalName: file.filename,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
    fileHash: calculateHash(file.content),
    tags: ['important', 'verified'],
  },
});

// Later, retrieve and use metadata
const fileInfo = await adapter.get(result.key!);
if (fileInfo.success && fileInfo.object) {
  console.log('Metadata:', fileInfo.object.metadata);
}
```

## Integration Examples

### Express.js Upload Endpoint

```typescript
import express from 'express';
import multer from 'multer';
import { StorageManager } from '@kolo/core';
import { S3StorageAdapter } from '@kolo/s3';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const storageManager = new StorageManager();
storageManager.registerFactory('s3', (config) => new S3StorageAdapter(config));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const adapter = storageManager.getDefaultAdapter();
    const result = await adapter.upload({
      filename: req.file.originalname,
      content: req.file.buffer,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    if (result.success) {
      res.json({
        message: 'File uploaded successfully',
        key: result.key,
        url: result.url,
      });
    } else {
      res.status(500).json({ error: result.error?.message });
    }
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Best Practices

1. **Use Environment Variables for Credentials**

   ```typescript
   const config = {
     provider: 's3',
     region: process.env.AWS_REGION,
     bucket: process.env.AWS_S3_BUCKET,
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   };
   ```

2. **Enable Fallback for Critical Applications**

   ```typescript
   const storageManager = new StorageManager({
     enableFallback: true,
     adapters: [primaryConfig, fallbackConfig],
   });
   ```

3. **Check Adapter Readiness**

   ```typescript
   if (storageManager.isAdapterReady('s3')) {
     const adapter = storageManager.getAdapter('s3');
     // Use adapter
   }
   ```

4. **Handle Errors Gracefully**

   ```typescript
   const result = await adapter.upload(file);
   if (!result.success) {
     // Log error, notify admin, use fallback, etc.
     logger.error('Upload failed:', result.error);
   }
   ```

5. **Use Appropriate Adapters for Different File Types**
   - Images/Videos: Cloudinary (with transformations)
   - Documents: S3 or Azure (with versioning)
   - Temporary files: Local storage
   - Archives: S3 with Glacier integration
