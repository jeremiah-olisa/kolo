# Basic Example

This example demonstrates the basic usage of Kolo Storage with a local filesystem adapter.

## What This Example Shows

1. **Setting up StorageManager** - Creating and configuring the storage manager
2. **Registering Adapters** - Using the factory pattern to register adapters
3. **Uploading Files** - Storing files with metadata
4. **Checking Existence** - Verifying if files exist
5. **Getting Metadata** - Retrieving file information
6. **Downloading Files** - Accessing stored files
7. **Listing Files** - Browsing stored files
8. **Cleanup** - Managing storage (optional)

## Running the Example

### Prerequisites

Make sure you've built all packages:

```bash
# From the monorepo root
pnpm install
pnpm run build
```

### Run the Example

```bash
cd examples/basic
pnpm install
pnpm run dev
```

Or run with compiled JavaScript:

```bash
pnpm run build
pnpm start
```

## Expected Output

You should see output similar to:

```
🎯 Kolo Storage - Basic Example

📦 Setting up Storage Manager...
   ✓ Registering Local Storage adapter

🔌 Getting storage adapter...
   ✓ Using adapter: Local
   ✓ Adapter ready: true

📤 Uploading a test file...
   ✓ Upload successful!
   • Key: test-document-abc123.txt
   • URL: http://localhost:3000/uploads/test-document-abc123.txt
   • Size: 342 bytes

... (more output)

✨ Example completed successfully!
```

## Files Created

The example will create files in `examples/basic/temp-uploads/`. These files are kept for inspection but can be manually deleted after running the example.

## Next Steps

After running this basic example, you can:

1. Try the multi-adapter example with S3/Cloudinary
2. Experiment with fallback support
3. Add your own custom adapter
4. Integrate into your application

## Code Overview

The example code in `src/index.ts` demonstrates:

- **Configuration**: Setting up storage with proper paths and permissions
- **Factory Pattern**: Registering adapters for lazy initialization
- **Error Handling**: Checking success flags and handling errors
- **Metadata**: Storing and retrieving file metadata
- **Operations**: All CRUD operations (Create, Read, Update, Delete)

## Customization

You can modify the example to:

- Use different storage paths
- Add more metadata
- Upload different file types
- Enable file deletion in cleanup
- Test error scenarios
