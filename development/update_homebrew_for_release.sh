#!/bin/bash

# Automated Homebrew Tap Updater for specific release
# This script updates the Homebrew tap with a specific release version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

if [ -z "$1" ]; then
    print_error "Usage: $0 <version-tag>"
    print_info "Example: $0 v0.3.4-alpha.1"
    exit 1
fi

VERSION_TAG="$1"
VERSION="${VERSION_TAG#v}"  # Remove 'v' prefix

echo -e "${GREEN}🍺 Updating Homebrew Tap for Rune VCS ${VERSION}${NC}"
echo "=================================================="

# Get release information from GitHub API
print_info "Fetching release information for $VERSION_TAG..."

RELEASE_DATA=$(curl -s "https://api.github.com/repos/Johan-Ott/rune-vcs/releases/tags/$VERSION_TAG")

if echo "$RELEASE_DATA" | grep -q '"message": "Not Found"'; then
    print_error "Release $VERSION_TAG not found on GitHub"
    exit 1
fi

# Extract asset URLs and checksums
ARM64_ASSET=$(echo "$RELEASE_DATA" | grep -o '"browser_download_url": "[^"]*aarch64-apple-darwin[^"]*"' | cut -d'"' -f4)
INTEL_ASSET=$(echo "$RELEASE_DATA" | grep -o '"browser_download_url": "[^"]*x86_64-apple-darwin[^"]*"' | cut -d'"' -f4)

if [ -z "$ARM64_ASSET" ] || [ -z "$INTEL_ASSET" ]; then
    print_error "Could not find macOS assets in release $VERSION_TAG"
    echo "Available assets:"
    echo "$RELEASE_DATA" | grep '"name":' | cut -d'"' -f4
    exit 1
fi

print_status "Found macOS assets:"
print_info "ARM64: $(basename "$ARM64_ASSET")"
print_info "Intel: $(basename "$INTEL_ASSET")"

# Download assets to calculate checksums
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

print_info "Downloading assets to calculate checksums..."

# Download ARM64
curl -sL "$ARM64_ASSET" -o "arm64.tar.gz"
ARM64_SHA256=$(shasum -a 256 "arm64.tar.gz" | cut -d' ' -f1)

# Download Intel
curl -sL "$INTEL_ASSET" -o "intel.tar.gz"
INTEL_SHA256=$(shasum -a 256 "intel.tar.gz" | cut -d' ' -f1)

print_status "Checksums calculated:"
print_info "ARM64: $ARM64_SHA256"
print_info "Intel: $INTEL_SHA256"

# Clone and update Homebrew tap
HOMEBREW_REPO="https://github.com/Johan-Ott/homebrew-rune-vcs.git"
TAP_DIR="/tmp/homebrew-rune-vcs-update-$VERSION"

rm -rf "$TAP_DIR"
print_info "Cloning Homebrew tap repository..."
git clone "$HOMEBREW_REPO" "$TAP_DIR"

cd "$TAP_DIR"

# Create updated formula
print_info "Updating Formula/rune-vcs.rb..."

cat > Formula/rune-vcs.rb << EOF
class RuneVcs < Formula
  desc "Modern, intelligent version control system"
  homepage "https://github.com/Johan-Ott/rune-vcs"
  license "Apache-2.0"
  version "$VERSION"

  on_macos do
    if Hardware::CPU.arm?
      url "$ARM64_ASSET"
      sha256 "$ARM64_SHA256"
    end

    if Hardware::CPU.intel?
      url "$INTEL_ASSET"
      sha256 "$INTEL_SHA256"
    end
  end

  depends_on "git"

  def install
    bin.install "rune" => "rune-vcs"
  end

  test do
    system "#{bin}/rune-vcs", "--version"
    assert_match "rune $VERSION", shell_output("#{bin}/rune-vcs --version")
  end
end
EOF

print_status "Formula updated"

# Commit and push
print_info "Committing and pushing changes..."
git add Formula/rune-vcs.rb
git commit -m "Update rune-vcs to $VERSION

- ARM64 macOS: $ARM64_SHA256
- Intel macOS: $INTEL_SHA256
- Release: https://github.com/Johan-Ott/rune-vcs/releases/tag/$VERSION_TAG

Automated update from release pipeline."

git push origin master

print_status "Homebrew tap updated successfully!"

# Cleanup
cd /
rm -rf "$TEMP_DIR" "$TAP_DIR"

print_status "🎉 Homebrew tap update complete!"
print_info "Users can now install with:"
echo "  brew upgrade rune-vcs"
echo "  brew install johan-ott/rune-vcs/rune-vcs"
