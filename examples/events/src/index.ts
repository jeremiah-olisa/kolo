/**
 * Kolo Storage Events - Complete Example
 *
 * This example demonstrates all the event capabilities of Kolo storage:
 * - Event listening
 * - Logging
 * - Validation/Interceptors
 * - Performance monitoring
 */

import { StorageManager, StorageEvent } from '@kolo/core';
import { LocalConfig, LocalStorageAdapter } from '@kolo/local';
import * as path from 'path';

async function main() {
  console.log('🎯 Kolo Storage - Complete Events Example\n');
  console.log('This example demonstrates the full event system capabilities.\n');

  // ========================================
  // 1. Setup Storage Manager
  // ========================================
  console.log('📦 Setting up Storage Manager...');

  const storageManager = new StorageManager({
    defaultAdapter: 'local',
    adapters: [
      {
        name: 'local',
        enabled: true,
        config: {
          provider: 'local',
          rootPath: path.join(__dirname, '../temp-uploads'),
          baseUrl: 'http://localhost:3000/uploads',
          createDirectory: true,
        },
      },
    ],
  });

  // Register adapter factory
  storageManager.registerFactory<LocalConfig>('local', (config) => {
    console.log('   ✓ Registering Local Storage adapter');
    return new LocalStorageAdapter(config);
  });

  const adapter = storageManager.getDefaultAdapter();
  const events = adapter.getEventEmitter();

  console.log(`   ✓ Using adapter: ${adapter.getProviderName()}`);
  console.log(`   ✓ Adapter ready: ${adapter.isReady()}\n`);

  // ========================================
  // 2. Setup Simple Event Listeners
  // ========================================
  console.log('👂 Setting up event listeners...\n');

  // Listen to all upload events
  events.on(StorageEvent.BEFORE_UPLOAD, (data) => {
    console.log(`   🔵 BEFORE_UPLOAD: ${data.file.filename} (${data.file.size} bytes)`);
  });

  events.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
    console.log(`   ✅ AFTER_UPLOAD_SUCCESS: ${data.response.key} (${data.duration}ms)`);
  });

  events.on(StorageEvent.UPLOAD_FAILED, (data) => {
    console.log(
      `   ❌ UPLOAD_FAILED: ${data.file.filename} - ${data.error.message} (${data.duration}ms)`,
    );
  });

  // Listen to download events
  events.on(StorageEvent.BEFORE_DOWNLOAD, (data) => {
    console.log(`   🔵 BEFORE_DOWNLOAD: ${data.key}`);
  });

  events.on(StorageEvent.AFTER_DOWNLOAD_SUCCESS, (data) => {
    console.log(`   ✅ AFTER_DOWNLOAD_SUCCESS: ${data.key} (${data.duration}ms)`);
  });

  // Listen to delete events
  events.on(StorageEvent.BEFORE_DELETE, (data) => {
    console.log(`   🔵 BEFORE_DELETE: ${data.key}`);
  });

  events.on(StorageEvent.AFTER_DELETE_SUCCESS, (data) => {
    console.log(`   ✅ AFTER_DELETE_SUCCESS: ${data.key} (${data.duration}ms)`);
  });

  // Listen to list events
  events.on(StorageEvent.AFTER_LIST_SUCCESS, (data) => {
    const count = data.response.result?.objects.length || 0;
    console.log(`   ✅ AFTER_LIST_SUCCESS: Found ${count} files (${data.duration}ms)`);
  });

  // Listen to get events
  events.on(StorageEvent.AFTER_GET_SUCCESS, (data) => {
    console.log(`   ✅ AFTER_GET_SUCCESS: ${data.key} (${data.duration}ms)`);
  });

  // Listen to exists events
  events.on(StorageEvent.AFTER_EXISTS_SUCCESS, (data) => {
    console.log(
      `   ✅ AFTER_EXISTS_SUCCESS: ${data.key} exists=${data.response.exists} (${data.duration}ms)`,
    );
  });

  console.log('✓ Event listeners registered\n');

  // ========================================
  // 3. Perform Storage Operations
  // ========================================
  console.log('🔄 Performing storage operations...\n');

  const files = [];

  try {
    // Upload multiple files
    console.log('📤 Uploading files...\n');

    for (let i = 1; i <= 3; i++) {
      const content = `Example file #${i}\nCreated at: ${new Date().toISOString()}\n`;
      const result = await adapter.upload(
        {
          filename: `example-${i}.txt`,
          content: Buffer.from(content),
          mimeType: 'text/plain',
          size: Buffer.byteLength(content),
        },
        {
          metadata: {
            category: 'example',
            index: i,
          },
        },
      );

      files.push(result.key!);
    }

    console.log('\n📥 Downloading files...\n');

    for (const key of files) {
      await adapter.download(key);
    }

    console.log('\n📋 Getting file metadata...\n');

    for (const key of files) {
      await adapter.get(key);
    }

    console.log('\n🔍 Checking file existence...\n');

    for (const key of files) {
      await adapter.exists(key);
    }

    console.log('\n📝 Listing all files...\n');

    const listResult = await adapter.list({ maxKeys: 10 });

    if (listResult.success && listResult.result) {
      console.log(`\n   Found ${listResult.result.objects.length} files:`);
      listResult.result.objects.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.key} (${file.size} bytes)`);
      });
    }

    console.log('\n🗑️  Deleting files...\n');

    for (const key of files) {
      await adapter.delete(key);
    }

    console.log('\n✨ All operations completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error);
  }

  // ========================================
  // 4. Summary
  // ========================================
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 Summary');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('Events demonstrated:');
  console.log('  ✓ beforeUpload / afterUploadSuccess');
  console.log('  ✓ beforeDownload / afterDownloadSuccess');
  console.log('  ✓ beforeDelete / afterDeleteSuccess');
  console.log('  ✓ beforeGet / afterGetSuccess');
  console.log('  ✓ beforeExists / afterExistsSuccess');
  console.log('  ✓ beforeList / afterListSuccess\n');

  console.log('Key features:');
  console.log('  ✓ All operations emit before/after events');
  console.log('  ✓ Events include timing information (duration)');
  console.log('  ✓ Events include correlation IDs for tracking');
  console.log('  ✓ Success and failure events are separate');
  console.log('  ✓ Event listeners can be async\n');

  console.log('Next steps:');
  console.log('  • Run: pnpm start:logger - See comprehensive logging');
  console.log('  • Run: pnpm start:interceptor - See file validation');
  console.log('  • Run: pnpm start:monitor - See performance monitoring\n');
}

// Run the example
main()
  .then(() => {
    console.log('👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
