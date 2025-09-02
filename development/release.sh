#!/bin/bash

# Automated Release Script for Rune VCS
# This script handles the complete release process:
# 1. Updates version in Cargo.toml
# 2. Commits changes
# 3. Creates git tag
# 4. Triggers GitHub Actions release
# 5. Updates Homebrew tap

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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${GREEN}🚀 Rune VCS Automated Release Pipeline${NC}"
echo "====================================="

# Check if version argument is provided
if [ -z "$1" ]; then
    print_error "Usage: $0 <version>"
    print_info "Example: $0 0.3.4-alpha.1"
    exit 1
fi

NEW_VERSION="$1"
print_info "Target version: $NEW_VERSION"

# Validate version format (basic check)
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[0-9]+)?)?$ ]]; then
    print_error "Invalid version format. Use semantic versioning (e.g., 0.3.4-alpha.1)"
    exit 1
fi

# Check if we're in the right directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

if [ ! -f "Cargo.toml" ]; then
    print_error "Cargo.toml not found. Cannot locate project root."
    exit 1
fi

print_info "Working from project root: $PROJECT_ROOT"

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    git status --porcelain
    exit 1
fi

print_status "Pre-flight checks passed"

# Step 1: Update version in Cargo.toml
print_info "Updating version in Cargo.toml..."
sed -i.bak "s/^version = \".*\"$/version = \"$NEW_VERSION\"/" Cargo.toml
rm Cargo.toml.bak

# Verify the change
UPDATED_VERSION=$(grep '^version = ' Cargo.toml | cut -d'"' -f2)
if [ "$UPDATED_VERSION" != "$NEW_VERSION" ]; then
    print_error "Failed to update version in Cargo.toml"
    exit 1
fi
print_status "Updated Cargo.toml version to $NEW_VERSION"

# Step 2: Commit the version change
print_info "Committing version update..."
git add Cargo.toml
git commit -m "Release v$NEW_VERSION

- Update workspace version to $NEW_VERSION
- Automated release pipeline execution"

print_status "Version update committed"

# Step 3: Create and push git tag
print_info "Creating git tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"
git push origin main
git push origin "v$NEW_VERSION"
print_status "Git tag created and pushed"

# Step 4: Trigger GitHub Actions release workflow
print_info "Triggering GitHub Actions release workflow..."
if command -v gh &> /dev/null; then
    gh workflow run release.yml --ref "v$NEW_VERSION"
    print_status "GitHub Actions release workflow triggered"
else
    print_warning "GitHub CLI not found. Please manually trigger the release workflow."
    print_info "Go to: https://github.com/Johan-Ott/rune-vcs/actions/workflows/release.yml"
    print_info "Click 'Run workflow' and select tag: v$NEW_VERSION"
fi

# Step 5: Wait for release to be created (optional)
print_info "Waiting for GitHub release to be created..."
TIMEOUT=300  # 5 minutes
ELAPSED=0
INTERVAL=10

while [ $ELAPSED -lt $TIMEOUT ]; do
    if command -v gh &> /dev/null; then
        if gh release view "v$NEW_VERSION" --repo Johan-Ott/rune-vcs &>/dev/null; then
            print_status "Release v$NEW_VERSION is available!"
            break
        fi
    else
        # Manual check suggestion
        print_info "Check if release is ready: https://github.com/Johan-Ott/rune-vcs/releases/tag/v$NEW_VERSION"
        read -p "Is the release ready with all assets? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            break
        fi
    fi
    
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    print_info "Still waiting for release... (${ELAPSED}s/${TIMEOUT}s)"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    print_warning "Timeout waiting for release. Please check manually and run homebrew update separately."
    print_info "Once release is ready, run: $SCRIPT_DIR/update_homebrew_for_release.sh v$NEW_VERSION"
    exit 0
fi

# Step 6: Update Homebrew tap
print_info "Updating Homebrew tap..."
"$SCRIPT_DIR/update_homebrew_for_release.sh" "v$NEW_VERSION"

print_status "🎉 Release v$NEW_VERSION completed successfully!"
echo ""
print_info "Summary:"
echo "  📦 Version: $NEW_VERSION"
echo "  🏷️  Git tag: v$NEW_VERSION" 
echo "  🚀 GitHub release: https://github.com/Johan-Ott/rune-vcs/releases/tag/v$NEW_VERSION"
echo "  🍺 Homebrew: brew install johan-ott/rune-vcs/rune-vcs"
echo ""
print_info "Users can now install the latest version with:"
echo "  brew upgrade rune-vcs"
