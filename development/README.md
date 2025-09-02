# Development Scripts

This directory contains scripts for building, testing, and releasing Rune VCS.

## Release Scripts

### `release.sh` - Automated Release Pipeline
**Main release script** that handles the complete release process:
```bash
./release.sh 0.3.4-alpha.1
```

**What it does:**
1. ✅ Updates version in `Cargo.toml`
2. ✅ Commits version change
3. ✅ Creates and pushes git tag
4. ✅ Triggers GitHub Actions release workflow
5. ✅ Waits for release to complete
6. ✅ Automatically updates Homebrew tap

### `update_homebrew_for_release.sh` - Homebrew Tap Updater
Updates Homebrew tap for a specific release:
```bash
./update_homebrew_for_release.sh v0.3.4-alpha.1
```

**What it does:**
1. ✅ Fetches release info from GitHub API
2. ✅ Downloads macOS binaries to calculate checksums
3. ✅ Updates Formula/rune-vcs.rb with correct URLs and checksums
4. ✅ Commits and pushes to homebrew-rune-vcs repository

## Legacy Scripts

### `update_homebrew_tap.sh` - Original Homebrew Script
Original homebrew update script (kept for reference).

### `update_homebrew_tap_clean.sh` - Clean Homebrew Script
Clean version of homebrew script (kept for reference).

### `update_homebrew_tap_new.sh` - Advanced Homebrew Script
Advanced homebrew script with GitHub CLI integration.

## Test Scripts

### `test_simple_release.sh` - Quick Release Test
Simple script to test release functionality.

### `test_release_build.sh` - Release Build Test
Tests the release build process.

### `test_all_platforms.sh` - Multi-Platform Test
Tests building on all supported platforms.

### `test_cross_platform.sh` - Cross-Compilation Test
Tests cross-compilation for different targets.

### `test_docker_build.sh` - Docker Build Test
Tests Docker build functionality.

### `test_docker_platforms.sh` - Docker Multi-Platform Test
Tests Docker builds on multiple platforms.

## Usage Examples

### Complete Release Process
```bash
# Release new version
./release.sh 0.3.4-alpha.1

# Manual homebrew update (if needed)
./update_homebrew_for_release.sh v0.3.4-alpha.1
```

### Testing Before Release
```bash
# Test basic functionality
./test_simple_release.sh

# Test all platforms
./test_all_platforms.sh

# Test Docker builds
./test_docker_platforms.sh
```

## Requirements

- **Git:** For version control operations
- **GitHub CLI (optional):** For triggering workflows (`brew install gh`)
- **curl:** For downloading release assets
- **shasum:** For calculating checksums (built-in on macOS)

## File Organization

```
development/
├── README.md                     # This file
├── release.sh                    # 🚀 Main release script
├── update_homebrew_for_release.sh # 🍺 Homebrew updater
├── test_*.sh                     # 🧪 Test scripts
└── update_homebrew_*.sh          # 📦 Legacy homebrew scripts
```

## Notes

- All scripts should be run from the development directory
- Scripts automatically handle error checking and cleanup
- Colored output for better visibility
- Comprehensive logging of all operations
