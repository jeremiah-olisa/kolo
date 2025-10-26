/**
 * Performance Monitor Example: Track and Analyze Storage Performance
 *
 * This example demonstrates how to monitor performance metrics
 * for all storage operations.
 */

import { StorageManager, StorageEventEmitter, StorageEvent } from '@kolo/core';
import { LocalStorageAdapter, LocalConfig } from '@kolo/local';
import * as path from 'path';

interface PerformanceMetrics {
  operation: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  failures: number;
  successRate: number;
}

/**
 * Performance Monitor
 * Tracks performance metrics for all storage operations
 */
class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();

  constructor(private eventEmitter: StorageEventEmitter) {
    this.setupMonitoring();
  }

  private setupMonitoring() {
    // Track upload performance
    this.eventEmitter.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
      this.recordMetric('upload', data.duration);
      console.log(`⏱️  Upload completed in ${data.duration}ms`);
    });

    this.eventEmitter.on(StorageEvent.UPLOAD_FAILED, (data) => {
      this.recordMetric('upload', data.duration, true);
      console.log(`⏱️  Upload failed after ${data.duration}ms`);
    });

    // Track download performance
    this.eventEmitter.on(StorageEvent.AFTER_DOWNLOAD_SUCCESS, (data) => {
      this.recordMetric('download', data.duration);
      console.log(`⏱️  Download completed in ${data.duration}ms`);
    });

    this.eventEmitter.on(StorageEvent.DOWNLOAD_FAILED, (data) => {
      this.recordMetric('download', data.duration, true);
      console.log(`⏱️  Download failed after ${data.duration}ms`);
    });

    // Track delete performance
    this.eventEmitter.on(StorageEvent.AFTER_DELETE_SUCCESS, (data) => {
      this.recordMetric('delete', data.duration);
      console.log(`⏱️  Delete completed in ${data.duration}ms`);
    });

    this.eventEmitter.on(StorageEvent.DELETE_FAILED, (data) => {
      this.recordMetric('delete', data.duration, true);
      console.log(`⏱️  Delete failed after ${data.duration}ms`);
    });

    // Track list performance
    this.eventEmitter.on(StorageEvent.AFTER_LIST_SUCCESS, (data) => {
      this.recordMetric('list', data.duration);
      console.log(`⏱️  List completed in ${data.duration}ms`);
    });

    this.eventEmitter.on(StorageEvent.LIST_FAILED, (data) => {
      this.recordMetric('list', data.duration, true);
      console.log(`⏱️  List failed after ${data.duration}ms`);
    });

    // Track get performance
    this.eventEmitter.on(StorageEvent.AFTER_GET_SUCCESS, (data) => {
      this.recordMetric('get', data.duration);
      console.log(`⏱️  Get completed in ${data.duration}ms`);
    });

    this.eventEmitter.on(StorageEvent.GET_FAILED, (data) => {
      this.recordMetric('get', data.duration, true);
      console.log(`⏱️  Get failed after ${data.duration}ms`);
    });

    // Track exists performance
    this.eventEmitter.on(StorageEvent.AFTER_EXISTS_SUCCESS, (data) => {
      this.recordMetric('exists', data.duration);
      console.log(`⏱️  Exists check completed in ${data.duration}ms`);
    });

    this.eventEmitter.on(StorageEvent.EXISTS_FAILED, (data) => {
      this.recordMetric('exists', data.duration, true);
      console.log(`⏱️  Exists check failed after ${data.duration}ms`);
    });
  }

  private recordMetric(operation: string, duration: number, failed = false) {
    const existing = this.metrics.get(operation) || {
      operation,
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      failures: 0,
      successRate: 0,
    };

    existing.count++;
    existing.totalDuration += duration;
    existing.avgDuration = existing.totalDuration / existing.count;
    existing.minDuration = Math.min(existing.minDuration, duration);
    existing.maxDuration = Math.max(existing.maxDuration, duration);

    if (failed) {
      existing.failures++;
    }

    existing.successRate = ((existing.count - existing.failures) / existing.count) * 100;

    this.metrics.set(operation, existing);
  }

  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  getMetric(operation: string): PerformanceMetrics | undefined {
    return this.metrics.get(operation);
  }

  reset() {
    this.metrics.clear();
  }

  printReport() {
    console.log('\n📊 Performance Report\n');
    console.log('═════════════════════════════════════════════════════════════════════════');
    console.log('Operation  | Count | Avg (ms) | Min (ms) | Max (ms) | Failures | Success Rate');
    console.log('───────────|-------|----------|----------|----------|----------|─────────────');

    const metrics = this.getMetrics();

    if (metrics.length === 0) {
      console.log('No operations recorded yet');
    } else {
      metrics.forEach((metric) => {
        const operation = metric.operation.padEnd(10);
        const count = metric.count.toString().padEnd(5);
        const avg = metric.avgDuration.toFixed(2).padEnd(8);
        const min =
          metric.minDuration === Infinity
            ? 'N/A'.padEnd(8)
            : metric.minDuration.toFixed(2).padEnd(8);
        const max = metric.maxDuration.toFixed(2).padEnd(8);
        const failures = metric.failures.toString().padEnd(8);
        const successRate = `${metric.successRate.toFixed(1)}%`;

        console.log(
          `${operation} | ${count} | ${avg} | ${min} | ${max} | ${failures} | ${successRate}`,
        );
      });
    }

    console.log('═════════════════════════════════════════════════════════════════════════');

    // Print summary
    const totalOps = metrics.reduce((sum, m) => sum + m.count, 0);
    const totalFailures = metrics.reduce((sum, m) => sum + m.failures, 0);
    const overallSuccessRate = totalOps > 0 ? ((totalOps - totalFailures) / totalOps) * 100 : 0;

    console.log(`\nTotal Operations: ${totalOps}`);
    console.log(`Total Failures: ${totalFailures}`);
    console.log(`Overall Success Rate: ${overallSuccessRate.toFixed(1)}%\n`);
  }

  printDetailedMetrics() {
    console.log('\n📈 Detailed Performance Metrics\n');

    const metrics = this.getMetrics();

    metrics.forEach((metric) => {
      console.log(`\n${metric.operation.toUpperCase()} Operations:`);
      console.log('─────────────────────────────');
      console.log(`  Total Count: ${metric.count}`);
      console.log(`  Successes: ${metric.count - metric.failures}`);
      console.log(`  Failures: ${metric.failures}`);
      console.log(`  Success Rate: ${metric.successRate.toFixed(1)}%`);
      console.log(`  Average Duration: ${metric.avgDuration.toFixed(2)}ms`);
      console.log(
        `  Min Duration: ${metric.minDuration === Infinity ? 'N/A' : metric.minDuration.toFixed(2) + 'ms'}`,
      );
      console.log(`  Max Duration: ${metric.maxDuration.toFixed(2)}ms`);
      console.log(`  Total Duration: ${metric.totalDuration.toFixed(2)}ms`);
    });
  }
}

async function main() {
  console.log('📊 Kolo Storage - Performance Monitor Example\n');

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

  // Get adapter and set up monitor
  const adapter = storageManager.getDefaultAdapter();
  const monitor = new PerformanceMonitor(adapter.getEventEmitter());

  console.log('✅ Performance monitor initialized\n');
  console.log('🔄 Running performance tests...\n');

  const uploadedKeys: string[] = [];

  try {
    // Test 1: Multiple uploads
    console.log('Test 1: Uploading multiple files...\n');
    for (let i = 0; i < 5; i++) {
      const content = `Test file #${i + 1} - ${new Date().toISOString()}`;
      const result = await adapter.upload({
        filename: `test-file-${i + 1}.txt`,
        content: Buffer.from(content),
        mimeType: 'text/plain',
        size: Buffer.byteLength(content),
      });
      uploadedKeys.push(result.key!);
    }

    console.log('\nTest 2: Downloading files...\n');
    for (const key of uploadedKeys) {
      await adapter.download(key);
    }

    console.log('\nTest 3: Getting file metadata...\n');
    for (const key of uploadedKeys) {
      await adapter.get(key);
    }

    console.log('\nTest 4: Checking file existence...\n');
    for (const key of uploadedKeys) {
      await adapter.exists(key);
    }

    console.log('\nTest 5: Listing files...\n');
    await adapter.list({ maxKeys: 10 });
    await adapter.list({ maxKeys: 20 });
    await adapter.list({ maxKeys: 5 });

    console.log('\nTest 6: Deleting files...\n');
    for (const key of uploadedKeys) {
      await adapter.delete(key);
    }

    // Print performance report
    monitor.printReport();
    monitor.printDetailedMetrics();

    console.log('\n✅ All performance tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);

    // Still print the report to see what was measured
    monitor.printReport();
  }
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
