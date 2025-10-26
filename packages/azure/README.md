# @kolo/azure

Azure Blob Storage adapter for Kolo - fully implemented with Azure Storage SDK.

## Features

- ✅ Full Azure Blob Storage integration
- ✅ Upload files with metadata and content type support
- ✅ Download files as buffers
- ✅ Delete files from containers
- ✅ Get file metadata (size, content type, etag, etc.)
- ✅ List files with pagination support
- ✅ Check file existence
- ✅ Support for connection strings or account credentials
- ✅ Base path/prefix support for organized storage

## Installation

```bash
npm install @kolo/azure @kolo/core @azure/storage-blob
# or
pnpm add @kolo/azure @kolo/core @azure/storage-blob
# or
yarn add @kolo/azure @kolo/core @azure/storage-blob
```

## Usage

### Basic Setup

```typescript
import { StorageManager } from '@kolo/core';
import { AzureStorageAdapter } from '@kolo/azure';

// Create storage manager
const storageManager = new StorageManager();

// Register Azure adapter
storageManager.registerFactory('azure', (config) => {
  return new AzureStorageAdapter(config);
});

// Or register directly
const azureAdapter = new AzureStorageAdapter({
  provider: 'azure',
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  containerName: 'uploads',
});

storageManager.registerAdapter('azure', azureAdapter);
```

### With Connection String

```typescript
import { AzureStorageAdapter } from '@kolo/azure';

const azureAdapter = new AzureStorageAdapter({
  provider: 'azure',
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  containerName: 'uploads',
});
```

### With Configuration

```typescript
import { StorageManager } from '@kolo/core';
import { AzureStorageAdapter } from '@kolo/azure';

const storageManager = new StorageManager({
  defaultAdapter: 'azure',
  enableFallback: true,
  adapters: [
    {
      name: 'azure',
      enabled: true,
      config: {
        provider: 'azure',
        accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
        accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
        containerName: 'uploads',
        basePath: 'files',
      },
    },
  ],
});

// Register the factory
storageManager.registerFactory('azure', (config) => {
  return new AzureStorageAdapter(config);
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

// Download a file
const downloadResult = await adapter.download(result.key);

// List files
const listResult = await adapter.list({
  prefix: 'documents/',
  maxKeys: 100,
});
```

## Configuration Options

- `provider` (string, required): Provider name (should be 'azure')
- `containerName` (string, required): Container name (must exist in your storage account)
- `connectionString` (string, conditionally required): Connection string (alternative to accountName/accountKey)
- `accountName` (string, conditionally required): Azure storage account name (required if not using connectionString)
- `accountKey` (string, conditionally required): Azure storage account key (required if not using connectionString)
- `basePath` (string, optional): Base path/prefix for all operations

**Note:** You must provide either `connectionString` OR both `accountName` and `accountKey`.

## Creating a Container

The adapter assumes the container already exists. To create a container:

1. Using Azure Portal: Navigate to your storage account → Containers → Add container
2. Using Azure CLI: `az storage container create --name uploads --account-name myaccount`
3. Programmatically:

```typescript
import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
await blobServiceClient.createContainer('uploads');
```

## License

MIT
