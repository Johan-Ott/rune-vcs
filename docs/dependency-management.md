# Dependency Management for Rune Monorepo

This document outlines the dependency management strategy and best practices.

## Overview

The monorepo uses a hybrid approach:
- **Rust**: Cargo workspace with shared dependencies in root `Cargo.toml`
- **TypeScript/Node**: pnpm workspace with shared packages
- **Shared Libraries**: Internal packages for code reuse

## Dependency Structure

### Rust Dependencies (Cargo.toml)
```toml
[workspace.dependencies]
# Core dependencies shared across all crates
anyhow = "1"
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
tauri = { version = "2.8.4", features = [] }

# Version management
chrono = { version = "0.4", features = ["serde"] }
```

### TypeScript Dependencies (package.json)
```json
{
  "devDependencies": {
    "typescript": "^5.0.2",
    "concurrently": "^8.2.2"
  }
}
```

## Shared Internal Packages

### @rune-vcs/api
- TypeScript API bridge to Rust backend
- Used by both rune-plan and rune-source
- Version: workspace:*

### @rune-vcs/state  
- Shared state management (Zustand)
- Cross-app state synchronization
- Version: workspace:*

### tauri-core
- Shared Rust commands for Tauri apps
- Common file system and VCS operations
- Version: workspace dependency

## Version Management

### Synchronized Versions
- All apps share the same version: `0.3.4-alpha.1`
- Shared packages use `workspace:*` for internal deps
- External dependencies are pinned to specific versions

### Update Strategy
```bash
# Update all Rust dependencies
cargo update

# Update Node dependencies
pnpm update

# Update specific package
pnpm update package-name --latest
```

## Dependency Guidelines

1. **Minimize External Dependencies**: Only add if necessary
2. **Security First**: Regular security audits with `cargo audit` and `pnpm audit`
3. **Version Consistency**: Keep versions synchronized across apps
4. **Bundle Size**: Monitor impact on app bundle sizes
5. **License Compliance**: Ensure all dependencies are compatible

## Security & Auditing

```bash
# Rust security audit
cargo install cargo-audit
cargo audit

# Node security audit  
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

## Monitoring

- **Dependabot**: Automated dependency updates
- **Bundle Analysis**: Track bundle size impact
- **Performance Impact**: Monitor startup and runtime performance
