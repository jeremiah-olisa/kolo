/**
 * Interceptor Example: File Validation and Custom Logic
 *
 * This example demonstrates how to create interceptors that validate
 * files before upload and implement custom business logic.
 */

import { StorageManager, StorageEventEmitter, StorageEvent } from '@kolo/core';
import { LocalConfig, LocalStorageAdapter } from '@kolo/local';
import * as path from 'path';

/**
 * File Validation Interceptor
 * Validates files before they are uploaded
 */
class FileValidationInterceptor {
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly blockedFilenames: string[];

  constructor(
    private eventEmitter: StorageEventEmitter,
    options: {
      maxFileSize?: number;
      allowedMimeTypes?: string[];
      blockedFilenames?: string[];
    } = {},
  ) {
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.allowedMimeTypes = options.allowedMimeTypes || [];
    this.blockedFilenames = options.blockedFilenames || [];
    this.setupInterceptor();
  }

  private setupInterceptor() {
    this.eventEmitter.on(StorageEvent.BEFORE_UPLOAD, (data) => {
      console.log(`🔍 Validating file: ${data.file.filename}`);

      // Validate file size
      if (data.file.size > this.maxFileSize) {
        const error = new Error(
          `File size ${data.file.size} bytes exceeds maximum allowed size ${this.maxFileSize} bytes`,
        );
        console.error(`❌ ${error.message}`);
        throw error;
      }
      console.log(`✓ File size OK: ${data.file.size} bytes`);

      // Validate MIME type if restrictions are set
      if (this.allowedMimeTypes.length > 0) {
        if (!this.allowedMimeTypes.includes(data.file.mimeType)) {
          const error = new Error(
            `File type ${data.file.mimeType} is not allowed. ` +
              `Allowed types: ${this.allowedMimeTypes.join(', ')}`,
          );
          console.error(`❌ ${error.message}`);
          throw error;
        }
        console.log(`✓ MIME type OK: ${data.file.mimeType}`);
      }

      // Check blocked filenames
      if (this.blockedFilenames.includes(data.file.filename.toLowerCase())) {
        const error = new Error(`Filename "${data.file.filename}" is not allowed`);
        console.error(`❌ ${error.message}`);
        throw error;
      }
      console.log(`✓ Filename OK: ${data.file.filename}`);

      console.log(`✅ Validation passed for: ${data.file.filename}\n`);
    });
  }
}

/**
 * Security Audit Interceptor
 * Logs security-relevant events
 */
class SecurityAuditInterceptor {
  private readonly auditLog: Array<{
    timestamp: Date;
    operation: string;
    details: any;
  }> = [];

  constructor(private eventEmitter: StorageEventEmitter) {
    this.setupAuditing();
  }

  private setupAuditing() {
    // Audit uploads
    this.eventEmitter.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
      this.audit('UPLOAD', {
        filename: data.file.filename,
        key: data.response.key,
        size: data.file.size,
        correlationId: data.correlationId,
      });
    });

    // Audit deletions
    this.eventEmitter.on(StorageEvent.AFTER_DELETE_SUCCESS, (data) => {
      this.audit('DELETE', {
        key: data.key,
        correlationId: data.correlationId,
      });
    });

    // Audit downloads
    this.eventEmitter.on(StorageEvent.AFTER_DOWNLOAD_SUCCESS, (data) => {
      this.audit('DOWNLOAD', {
        key: data.key,
        correlationId: data.correlationId,
      });
    });
  }

  private audit(operation: string, details: any) {
    const entry = {
      timestamp: new Date(),
      operation,
      details,
    };
    this.auditLog.push(entry);
    console.log(`🔐 Security Audit: ${operation}`, details);
  }

  getAuditLog() {
    return this.auditLog;
  }

  printAuditReport() {
    console.log('\n📋 Security Audit Report\n');
    console.log('═══════════════════════════════════════════════════\n');

    this.auditLog.forEach((entry, index) => {
      console.log(`Entry #${index + 1}`);
      console.log(`Time: ${entry.timestamp.toISOString()}`);
      console.log(`Operation: ${entry.operation}`);
      console.log(`Details:`, entry.details);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════');
  }
}

async function main() {
  console.log('🛡️ Kolo Storage - Interceptor Example\n');

  // Setup Storage Manager
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
    return new LocalStorageAdapter(config);
  });

  // Get adapter
  const adapter = storageManager.getDefaultAdapter();
  const events = adapter.getEventEmitter();

  // Setup interceptors
  console.log('⚙️  Setting up interceptors...\n');

  const _validator = new FileValidationInterceptor(events, {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['text/plain', 'application/json', 'image/png', 'image/jpeg'],
    blockedFilenames: ['forbidden.txt', 'malware.exe'],
  });

  const auditor = new SecurityAuditInterceptor(events);

  console.log('✅ Interceptors ready\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Test 1: Valid file upload
  console.log('Test 1: Uploading valid file...\n');
  try {
    const result1 = await adapter.upload({
      filename: 'valid-document.txt',
      content: Buffer.from('This is a valid document'),
      mimeType: 'text/plain',
      size: 24,
    });
    console.log(`✅ Upload successful: ${result1.key}\n`);
  } catch (error) {
    console.error(`❌ Upload failed: ${(error as Error).message}\n`);
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Test 2: File too large
  console.log('Test 2: Uploading file that exceeds size limit...\n');
  try {
    const largeContent = Buffer.alloc(6 * 1024 * 1024); // 6MB
    await adapter.upload({
      filename: 'large-file.txt',
      content: largeContent,
      mimeType: 'text/plain',
      size: largeContent.length,
    });
    console.log('✅ Upload successful (this should not happen)\n');
  } catch (error) {
    console.log(`✅ Correctly blocked: ${(error as Error).message}\n`);
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Test 3: Invalid MIME type
  console.log('Test 3: Uploading file with invalid MIME type...\n');
  try {
    await adapter.upload({
      filename: 'document.pdf',
      content: Buffer.from('PDF content'),
      mimeType: 'application/pdf',
      size: 11,
    });
    console.log('✅ Upload successful (this should not happen)\n');
  } catch (error) {
    console.log(`✅ Correctly blocked: ${(error as Error).message}\n`);
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Test 4: Blocked filename
  console.log('Test 4: Uploading file with blocked filename...\n');
  try {
    await adapter.upload({
      filename: 'forbidden.txt',
      content: Buffer.from('Should not upload'),
      mimeType: 'text/plain',
      size: 19,
    });
    console.log('✅ Upload successful (this should not happen)\n');
  } catch (error) {
    console.log(`✅ Correctly blocked: ${(error as Error).message}\n`);
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Test 5: Upload and download a valid JSON file
  console.log('Test 5: Uploading and downloading valid JSON file...\n');
  try {
    const jsonData = JSON.stringify({ message: 'Hello, Kolo!' }, null, 2);
    const result = await adapter.upload({
      filename: 'config.json',
      content: Buffer.from(jsonData),
      mimeType: 'application/json',
      size: Buffer.byteLength(jsonData),
    });
    console.log(`✅ Upload successful: ${result.key}`);

    await adapter.download(result.key!);
    console.log(`✅ Download successful\n`);

    await adapter.delete(result.key!);
    console.log(`✅ Delete successful\n`);
  } catch (error) {
    console.error(`❌ Operation failed: ${(error as Error).message}\n`);
  }

  // Print audit report
  auditor.printAuditReport();

  console.log('\n✅ All tests completed!');
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
