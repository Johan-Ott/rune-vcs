# Testing Strategy for Rune Monorepo

This document outlines the comprehensive testing strategy for the Rune VCS monorepo.

## Testing Architecture

### 1. Unit Tests
- **Rust**: Cargo tests for all crates (`cargo test`)
- **TypeScript**: Jest/Vitest for shared libraries
- **React**: React Testing Library for components

### 2. Integration Tests  
- **Tauri Commands**: Test Rust-TypeScript bridge
- **API Integration**: Test shared API packages
- **Cross-App Communication**: Test shared state management

### 3. End-to-End Tests
- **Playwright**: Full app testing
- **Platform Testing**: macOS, Windows, Linux

### 4. Performance Tests
- **Benchmarks**: Rust benchmarks in `/benches`
- **Bundle Size**: Track app bundle sizes
- **Memory Usage**: Monitor resource consumption

## Test Commands

```bash
# Run all tests
pnpm test:all

# Unit tests only
cargo test
pnpm --filter ./shared/* test

# E2E tests
pnpm test:e2e

# Performance benchmarks
cargo bench
```

## Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── rust/            # Rust unit tests
│   └── typescript/      # TS unit tests
├── integration/         # Integration tests
│   ├── tauri-commands/  # Test Tauri commands
│   └── api-bridge/      # Test API bridges
├── e2e/                 # End-to-end tests
│   ├── rune-plan/       # Plan app E2E
│   └── rune-source/     # Source app E2E
└── benchmarks/          # Performance tests
```

## Testing Best Practices

1. **Test Isolation**: Each test runs independently
2. **Mock External Services**: Use mocks for file system, VCS
3. **Snapshot Testing**: For UI components and API responses
4. **Coverage Targets**: Aim for 80%+ coverage
5. **CI Integration**: All tests run on PR and push

## Test Data

Shared test fixtures and data are located in `/test_files/` for consistency across all test suites.
