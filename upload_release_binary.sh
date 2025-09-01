#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 GitHub Release Binary Upload Script${NC}"
echo -e "${YELLOW}🚀 Version: v0.3.2-alpha.6${NC}"

BINARY_FILE="release-macos/rune-0.3.2-alpha.6-aarch64-apple-darwin.tar.gz"
RELEASE_TAG="v0.3.2-alpha.6"
REPO="Johan-Ott/rune-vcs"

# Check if binary exists
if [ ! -f "$BINARY_FILE" ]; then
    echo -e "${RED}❌ Error: Binary file not found: $BINARY_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Checking GitHub CLI authentication...${NC}"
if gh auth status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ GitHub CLI is authenticated${NC}"
    
    echo -e "${BLUE}📤 Uploading binary to GitHub release...${NC}"
    gh release upload "$RELEASE_TAG" "$BINARY_FILE" --clobber
    
    echo -e "${GREEN}✅ Binary uploaded successfully!${NC}"
    echo -e "${YELLOW}🔗 Release URL: https://github.com/$REPO/releases/tag/$RELEASE_TAG${NC}"
else
    echo -e "${YELLOW}⚠️  GitHub CLI not authenticated${NC}"
    echo -e "${BLUE}📋 Manual upload instructions:${NC}"
    echo "1. Go to: https://github.com/$REPO/releases/tag/$RELEASE_TAG"
    echo "2. Click 'Edit release'"
    echo "3. Drag and drop or select file: $BINARY_FILE"
    echo "4. Click 'Update release'"
    echo
    echo -e "${BLUE}💡 To authenticate GitHub CLI for future use:${NC}"
    echo "gh auth login"
fi
