#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🍺 Updating Homebrew Tap Repository${NC}"

# Variables
HOMEBREW_REPO="https://github.com/Johan-Ott/homebrew-rune-vcs.git"
TEMP_DIR="/tmp/homebrew-rune-vcs-update"

# Get the latest version from git tags
echo -e "${BLUE}🔍 Finding latest version...${NC}"
VERSION=$(git tag --sort=-version:refname | head -1 | sed 's/^v//')
if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ Could not find any git tags${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Latest version: ${VERSION}${NC}"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"

echo -e "${YELLOW}📦 Cloning Homebrew tap repository...${NC}"
git clone "$HOMEBREW_REPO" "$TEMP_DIR"

cd "$TEMP_DIR"

# Download and calculate checksums for both architectures
echo -e "${BLUE}📥 Downloading release assets for checksum calculation...${NC}"

ARM64_URL="https://github.com/Johan-Ott/rune-vcs/releases/download/v${VERSION}/rune-${VERSION}-aarch64-apple-darwin.tar.gz"
INTEL_URL="https://github.com/Johan-Ott/rune-vcs/releases/download/v${VERSION}/rune-${VERSION}-x86_64-apple-darwin.tar.gz"

# Create temp download directory
mkdir -p "${TEMP_DIR}/downloads"
cd "${TEMP_DIR}/downloads"

# Download and calculate ARM64 checksum
echo -e "${BLUE}🔽 Downloading ARM64 asset...${NC}"
ARM64_FILE="rune-${VERSION}-aarch64-apple-darwin.tar.gz"
if curl -sL "${ARM64_URL}" -o "${ARM64_FILE}"; then
    ARM64_SHA256=$(shasum -a 256 "${ARM64_FILE}" | cut -d' ' -f1)
    echo -e "${GREEN}✅ ARM64 SHA256: ${ARM64_SHA256}${NC}"
else
    echo -e "${RED}❌ Failed to download ARM64 asset${NC}"
    exit 1
fi

# Download and calculate Intel checksum
echo -e "${BLUE}🔽 Downloading Intel asset...${NC}"
INTEL_FILE="rune-${VERSION}-x86_64-apple-darwin.tar.gz"
if curl -sL "${INTEL_URL}" -o "${INTEL_FILE}"; then
    INTEL_SHA256=$(shasum -a 256 "${INTEL_FILE}" | cut -d' ' -f1)
    echo -e "${GREEN}✅ Intel SHA256: ${INTEL_SHA256}${NC}"
else
    echo -e "${RED}❌ Failed to download Intel asset${NC}"
    exit 1
fi

# Go back to tap repository
cd "$TEMP_DIR"

echo -e "${YELLOW}📝 Updating Formula/rune-vcs.rb...${NC}"

# Create the updated formula content
cat > Formula/rune-vcs.rb << EOF
class RuneVcs < Formula
  desc "Modern, intelligent version control system"
  homepage "https://github.com/Johan-Ott/rune-vcs"
  license "Apache-2.0"
  version "${VERSION}"

  on_macos do
    if Hardware::CPU.arm?
      url "${ARM64_URL}"
      sha256 "${ARM64_SHA256}"
    end

    if Hardware::CPU.intel?
      url "${INTEL_URL}"
      sha256 "${INTEL_SHA256}"
    end
  end

  depends_on "git"

  def install
    bin.install "rune" => "rune-vcs"
  end

  test do
    system "#{bin}/rune-vcs", "--version"
    assert_match "rune #{version}", shell_output("#{bin}/rune-vcs --version")
  end
end
EOF

echo -e "${GREEN}✅ Formula updated successfully${NC}"

echo -e "${YELLOW}📝 Committing changes...${NC}"
git add Formula/rune-vcs.rb
git commit -m "Update rune-vcs to v${VERSION}

- Updated to version ${VERSION}
- Added support for both ARM64 and Intel macOS
- Updated checksums and URLs
- ARM64 SHA256: ${ARM64_SHA256}
- Intel SHA256: ${INTEL_SHA256}

Release: https://github.com/Johan-Ott/rune-vcs/releases/tag/v${VERSION}"

echo -e "${YELLOW}🚀 Pushing to origin...${NC}"
git push origin master

echo -e "${GREEN}✅ Homebrew tap successfully updated!${NC}"
echo -e "${BLUE}Users can now install with:${NC}"
echo -e "${BLUE}  brew tap johan-ott/rune-vcs${NC}"
echo -e "${BLUE}  brew install rune-vcs${NC}"

# Clean up
cd /
rm -rf "$TEMP_DIR"

echo -e "${GREEN}🎉 All done!${NC}"
