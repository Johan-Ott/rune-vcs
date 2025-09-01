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
VERSION="0.3.2-alpha.6"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"

echo -e "${YELLOW}📦 Cloning Homebrew tap repository...${NC}"
git clone "$HOMEBREW_REPO" "$TEMP_DIR"

cd "$TEMP_DIR"

echo -e "${YELLOW}� Updating Formula/rune-vcs.rb...${NC}"

# Create the updated formula content
cat > Formula/rune-vcs.rb << 'EOF'
class RuneVcs < Formula
  desc "Modern, intelligent version control system"
  homepage "https://github.com/Johan-Ott/rune-vcs"
  url "https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.2-alpha.6/rune-0.3.2-alpha.6-aarch64-apple-darwin.tar.gz"
  sha256 "287ca9250b499f7aac37b1f866136e7663bd66e26b708bd751fa56363b114377"
  license "Apache-2.0"
  version "0.3.2-alpha.6"

  # Currently only supports Apple Silicon Macs due to build constraints
  depends_on arch: :arm64

  def install
    bin.install "rune" => "rune-vcs"
  end

  test do
    system "#{bin}/rune-vcs", "--version"
    assert_match "rune #{version}", shell_output("#{bin}/rune-vcs --version")
  end
end
EOF

echo -e "${YELLOW}📝 Committing changes...${NC}"
git add Formula/rune-vcs.rb
git commit -m "Update rune-vcs to v${VERSION}

- Updated to version ${VERSION}
- Added ARM64 macOS binary support
- Updated checksums and URLs
- Documentation overhaul release

Features in this release:
- Complete documentation site redesign with Raycast-inspired aesthetic
- Professional branding update from 'Rune VCS' to 'Rune'
- Comprehensive user guides and developer documentation
- Clean, modern design with glassmorphism effects"

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

echo -e "${BLUE}📥 Cloning Homebrew tap repository...${NC}"
cd ..
rm -rf homebrew-tap-temp
git clone https://github.com/Johan-Ott/homebrew-rune-vcs.git homebrew-tap-temp
cd homebrew-tap-temp

echo -e "${BLUE}🔄 Creating update branch...${NC}"
git checkout -b update-v0.3.2-alpha.6

echo -e "${BLUE}📝 Updating Formula/rune-vcs.rb...${NC}"
cp ../rune-vcs/homebrew_formula_v0.3.2-alpha.6.rb Formula/rune-vcs.rb

echo -e "${BLUE}💾 Committing changes...${NC}"
git add Formula/rune-vcs.rb
git commit -m "Update rune-vcs to v0.3.2-alpha.6

- Documentation overhaul with Raycast-inspired design
- Brand update from 'Rune VCS' to 'Rune'
- ARM64 macOS support only (Intel build issues with OpenSSL)
- SHA256: 287ca9250b499f7aac37b1f866136e7663bd66e26b708bd751fa56363b114377

Release notes: https://github.com/Johan-Ott/rune-vcs/releases/tag/v0.3.2-alpha.6"

echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin update-v0.3.2-alpha.6

echo -e "${GREEN}✅ Homebrew tap update complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Go to: https://github.com/Johan-Ott/homebrew-rune-vcs"
echo "2. Create a Pull Request from update-v0.3.2-alpha.6 to main"
echo "3. Upload the binary to GitHub release manually:"
echo "   https://github.com/Johan-Ott/rune-vcs/releases/tag/v0.3.2-alpha.6"
echo
echo -e "${GREEN}🎉 Once merged, users can install with:${NC}"
echo "brew tap johan-ott/rune-vcs"
echo "brew install rune-vcs"

# Cleanup
cd ..
rm -rf homebrew-tap-temp
