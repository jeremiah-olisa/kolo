/**
 * Basic Example: Using Kolo Storage with Multiple Adapters
 * 
 * This example demonstrates:
 * 1. Setting up a StorageManager with multiple adapters
 * 2. Registering adapters using the factory pattern
 * 3. Using fallback support for reliability
 * 4. Performing basic storage operations
 */

import { StorageManager } from '@kolo/core';
import { LocalStorageAdapter } from '@kolo/adapter-local';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🎯 Kolo Storage - Basic Example\n');

  // ========================================
  // 1. Setup Storage Manager
  // ========================================
  console.log('📦 Setting up Storage Manager...');
  
  const storageManager = new StorageManager({
    defaultAdapter: 'local',
    enableFallback: false,
    adapters: [
      {
        name: 'local',
        enabled: true,
        config: {
          provider: 'local',
          rootPath: path.join(__dirname, '../temp-uploads'),
          baseUrl: 'http://localhost:3000/uploads',
          createDirectory: true,
          filePermissions: 0o644,
          directoryPermissions: 0o755,
        },
      },
    ],
  });

  // Register adapter factory
  storageManager.registerFactory('local', (config) => {
    console.log('   ✓ Registering Local Storage adapter');
    return new LocalStorageAdapter(config);
  });

  // ========================================
  // 2. Get the Adapter
  // ========================================
  console.log('\n🔌 Getting storage adapter...');
  const adapter = storageManager.getDefaultAdapter();
  console.log(`   ✓ Using adapter: ${adapter.getProviderName()}`);
  console.log(`   ✓ Adapter ready: ${adapter.isReady()}`);

  // ========================================
  // 3. Upload a File
  // ========================================
  console.log('\n📤 Uploading a test file...');
  
  const testContent = `Hello from Kolo Storage!
  
This is a test file created at ${new Date().toISOString()}

Kolo provides a unified interface for multiple storage backends:
- Local filesystem
- AWS S3
- Azure Blob Storage
- Cloudinary

Features:
✓ Multiple adapter support
✓ Automatic fallback
✓ Type-safe API
✓ Easy to extend
`;

  const uploadResult = await adapter.upload(
    {
      filename: 'test-document.txt',
      content: Buffer.from(testContent),
      mimeType: 'text/plain',
      size: Buffer.byteLength(testContent),
    },
    {
      metadata: {
        uploadedBy: 'example-script',
        timestamp: new Date().toISOString(),
        category: 'test',
      },
    }
  );

  if (uploadResult.success) {
    console.log('   ✓ Upload successful!');
    console.log(`   • Key: ${uploadResult.key}`);
    console.log(`   • URL: ${uploadResult.url}`);
    console.log(`   • Size: ${uploadResult.size} bytes`);
  } else {
    console.error('   ✗ Upload failed:', uploadResult.error);
    return;
  }

  const fileKey = uploadResult.key!;

  // ========================================
  // 4. Check if File Exists
  // ========================================
  console.log('\n🔍 Checking if file exists...');
  
  const existsResult = await adapter.exists(fileKey);
  
  if (existsResult.success) {
    console.log(`   ✓ File exists: ${existsResult.exists}`);
  }

  // ========================================
  // 5. Get File Metadata
  // ========================================
  console.log('\n📋 Getting file metadata...');
  
  const getResult = await adapter.get(fileKey);
  
  if (getResult.success && getResult.object) {
    console.log('   ✓ Metadata retrieved:');
    console.log(`   • Key: ${getResult.object.key}`);
    console.log(`   • Size: ${getResult.object.size} bytes`);
    console.log(`   • Last Modified: ${getResult.object.lastModified}`);
  }

  // ========================================
  // 6. Download/Read the File
  // ========================================
  console.log('\n📥 Downloading file...');
  
  const downloadResult = await adapter.download(fileKey);
  
  if (downloadResult.success) {
    console.log('   ✓ Download successful!');
    console.log(`   • URL: ${downloadResult.url}`);
    
    if (downloadResult.content) {
      const content = downloadResult.content.toString('utf-8');
      console.log(`   • Content preview: "${content.substring(0, 50)}..."`);
    }
  }

  // ========================================
  // 7. List Files
  // ========================================
  console.log('\n📝 Listing files...');
  
  const listResult = await adapter.list({
    maxKeys: 10,
  });
  
  if (listResult.success && listResult.result) {
    console.log(`   ✓ Found ${listResult.result.objects.length} file(s):`);
    listResult.result.objects.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.key} (${file.size} bytes)`);
    });
  }

  // ========================================
  // 8. Upload Another File
  // ========================================
  console.log('\n📤 Uploading another test file...');
  
  const jsonContent = JSON.stringify({
    name: 'Kolo Storage Example',
    version: '1.0.0',
    features: ['multi-adapter', 'fallback', 'type-safe'],
    timestamp: new Date().toISOString(),
  }, null, 2);

  const jsonUploadResult = await adapter.upload({
    filename: 'config.json',
    content: Buffer.from(jsonContent),
    mimeType: 'application/json',
    size: Buffer.byteLength(jsonContent),
  });

  if (jsonUploadResult.success) {
    console.log('   ✓ Upload successful!');
    console.log(`   • Key: ${jsonUploadResult.key}`);
  }

  // ========================================
  // 9. List Files Again
  // ========================================
  console.log('\n📝 Listing all files...');
  
  const listResult2 = await adapter.list();
  
  if (listResult2.success && listResult2.result) {
    console.log(`   ✓ Total files: ${listResult2.result.objects.length}`);
    listResult2.result.objects.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.key}`);
    });
  }

  // ========================================
  // 10. Delete Files (Optional - commented out)
  // ========================================
  console.log('\n🗑️  Cleanup (skipped - files kept for inspection)');
  console.log('   ℹ️  Files are stored in: examples/basic/temp-uploads/');
  console.log('   ℹ️  To cleanup manually, delete the temp-uploads directory');
  
  /*
  // Uncomment to delete uploaded files
  console.log('\n🗑️  Deleting uploaded files...');
  
  for (const key of [fileKey, jsonUploadResult.key!]) {
    const deleteResult = await adapter.delete(key);
    if (deleteResult.success) {
      console.log(`   ✓ Deleted: ${key}`);
    }
  }
  */

  // ========================================
  // Summary
  // ========================================
  console.log('\n✨ Example completed successfully!');
  console.log('\nKey takeaways:');
  console.log('• StorageManager provides a unified interface');
  console.log('• Adapters can be registered using factories');
  console.log('• All operations follow a consistent pattern');
  console.log('• Response objects include success flags and error details');
  console.log('• Multiple adapters can be configured with fallback support');
}

// Run the example
main()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
