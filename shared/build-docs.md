# Build & Deploy Pipeline for Rune Monorepo

The build system supports multiple targets and deployment scenarios.

## Build Scripts

### Development
```bash
# Start all apps in development mode
pnpm dev:all

# Start specific app
pnpm rune-plan dev
pnpm rune-source dev

# Build shared libraries
pnpm shared:build
```

### Production Builds
```bash
# Build all apps for production
pnpm build:all

# Build specific app
pnpm rune-plan build
pnpm rune-source build

# Build and package for release
pnpm release:all
```

### Cross-Platform
```bash
# Build for all supported platforms
pnpm build:cross-platform

# Platform-specific builds
pnpm build:macos
pnpm build:windows  
pnpm build:linux
```

## CI/CD Pipeline

The pipeline uses GitHub Actions with the following stages:

1. **Lint & Test**: Run TypeScript linting, Rust clippy, and tests
2. **Build**: Build all apps for all platforms
3. **Package**: Create distributable packages (DMG, MSI, AppImage, etc.)
4. **Release**: Upload artifacts and create releases

## Deployment Targets

- **Desktop Apps**: Direct download from GitHub releases
- **Development**: Local development servers with hot reload
- **Server Components**: Docker containers for backend services
