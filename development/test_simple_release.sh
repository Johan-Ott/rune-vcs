#!/bin/bash

# Simple Release Build Test (No Docker)
# Tests the core release build process

set -e

echo "🚀 Testing Rune VCS Release Build Process (Without Docker)"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

info() {
    echo -e "📋 $1"
}

# Test 1: CLI Build
echo ""
info "Testing CLI Build..."
if cargo build --release --bin rune; then
    success "CLI binary built successfully"
    
    # Check binary exists and is executable
    if [ -f "target/release/rune" ]; then
        success "Binary exists at target/release/rune"
        
        # Test basic functionality
        if ./target/release/rune --version; then
            success "Binary runs and shows version"
        else
            warning "Binary exists but version command failed"
        fi
    else
        error "Binary not found after build"
    fi
else
    error "CLI build failed"
fi

# Test 2: Workspace Tests
echo ""
info "Testing workspace library builds..."
if cargo test --workspace --lib --no-run; then
    success "All workspace libraries compile for testing"
else
    warning "Some workspace libraries failed to compile"
fi

# Test 3: Check for common issues
echo ""
info "Checking for common issues..."

# Check if src-tauri is properly excluded
if grep -q 'exclude.*src-tauri' Cargo.toml; then
    success "src-tauri properly excluded from workspace"
else
    warning "src-tauri exclusion not found in Cargo.toml"
fi

# Check if Dockerfile exists
if [ -f "Dockerfile" ]; then
    success "Dockerfile exists in root directory"
else
    warning "Dockerfile not found in root directory"
fi

# Test 4: Integration Test Build
echo ""
info "Testing integration test compilation..."
if cargo test --test '*' --no-run; then
    success "Integration tests compile successfully"
else
    warning "Integration tests failed to compile"
fi

# Test 5: Release Archive Creation
echo ""
info "Creating release archive..."
VERSION=$(./target/release/rune --version | head -n1 | awk '{print $2}')
ARCHIVE_NAME="rune-v${VERSION}-x86_64-unknown-linux-gnu"

mkdir -p "release-test/${ARCHIVE_NAME}"
cp target/release/rune "release-test/${ARCHIVE_NAME}/"

# Create a simple README for the release
cat > "release-test/${ARCHIVE_NAME}/README.md" << EOF
# Rune VCS v${VERSION}

## Installation

1. Extract this archive
2. Copy the \`rune\` binary to a directory in your PATH
3. Run \`rune --help\` to get started

## Quick Start

\`\`\`bash
# Initialize a new repository
rune init

# Add files
rune add .

# Commit changes
rune commit -m "Initial commit"
\`\`\`

For more information, visit: https://github.com/Johan-Ott/rune-vcs
EOF

cd release-test
tar -czf "${ARCHIVE_NAME}.tar.gz" "${ARCHIVE_NAME}/"
cd ..

if [ -f "release-test/${ARCHIVE_NAME}.tar.gz" ]; then
    success "Release archive created: release-test/${ARCHIVE_NAME}.tar.gz"
    
    # Test archive extraction
    cd release-test
    rm -rf "${ARCHIVE_NAME}-test"
    tar -xzf "${ARCHIVE_NAME}.tar.gz"
    mv "${ARCHIVE_NAME}" "${ARCHIVE_NAME}-test"
    
    if [ -f "${ARCHIVE_NAME}-test/rune" ] && [ -x "${ARCHIVE_NAME}-test/rune" ]; then
        success "Archive extracts correctly with executable binary"
        
        # Test extracted binary
        if ./"${ARCHIVE_NAME}-test"/rune --version; then
            success "Extracted binary works correctly"
        else
            warning "Extracted binary exists but doesn't run"
        fi
    else
        warning "Archive extraction issue - binary not found or not executable"
    fi
    
    cd ..
else
    error "Failed to create release archive"
fi

echo ""
echo "🎉 Release build test completed!"
echo ""
echo "Summary:"
echo "- CLI binary: $([ -f target/release/rune ] && echo "✅ Built" || echo "❌ Failed")"
echo "- Archive: $([ -f "release-test/${ARCHIVE_NAME}.tar.gz" ] && echo "✅ Created" || echo "❌ Failed")"
echo "- Size: $([ -f "release-test/${ARCHIVE_NAME}.tar.gz" ] && du -h "release-test/${ARCHIVE_NAME}.tar.gz" | cut -f1 || echo "N/A")"

# Cleanup
echo ""
info "Cleaning up test files..."
rm -rf release-test/
success "Cleanup completed"
