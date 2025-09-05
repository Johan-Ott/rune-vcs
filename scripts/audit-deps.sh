#!/bin/bash
# Dependency management and security audit script

set -e

echo "🔍 Dependency Management & Security Audit"

# Function to log with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if tools are installed
check_tool() {
    if ! command -v "$1" &> /dev/null; then
        log "⚠️  $1 not found. Installing..."
        case "$1" in
            "cargo-audit")
                cargo install cargo-audit
                ;;
            *)
                log "❌ Don't know how to install $1"
                return 1
                ;;
        esac
    fi
}

# Rust dependency management
log "🦀 Rust Dependencies"
check_tool cargo-audit

log "Running Rust security audit..."
cargo audit

log "Checking for outdated Rust dependencies..."
cargo update --dry-run

# Node.js dependency management  
log "📦 Node.js Dependencies"

log "Running npm security audit..."
pnpm audit

log "Checking for outdated Node dependencies..."
pnpm outdated || true

# Shared package status
log "📋 Shared Package Status"

if [ -d "shared/rune-api" ]; then
    cd shared/rune-api
    log "Building rune-api..."
    pnpm build
    cd ../..
fi

if [ -d "shared/rune-state" ]; then
    cd shared/rune-state
    log "Installing rune-state dependencies..."
    pnpm install || true
    cd ../..
fi

# License compliance check
log "⚖️ License Compliance"
log "Checking Rust crate licenses..."
cargo tree --format '{p} {l}' | grep -E '(GPL|AGPL|SSPL)' || log "No copyleft licenses found in Rust deps"

# Bundle size analysis
log "📊 Bundle Size Analysis"
log "Building apps to check bundle sizes..."

cd apps/rune-plan
pnpm build 2>/dev/null || log "rune-plan build failed"
if [ -d "dist" ]; then
    size=$(du -sh dist | cut -f1)
    log "rune-plan bundle size: $size"
fi
cd ../..

cd apps/rune-source
pnpm build 2>/dev/null || log "rune-source build failed"
if [ -d "dist" ]; then
    size=$(du -sh dist | cut -f1)
    log "rune-source bundle size: $size"
fi
cd ../..

log "✅ Dependency audit completed!"

# Optional: Auto-fix vulnerabilities
if [ "$1" = "--fix" ]; then
    log "🔧 Auto-fixing vulnerabilities..."
    pnpm audit --fix
    log "Vulnerabilities fixed. Please review changes."
fi
