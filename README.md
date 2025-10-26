# Kolo Monorepo

Secure storage adapter for documents and files (Kolo means "piggybank" or "secure box" in Yoruba).

This is a monorepo containing the Kolo storage packages and examples.

## 📦 Packages

- **[@kolo/core](./packages/core)** - Core storage adapter with support for multiple backends (S3, Azure Blob, Cloudinary, Local)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Bootstrap packages
pnpm run bootstrap

# Build all packages
pnpm run build
```

## 📚 Development

### Available Scripts

```bash
# Install dependencies for all packages
pnpm run bootstrap

# Build all packages
pnpm run build

# Build specific package
pnpm run build:core

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Lint code
pnpm run lint

# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Clean dependencies
pnpm run clean

# Clean build outputs
pnpm run clean:build
```

### Version Management

```bash
# Version with conventional commits
pnpm run version

# Patch version
pnpm run version:patch

# Minor version
pnpm run version:minor

# Major version
pnpm run version:major

# Prerelease version
pnpm run version:prerelease
```

### Publishing

```bash
# Publish packages
pnpm run publish

# Publish in CI
pnpm run publish:ci

# Canary publish
pnpm run publish:canary

# Build and publish
pnpm run publish:now

# Release with version bump
pnpm run release:patch
pnpm run release:minor
pnpm run release:major
pnpm run release:alpha
```

## 🏗️ Project Structure

```
kolo-monorepo/
├── packages/
│   └── core/          # @kolo/core - Core storage adapter
├── examples/          # Example applications
├── package.json       # Root package.json
├── pnpm-workspace.yaml # PNPM workspace configuration
├── tsconfig.base.json # Base TypeScript configuration
├── lerna.json         # Lerna configuration
└── .eslintrc.js       # ESLint configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Jeremiah Olisa](https://github.com/jeremiah-olisa)

## 🔗 Links

- [GitHub Repository](https://github.com/jeremiah-olisa/kolo)
- [NPM Package](https://www.npmjs.com/package/@kolo/core)
