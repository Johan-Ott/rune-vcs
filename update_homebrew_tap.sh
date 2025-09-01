#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🍺 Automated Homebrew Tap Update Script${NC}"
echo -e "${YELLOW}📦 Version: v0.3.2-alpha.6${NC}"

# Check if we're in the right directory
if [ ! -f "homebrew_formula_v0.3.2-alpha.6.rb" ]; then
    echo -e "${RED}❌ Error: homebrew_formula_v0.3.2-alpha.6.rb not found${NC}"
    echo "Please run this script from the rune-vcs directory"
    exit 1
fi

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
