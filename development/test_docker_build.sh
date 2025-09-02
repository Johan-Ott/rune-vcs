#!/bin/bash

# Test Docker build locally
echo "Testing Docker build..."

# Build the Docker image
echo "Building Docker image..."
if docker build -t rune-test .; then
    echo "✓ Docker build successful"
    
    # Test the image
    echo "Testing the built image..."
    if docker run --rm rune-test rune --version; then
        echo "✓ Docker image test successful"
    else
        echo "❌ Docker image test failed"
        exit 1
    fi
    
    # Clean up
    echo "Cleaning up..."
    docker rmi rune-test
    echo "✓ Test completed successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi
