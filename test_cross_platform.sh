#!/bin/bash

# Cross-platform build testing script for Rune VCS
set -e

echo "🚀 Cross-Platform Build Testing for Rune VCS"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to build for a target
build_target() {
    local target=$1
    local description=$2
    
    print_status $BLUE "📦 Building for ${description} (${target})..."
    
    # Install target if not already installed
    if ! rustup target list --installed | grep -q "${target}"; then
        print_status $YELLOW "  Installing target ${target}..."
        rustup target add "${target}"
    fi
    
    # Build for the target
    if cargo build --release --target "${target}" --bin rune; then
        print_status $GREEN "  ✅ ${description} build successful"
        
        # Check if binary was created
        local binary_path="target/${target}/release/rune"
        if [[ "${target}" == *"windows"* ]]; then
            binary_path="${binary_path}.exe"
        fi
        
        if [[ -f "${binary_path}" ]]; then
            local size=$(du -h "${binary_path}" | cut -f1)
            print_status $GREEN "  📊 Binary size: ${size}"
            
            # For non-Windows targets, try to get version if we can run it
            if [[ "${target}" != *"windows"* ]] && [[ "${target}" == *"$(uname -m)"* || "${target}" == "x86_64-unknown-linux-gnu" ]]; then
                if ./"${binary_path}" --version 2>/dev/null; then
                    print_status $GREEN "  🎯 Binary is executable and working"
                else
                    print_status $YELLOW "  ⚠️  Binary created but may not be executable on this system"
                fi
            fi
        else
            print_status $RED "  ❌ Binary not found at expected location"
        fi
        
        echo ""
        return 0
    else
        print_status $RED "  ❌ ${description} build failed"
        echo ""
        return 1
    fi
}

# Function to install cross-compilation dependencies
install_cross_deps() {
    print_status $BLUE "🔧 Installing cross-compilation dependencies..."
    
    # Install cross if not available
    if ! command -v cross &> /dev/null; then
        print_status $YELLOW "  Installing 'cross' for better cross-compilation..."
        cargo install cross --git https://github.com/cross-rs/cross || true
    fi
    
    echo ""
}

# Main build targets
TARGETS=(
    "x86_64-unknown-linux-gnu:Linux x86_64"
    "aarch64-unknown-linux-gnu:Linux ARM64"
    "x86_64-pc-windows-msvc:Windows x86_64 (MSVC)"
    "x86_64-pc-windows-gnu:Windows x86_64 (GNU)"
    "x86_64-apple-darwin:macOS x86_64"
    "aarch64-apple-darwin:macOS ARM64 (M1/M2)"
)

# Parse command line arguments
SELECTED_TARGETS=()
INSTALL_DEPS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --linux)
            SELECTED_TARGETS+=("x86_64-unknown-linux-gnu:Linux x86_64")
            SELECTED_TARGETS+=("aarch64-unknown-linux-gnu:Linux ARM64")
            shift
            ;;
        --windows)
            SELECTED_TARGETS+=("x86_64-pc-windows-msvc:Windows x86_64 (MSVC)")
            SELECTED_TARGETS+=("x86_64-pc-windows-gnu:Windows x86_64 (GNU)")
            shift
            ;;
        --macos)
            SELECTED_TARGETS+=("x86_64-apple-darwin:macOS x86_64")
            SELECTED_TARGETS+=("aarch64-apple-darwin:macOS ARM64 (M1/M2)")
            shift
            ;;
        --install-deps)
            INSTALL_DEPS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --linux       Build for Linux targets only"
            echo "  --windows     Build for Windows targets only"
            echo "  --macos       Build for macOS targets only"
            echo "  --install-deps Install cross-compilation dependencies"
            echo "  --help        Show this help message"
            echo ""
            echo "If no platform options are specified, builds for all platforms."
            exit 0
            ;;
        *)
            print_status $RED "Unknown option: $1"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# If no targets selected, use all targets
if [[ ${#SELECTED_TARGETS[@]} -eq 0 ]]; then
    SELECTED_TARGETS=("${TARGETS[@]}")
fi

# Install dependencies if requested
if [[ "$INSTALL_DEPS" == "true" ]]; then
    install_cross_deps
fi

# Clean previous builds
print_status $BLUE "🧹 Cleaning previous builds..."
cargo clean
echo ""

# Build summary
successful_builds=0
failed_builds=0
build_results=()

print_status $BLUE "🎯 Building for ${#SELECTED_TARGETS[@]} target(s)..."
echo ""

# Build for each target
for target_info in "${SELECTED_TARGETS[@]}"; do
    IFS=':' read -r target description <<< "$target_info"
    
    if build_target "$target" "$description"; then
        ((successful_builds++))
        build_results+=("✅ $description")
    else
        ((failed_builds++))
        build_results+=("❌ $description")
    fi
done

# Summary
echo ""
print_status $BLUE "📊 Build Summary"
print_status $BLUE "================"
print_status $GREEN "✅ Successful builds: $successful_builds"
if [[ $failed_builds -gt 0 ]]; then
    print_status $RED "❌ Failed builds: $failed_builds"
fi

echo ""
print_status $BLUE "📋 Detailed Results:"
for result in "${build_results[@]}"; do
    echo "  $result"
done

echo ""
if [[ $failed_builds -eq 0 ]]; then
    print_status $GREEN "🎉 All builds completed successfully!"
    
    # Show available binaries
    echo ""
    print_status $BLUE "📦 Built binaries:"
    for target_info in "${SELECTED_TARGETS[@]}"; do
        IFS=':' read -r target description <<< "$target_info"
        local binary_path="target/${target}/release/rune"
        if [[ "${target}" == *"windows"* ]]; then
            binary_path="${binary_path}.exe"
        fi
        
        if [[ -f "${binary_path}" ]]; then
            local size=$(du -h "${binary_path}" | cut -f1)
            echo "  ${description}: ${binary_path} (${size})"
        fi
    done
    
    exit 0
else
    print_status $RED "❌ Some builds failed. Check the output above for details."
    exit 1
fi
