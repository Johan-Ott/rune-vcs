# Rune VCS Monorepo - Complete Setup Guide

## 🎉 Completed Monorepo Architecture

You now have a professional monorepo setup with the following structure:

### Applications
- **rune-plan**: Visual planning client (Linear-style project management)
- **rune-source**: Simple visual source control client for Rune VCS

### Shared Infrastructure
- **shared/tauri-core**: Rust crate with common Tauri commands
- **shared/rune-api**: TypeScript API bridge with React hooks
- **shared/rune-state**: Zustand-based state management

## 🚀 Quick Start Commands

```bash
# Development
pnpm rune-plan          # Start rune-plan app
pnpm rune-source        # Start rune-source app  
pnpm dev:all           # Start both apps
pnpm shared:build      # Build shared libraries

# Building
pnpm build:all         # Build all apps
pnpm build:full        # Full build including Rust
pnpm build:release     # Build release packages

# Testing & Quality
pnpm test:all          # Run all tests
pnpm test:coverage     # Run tests with coverage
pnpm audit:deps        # Security & dependency audit
pnpm audit:fix         # Auto-fix vulnerabilities
```

## 📁 Project Structure

```
rune-vcs/
├── apps/
│   ├── rune-plan/          # Planning app
│   └── rune-source/        # Source control app
├── shared/
│   ├── tauri-core/         # Shared Rust commands
│   ├── rune-api/           # TypeScript API bridge
│   └── rune-state/         # State management
├── crates/                 # Core Rust libraries
├── scripts/                # Build & utility scripts
└── docs/                   # Documentation
```

## 🔧 Architecture Features

### 1. ✅ Monorepo Structure
- pnpm workspace for TypeScript packages
- Cargo workspace for Rust crates  
- Convenient development scripts

### 2. ✅ App Separation
- **rune-plan**: Complex planning UI with task management
- **rune-source**: Clean VCS interface with file tracking
- Both apps are fully functional Tauri v2.8.4 applications

### 3. ✅ Shared Tauri Core
- Common file system operations (`get_file_info`, `list_directory`)
- VCS status operations (`get_vcs_status`)  
- External app launching (`open_external`)
- Shared between both applications

### 4. ✅ Enhanced Shared Libraries  
- **@rune-vcs/api**: TypeScript API bridges to Rust backend
- **@rune-vcs/state**: Zustand state management
- React hooks for common operations (`useFileSystem`, `useVCSStatus`)

### 5. ✅ Build & Deploy Pipeline
- Automated build scripts (`./scripts/build-all.sh`)
- Cross-platform build support
- Release packaging for production

### 6. ✅ Shared State Management
- Zustand stores for file system, VCS, planning, config
- Cross-app state synchronization
- Persistent state with local storage

### 7. ✅ Testing Strategy
- Comprehensive test runner (`./scripts/test-all.sh`)
- Unit tests for Rust and TypeScript
- Integration testing for Tauri commands
- Coverage reporting

### 8. ✅ Dependency Management
- Security auditing (`./scripts/audit-deps.sh`)
- Version synchronization across workspace
- Bundle size monitoring
- License compliance checking

## 🎯 Next Development Steps

1. **Add your app-specific features** to rune-plan and rune-source
2. **Extend shared APIs** in tauri-core and rune-api as needed
3. **Implement real VCS operations** using the rune-core crates
4. **Add more React hooks** for common UI patterns
5. **Set up CI/CD** using the provided build scripts

## 💡 Usage Examples

### Using Shared API in Apps
```typescript
import { FileSystemAPI, useFileSystem } from '@rune-vcs/api';
import { useFileSystemStore } from '@rune-vcs/state';

// Direct API usage
const files = await FileSystemAPI.listDirectory('/path');

// React hook usage
const { files, loading, error } = useFileSystem('/path');

// State management
const { currentDirectory, setCurrentDirectory } = useFileSystemStore();
```

### Adding New Shared Commands
1. Add Rust command to `shared/tauri-core/src/lib.rs`
2. Add TypeScript bridge to `shared/rune-api/src/api.ts`
3. Register command in app's `main.rs` or `lib.rs`
4. Use via API or React hooks

## 🛠 Development Workflow

1. **Start development**: `pnpm dev:all`
2. **Make changes** to apps or shared libraries
3. **Test changes**: `pnpm test:all`
4. **Build for production**: `pnpm build:release`
5. **Audit dependencies**: `pnpm audit:deps`

The monorepo is now ready for professional development with excellent developer experience! 🎉
