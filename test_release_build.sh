#!/bin/bash
set -e

# Test Release Build Script
# This script tests the release workflows locally

echo "🚀 Testing Rune VCS Release Build Process"
echo "==========================================="

# Test 1: CLI Build
echo "📦 Testing CLI Build..."
cargo build --release --bin rune
if [ -f "target/release/rune" ]; then
    echo "✅ CLI binary built successfully"
    echo "📋 Version: $(./target/release/rune --version)"
else
    echo "❌ CLI binary not found"
    exit 1
fi

# Test 2: Docker Build
echo "🐳 Testing Docker Build..."
if command -v docker &> /dev/null; then
    echo "Building Docker image..."
    docker build -t rune-test:latest .
    
    echo "Testing Docker image..."
    docker run --rm rune-test:latest rune --version
    docker run --rm rune-test:latest rune doctor
    
    echo "✅ Docker build and test successful"
    
    # Clean up
    docker rmi rune-test:latest
else
    echo "⚠️  Docker not available, skipping Docker tests"
fi

# Test 3: Archive Creation (simulating release workflow)
echo "📦 Testing Archive Creation..."
VERSION="test-$(date +%Y%m%d-%H%M%S)"
NAME="rune-${VERSION}-$(rustc -vV | grep host | cut -d' ' -f2)"

mkdir -p dist

# Create tar.gz
tar -czf dist/${NAME}.tar.gz -C target/release rune

# Create checksum
if [[ "$OSTYPE" == "darwin"* ]]; then
    shasum -a 256 dist/${NAME}.tar.gz > dist/${NAME}.tar.gz.sha256
else
    sha256sum dist/${NAME}.tar.gz > dist/${NAME}.tar.gz.sha256
fi

echo "✅ Archive created: dist/${NAME}.tar.gz"
echo "✅ Checksum created: dist/${NAME}.tar.gz.sha256"

# Test 4: Archive Extraction Test
echo "🔍 Testing Archive Extraction..."
cd dist
tar -xzf ${NAME}.tar.gz
if [ -f "rune" ]; then
    echo "✅ Binary extracted successfully"
    echo "📋 Extracted binary version: $(./rune --version)"
    rm rune  # Clean up
else
    echo "❌ Binary extraction failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 All tests passed successfully!"
echo "📁 Build artifacts in dist/:"
ls -la dist/

echo ""
echo "🚀 Ready for release!"
