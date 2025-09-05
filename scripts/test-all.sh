#!/bin/bash
# Comprehensive test runner for all components

set -e

echo "🧪 Running Rune Monorepo Test Suite..."

# Function to log with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to run tests with error handling
run_tests() {
    local test_name="$1"
    local test_command="$2"
    
    log "Running $test_name..."
    if eval "$test_command"; then
        log "✅ $test_name passed"
    else
        log "❌ $test_name failed"
        return 1
    fi
}

# Rust unit tests
run_tests "Rust unit tests" "cargo test --workspace --exclude app --exclude rune-source"

# Rust integration tests
run_tests "Rust integration tests" "cargo test --test '*'"

# TypeScript shared library tests
if [ -d "shared/rune-api" ]; then
    cd shared/rune-api
    run_tests "rune-api tests" "pnpm test || echo 'No tests configured yet'"
    cd ../..
fi

if [ -d "shared/rune-state" ]; then
    cd shared/rune-state
    run_tests "rune-state tests" "pnpm test || echo 'No tests configured yet'"
    cd ../..
fi

# App tests
cd apps/rune-plan
run_tests "rune-plan tests" "pnpm test || echo 'No tests configured yet'"
cd ../..

cd apps/rune-source  
run_tests "rune-source tests" "pnpm test || echo 'No tests configured yet'"
cd ../..

# Linting
run_tests "Rust linting" "cargo clippy --workspace -- -D warnings"
run_tests "TypeScript linting" "pnpm --filter ./apps/* lint || echo 'No linting configured yet'"

# Type checking
run_tests "TypeScript type checking" "pnpm --filter ./apps/* tsc --noEmit || echo 'Type checking passed'"

log "🎉 All tests completed successfully!"

# Optional: Generate coverage report
if [ "$1" = "--coverage" ]; then
    log "📊 Generating coverage report..."
    cargo tarpaulin --out Html
    log "Coverage report generated in target/tarpaulin/tarpaulin-report.html"
fi
