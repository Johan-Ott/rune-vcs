#!/bin/bash
# Enhanced build script for all apps and shared libraries

set -e

echo "🔧 Building Rune Monorepo..."

# Function to log with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Build shared Rust components first
log "Building shared Rust components..."
cargo build -p tauri-core --release

# Build shared TypeScript components
log "Building shared TypeScript components..."
cd shared/rune-api
pnpm build
cd ../..

# Build rune-plan
log "Building rune-plan..."
cd apps/rune-plan
pnpm build
cd ../..

# Build rune-source  
log "Building rune-source..."
cd apps/rune-source
pnpm build
cd ../..

log "✅ All builds completed successfully!"

# Optional: Create release packages
if [ "$1" = "--package" ]; then
    log "📦 Creating release packages..."
    
    cd apps/rune-plan
    pnpm tauri build
    cd ../..
    
    cd apps/rune-source
    pnpm tauri build
    cd ../..
    
    log "✅ Release packages created!"
fi
