#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🍺 Updating Homebrew Tap with Correct URLs${NC}"

# Variables
HOMEBREW_REPO="https://github.com/Johan-Ott/homebrew-rune-vcs.git"
TEMP_DIR="/tmp/homebrew-rune-vcs-fix"
VERSION="v0.3.3-alpha.1"

# Correct URLs and checksums from GitHub API
ARM64_URL="https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.3-alpha.1/rune-main-aarch64-apple-darwin.tar.gz"
ARM64_SHA256="a13bdf49858e94ade39c3069dc06897d699f015c98b8ca1902ba6c7a5ecc9097"

INTEL_URL="https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.3-alpha.1/rune-main-x86_64-apple-darwin.tar.gz"
INTEL_SHA256="754cbe208e57ef46e62be5cd5e7b92ded386a0ee06608d89fa78f54de51e4dc0"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"

echo -e "${YELLOW}📦 Cloning Homebrew tap repository...${NC}"
git clone "$HOMEBREW_REPO" "$TEMP_DIR"

cd "$TEMP_DIR"

echo -e "${YELLOW}📝 Updating Formula/rune-vcs.rb with correct URLs...${NC}"

# Create the updated formula content with correct URLs
cat > Formula/rune-vcs.rb << EOF
class RuneVcs < Formula
  desc "Modern, intelligent version control system"
  homepage "https://github.com/Johan-Ott/rune-vcs"
  license "Apache-2.0"
  version "0.3.3-alpha.1"

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
    assert_match "rune 0.3.3-alpha.1", shell_output("#{bin}/rune-vcs --version")
  end
end
EOF

echo -e "${GREEN}✅ Formula updated with correct URLs${NC}"
echo -e "${BLUE}ARM64 URL: ${ARM64_URL}${NC}"
echo -e "${BLUE}Intel URL: ${INTEL_URL}${NC}"

echo -e "${YELLOW}📝 Committing changes...${NC}"
git add Formula/rune-vcs.rb
git commit -m "Fix rune-vcs URLs for v0.3.3-alpha.1

- Fixed URL paths to use actual filenames: rune-main-*
- Updated ARM64 SHA256: ${ARM64_SHA256}
- Updated Intel SHA256: ${INTEL_SHA256}
- Both URLs now point to correct release assets

This fixes the 404 error when installing via Homebrew."

echo -e "${YELLOW}🚀 Pushing to origin...${NC}"
git push origin master

echo -e "${GREEN}✅ Homebrew tap fixed successfully!${NC}"
echo -e "${BLUE}Users can now install with:${NC}"
echo -e "${BLUE}  brew upgrade rune-vcs${NC}"
echo -e "${BLUE}  brew install johan-ott/rune-vcs/rune-vcs${NC}"

# Clean up
cd /
rm -rf "$TEMP_DIR"

echo -e "${GREEN}🎉 Fix complete!${NC}"
