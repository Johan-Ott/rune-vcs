#!/bin/bash

# Update Homebrew Tap Script for Rune VCS v0.3.5-alpha.1
# This script updates the homebrew-rune-vcs repository with the new formula

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${GREEN}🍺 Updating Homebrew Tap for Rune VCS v0.3.5-alpha.1${NC}"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "Formula-rune-v0.3.5-alpha.1.rb" ]; then
    print_error "Formula-rune-v0.3.5-alpha.1.rb not found in current directory"
    exit 1
fi

# Clone or update the homebrew tap repository
TAP_DIR="homebrew-rune-vcs"

if [ -d "$TAP_DIR" ]; then
    print_info "Updating existing tap repository..."
    cd "$TAP_DIR"
    git pull origin main
    cd ..
else
    print_info "Cloning homebrew tap repository..."
    git clone https://github.com/Johan-Ott/homebrew-rune-vcs.git "$TAP_DIR"
fi

# Copy the new formula
print_info "Copying new formula to tap repository..."
cp "Formula-rune-v0.3.5-alpha.1.rb" "$TAP_DIR/Formula/rune-vcs.rb"

# Commit and push changes
cd "$TAP_DIR"

print_info "Committing changes to tap repository..."
git add Formula/rune-vcs.rb
git commit -m "feat: Update Rune VCS to v0.3.5-alpha.1

- Updated to version 0.3.5-alpha.1
- Added Linux support (x86_64 and ARM64/Raspberry Pi)
- Updated checksums for all platforms
- Full cross-platform support: macOS, Linux, Windows

Platform support:
- macOS Apple Silicon (ARM64)
- macOS Intel (x86_64)  
- Linux ARM64 (Raspberry Pi 4/5)
- Linux x86_64
- Windows x86_64"

print_info "Pushing changes to GitHub..."
git push origin main

cd ..

print_status "Homebrew tap updated successfully!"
print_info "Now you can upgrade Rune VCS with:"
echo ""
echo -e "${BLUE}  brew update${NC}"
echo -e "${BLUE}  brew upgrade johan-ott/rune-vcs/rune-vcs${NC}"
echo ""
print_warning "Or if you want to force reinstall:"
echo -e "${BLUE}  brew reinstall johan-ott/rune-vcs/rune-vcs${NC}"
