# @kolo/adapter-azure

Azure Blob Storage adapter for Kolo.

## Installation

```bash
npm install @kolo/adapter-azure @kolo/core
# or
pnpm add @kolo/adapter-azure @kolo/core
# or
yarn add @kolo/adapter-azure @kolo/core
```

For full functionality, you'll also need the Azure SDK:

```bash
npm install @azure/storage-blob
```

## Usage

### Basic Setup

```typescript
import { StorageManager } from '@kolo/core';
import { AzureStorageAdapter } from '@kolo/adapter-azure';

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

### With Configuration

```typescript
import { StorageManager } from '@kolo/core';
import { AzureStorageAdapter } from '@kolo/adapter-azure';

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
```

## Configuration Options

- `provider` (string, required): Provider name (should be 'azure')
- `accountName` (string, required): Azure storage account name
- `containerName` (string, required): Container name
- `accountKey` (string, optional): Azure storage account key
- `connectionString` (string, optional): Connection string (alternative to accountName/accountKey)
- `basePath` (string, optional): Base path/prefix for all operations

## License

MIT
