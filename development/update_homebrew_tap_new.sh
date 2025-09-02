#!/bin/bash

# Automated Homebrew Tap Updater for Rune VCS
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

echo -e "${GREEN}🍺 Rune VCS Homebrew Tap Updater${NC}"
echo "====================================="

# Configuration
REPO_OWNER="Johan-Ott"
REPO_NAME="rune-vcs"
HOMEBREW_TAP_REPO="homebrew-rune-vcs"
TEMP_DIR="/tmp/homebrew-rune-vcs-update"

# Get the latest release information
print_info "Fetching latest release information..."

# Check if we have GitHub CLI
if command -v gh &> /dev/null; then
    print_info "Using GitHub CLI to fetch release info..."
    
    # Get latest release tag
    LATEST_TAG=$(gh release list --repo "$REPO_OWNER/$REPO_NAME" --limit 1 --json tagName --jq '.[0].tagName' 2>/dev/null || echo "")
    
    if [[ -z "$LATEST_TAG" ]]; then
        print_error "Could not fetch latest release tag"
        print_info "Please run: gh auth login"
        exit 1
    fi
    
    print_status "Latest release: $LATEST_TAG"
    
    # Get release assets
    print_info "Fetching release assets..."
    ASSETS=$(gh release view "$LATEST_TAG" --repo "$REPO_OWNER/$REPO_NAME" --json assets --jq '.assets[] | select(.name | test(".*darwin.*tar.gz$")) | {name, downloadUrl}')
    
    if [[ -z "$ASSETS" ]]; then
        print_error "No macOS assets found in latest release"
        exit 1
    fi
    
    # Extract URLs for both macOS architectures
    ARM64_URL=$(echo "$ASSETS" | jq -r 'select(.name | test("aarch64-apple-darwin")) | .downloadUrl' | head -1)
    X86_64_URL=$(echo "$ASSETS" | jq -r 'select(.name | test("x86_64-apple-darwin")) | .downloadUrl' | head -1)
    
    print_status "ARM64 macOS URL: $ARM64_URL"
    print_status "Intel macOS URL: $X86_64_URL"
    
else
    print_error "GitHub CLI (gh) not found!"
    print_info "Please install: brew install gh"
    print_info "Then run: gh auth login"
    exit 1
fi

# Download and get checksums
print_info "Downloading assets to get checksums..."

# Create temp directory for downloads
mkdir -p "$TEMP_DIR/downloads"
cd "$TEMP_DIR/downloads"

# Download ARM64 binary
ARM64_FILE=$(basename "$ARM64_URL")
print_info "Downloading $ARM64_FILE..."
curl -sL "$ARM64_URL" -o "$ARM64_FILE"
ARM64_SHA256=$(shasum -a 256 "$ARM64_FILE" | cut -d' ' -f1)
print_status "ARM64 SHA256: $ARM64_SHA256"

# Download Intel binary  
X86_64_FILE=$(basename "$X86_64_URL")
print_info "Downloading $X86_64_FILE..."
curl -sL "$X86_64_URL" -o "$X86_64_FILE"
X86_64_SHA256=$(shasum -a 256 "$X86_64_FILE" | cut -d' ' -f1)
print_status "Intel SHA256: $X86_64_SHA256"

# Extract version from tag (remove 'v' prefix if present)
VERSION=${LATEST_TAG#v}
print_status "Version: $VERSION"

# Create the Homebrew formula
print_info "Creating Homebrew formula..."

cd "$TEMP_DIR"

# Clone or update the Homebrew tap repository
if [[ -d ".git" ]]; then
    print_info "Updating existing tap repository..."
    git pull origin main
else
    print_info "Cloning Homebrew tap repository..."
    rm -rf "$TEMP_DIR"
    git clone "https://github.com/$REPO_OWNER/$HOMEBREW_TAP_REPO.git" "$TEMP_DIR"
    cd "$TEMP_DIR"
fi

# Create Formula directory if it doesn't exist
mkdir -p Formula

# Generate the formula
cat > Formula/rune.rb << EOF
class Rune < Formula
  desc "Rune - Modern, intelligent version control system with AI-powered features"
  homepage "https://github.com/$REPO_OWNER/$REPO_NAME"
  license "Apache-2.0"
  version "$VERSION"

  on_macos do
    if Hardware::CPU.arm?
      url "$ARM64_URL"
      sha256 "$ARM64_SHA256"

      def install
        bin.install "rune"
      end
    end

    if Hardware::CPU.intel?
      url "$X86_64_URL"
      sha256 "$X86_64_SHA256"

      def install
        bin.install "rune"
      end
    end
  end

  depends_on "git"

  def install
    bin.install "rune"
    
    # Generate shell completions
    if bin.exist?("rune")
      bash_completion.install_if_exists "completions/rune.bash" => "rune"
      zsh_completion.install_if_exists "completions/_rune"
      fish_completion.install_if_exists "completions/rune.fish"
    end
  end

  test do
    system "#{bin}/rune", "--version"
    assert_match "$VERSION", shell_output("#{bin}/rune --version 2>&1")
    
    # Test basic functionality
    system "#{bin}/rune", "--help"
  end
end
EOF

print_status "Formula created: Formula/rune.rb"

# Show the formula content
print_info "Formula content:"
echo "----------------------------------------"
cat Formula/rune.rb
echo "----------------------------------------"

# Commit and push changes
print_info "Committing and pushing changes..."

git add Formula/rune.rb

if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    git config user.name "Rune VCS Bot" || true
    git config user.email "noreply@rune-vcs.dev" || true
    
    git commit -m "Update rune formula to version $VERSION

- ARM64 macOS: $ARM64_SHA256
- Intel macOS: $X86_64_SHA256
- Release: $LATEST_TAG"

    print_info "Pushing to Homebrew tap repository..."
    git push origin main
    
    print_status "Homebrew tap updated successfully!"
fi

# Clean up
cd /
rm -rf "$TEMP_DIR"

echo ""
print_status "🎉 Homebrew tap update complete!"
echo ""
print_info "Users can now install Rune with:"
echo -e "${YELLOW}brew tap $REPO_OWNER/rune-vcs${NC}"
echo -e "${YELLOW}brew install rune${NC}"
echo ""
print_info "Or in one command:"
echo -e "${YELLOW}brew install $REPO_OWNER/rune-vcs/rune${NC}"
