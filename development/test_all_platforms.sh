#!/bin/bash

# Comprehensive cross-platform testing suite for Rune VCS
set -e

echo "🌍 Comprehensive Cross-Platform Testing Suite"
echo "============================================="
echo "Testing Rune VCS across multiple platforms and environments"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Test Options:"
    echo "  --quick           Quick test (local cross-compilation only)"
    echo "  --full            Full test suite (all methods)"
    echo "  --cross-compile   Test cross-compilation for all platforms"
    echo "  --docker          Test Docker-based builds"
    echo "  --github-sim      Simulate GitHub Actions environment"
    echo ""
    echo "Platform Options:"
    echo "  --linux           Test Linux targets"
    echo "  --windows         Test Windows targets"
    echo "  --macos           Test macOS targets"
    echo ""
    echo "Other Options:"
    echo "  --install-deps    Install cross-compilation tools"
    echo "  --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --quick --linux          # Quick test for Linux only"
    echo "  $0 --full                   # Complete test suite"
    echo "  $0 --cross-compile --windows # Cross-compile for Windows"
}

# Parse arguments
TEST_MODES=()
PLATFORMS=()
INSTALL_DEPS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            TEST_MODES=("cross-compile")
            shift
            ;;
        --full)
            TEST_MODES=("cross-compile" "docker" "github-sim")
            shift
            ;;
        --cross-compile)
            TEST_MODES+=("cross-compile")
            shift
            ;;
        --docker)
            TEST_MODES+=("docker")
            shift
            ;;
        --github-sim)
            TEST_MODES+=("github-sim")
            shift
            ;;
        --linux)
            PLATFORMS+=("--linux")
            shift
            ;;
        --windows)
            PLATFORMS+=("--windows")
            shift
            ;;
        --macos)
            PLATFORMS+=("--macos")
            shift
            ;;
        --install-deps)
            INSTALL_DEPS=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_status $RED "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Default to quick test if no modes specified
if [[ ${#TEST_MODES[@]} -eq 0 ]]; then
    TEST_MODES=("cross-compile")
fi

# Install dependencies if requested
if [[ "$INSTALL_DEPS" == "true" ]]; then
    print_status $BLUE "🔧 Installing dependencies..."
    
    # Install cross-compilation targets
    print_status $YELLOW "  Installing Rust targets..."
    rustup target add x86_64-unknown-linux-gnu
    rustup target add aarch64-unknown-linux-gnu
    rustup target add x86_64-pc-windows-msvc
    rustup target add x86_64-pc-windows-gnu
    rustup target add x86_64-apple-darwin
    rustup target add aarch64-apple-darwin
    
    # Install cross tool
    if ! command -v cross &> /dev/null; then
        print_status $YELLOW "  Installing 'cross' tool..."
        cargo install cross --git https://github.com/cross-rs/cross
    fi
    
    echo ""
fi

# Test results tracking
declare -a test_results
total_tests=0
passed_tests=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status $BLUE "🧪 Running: $test_name"
    echo "Command: $test_command"
    echo ""
    
    ((total_tests++))
    
    if eval "$test_command"; then
        print_status $GREEN "✅ $test_name - PASSED"
        test_results+=("✅ $test_name")
        ((passed_tests++))
    else
        print_status $RED "❌ $test_name - FAILED"
        test_results+=("❌ $test_name")
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Run tests based on selected modes
for mode in "${TEST_MODES[@]}"; do
    case $mode in
        "cross-compile")
            # Build platform arguments
            platform_args=""
            if [[ ${#PLATFORMS[@]} -gt 0 ]]; then
                platform_args="${PLATFORMS[*]}"
            fi
            
            run_test "Cross-Platform Compilation" "./test_cross_platform.sh $platform_args"
            ;;
        "docker")
            run_test "Docker Build Test" "./test_docker_platforms.sh docker"
            ;;
        "github-sim")
            run_test "GitHub Actions Simulation" "./test_docker_platforms.sh github-actions"
            ;;
    esac
done

# Final summary
echo ""
print_status $BLUE "📊 Final Test Summary"
print_status $BLUE "===================="
print_status $GREEN "✅ Passed: $passed_tests/$total_tests tests"

if [[ $passed_tests -lt $total_tests ]]; then
    print_status $RED "❌ Failed: $((total_tests - passed_tests))/$total_tests tests"
fi

echo ""
print_status $BLUE "📋 Detailed Results:"
for result in "${test_results[@]}"; do
    echo "  $result"
done

echo ""

if [[ $passed_tests -eq $total_tests ]]; then
    print_status $GREEN "🎉 All tests passed! Your project builds successfully across platforms."
    
    # Show next steps
    echo ""
    print_status $BLUE "🚀 Next Steps:"
    echo "  1. Your builds are working locally"
    echo "  2. GitHub Actions workflows are ready for manual triggers"
    echo "  3. You can now commit and push your changes"
    echo "  4. Use the GitHub Actions UI to trigger builds manually"
    
    exit 0
else
    print_status $RED "❌ Some tests failed. Review the output above for details."
    
    # Show debugging tips
    echo ""
    print_status $YELLOW "🔍 Debugging Tips:"
    echo "  1. Check dependency versions in Cargo.toml files"
    echo "  2. Ensure all required system libraries are available"
    echo "  3. Try running individual tests to isolate issues"
    echo "  4. Check cross-compilation documentation for target-specific requirements"
    
    exit 1
fi
