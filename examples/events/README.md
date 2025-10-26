# Kolo Storage Events - Examples

This directory contains comprehensive examples demonstrating the Kolo storage event system.

## 📚 Examples

### 1. Complete Events Example (`index.ts`)

A comprehensive overview showing all event types and basic usage.

```bash
pnpm start
```

**Features:**

- Event listening for all operations
- Basic event handling patterns
- Complete operation lifecycle

### 2. Logger Example (`logger-example.ts`)

Demonstrates how to create a comprehensive logger that tracks all storage operations.

```bash
pnpm start:logger
```

**Features:**

- Structured JSON logging
- All storage operations logged
- Error tracking
- Correlation ID tracking

### 3. Interceptor Example (`interceptor-example.ts`)

Shows how to create interceptors that validate files and implement security auditing.

```bash
pnpm start:interceptor
```

**Features:**

- File size validation
- MIME type validation
- Blocked filename checking
- Security audit logging

### 4. Performance Monitor Example (`monitor-example.ts`)

Tracks and analyzes performance metrics for all storage operations.

```bash
pnpm start:monitor
```

**Features:**

- Operation timing tracking
- Success/failure rates
- Min/max/average duration
- Detailed performance reports

## 🚀 Getting Started

### Prerequisites

Make sure you've built the core packages first:

```bash
# From the root directory
pnpm install
pnpm run build
```

### Running Examples

From this directory:

```bash
# Install dependencies (if not already done)
pnpm install

# Run the main example
pnpm start

# Run specific examples
pnpm start:logger
pnpm start:interceptor
pnpm start:monitor
```

## 📖 Event Types

The Kolo event system provides events for every storage operation:

### Upload Events

- `beforeUpload` - Before upload starts
- `afterUploadSuccess` - After successful upload
- `uploadFailed` - When upload fails

### Download Events

- `beforeDownload` - Before download starts
- `afterDownloadSuccess` - After successful download
- `downloadFailed` - When download fails

### Delete Events

- `beforeDelete` - Before delete starts
- `afterDeleteSuccess` - After successful delete
- `deleteFailed` - When delete fails

### Get Events

- `beforeGet` - Before getting metadata
- `afterGetSuccess` - After successfully getting metadata
- `getFailed` - When getting metadata fails

### List Events

- `beforeList` - Before listing files
- `afterListSuccess` - After successfully listing files
- `listFailed` - When listing fails

### Exists Events

- `beforeExists` - Before checking existence
- `afterExistsSuccess` - After successfully checking existence
- `existsFailed` - When existence check fails

## 💡 Use Cases

### Logging

Track all storage operations for debugging and auditing:

```typescript
events.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
  console.log(`Uploaded: ${data.response.key} in ${data.duration}ms`);
});
```

### Validation

Validate files before they're uploaded:

```typescript
events.on(StorageEvent.BEFORE_UPLOAD, (data) => {
  if (data.file.size > MAX_SIZE) {
    throw new Error('File too large');
  }
});
```

### Performance Monitoring

Track operation performance:

```typescript
events.on(StorageEvent.AFTER_UPLOAD_SUCCESS, (data) => {
  metrics.record('upload', data.duration);
});
```

### Security Auditing

Log security-relevant events:

```typescript
events.on(StorageEvent.AFTER_DELETE_SUCCESS, (data) => {
  auditLog.record('DELETE', data.key, data.correlationId);
});
```

## 🔗 Related Documentation

- [Main Events Documentation](../../EVENTS.md) - Complete event system documentation
- [Core Package](../../packages/core/README.md) - Core package documentation
- [Basic Example](../basic/README.md) - Basic storage usage without events

## 🤝 Contributing

Found an issue or have a suggestion? Please open an issue on GitHub.

## 📄 License

MIT © [Jeremiah Olisa](https://github.com/jeremiah-olisa)
