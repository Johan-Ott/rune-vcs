#!/bin/bash

# Script to fix unused variable warnings by prefixing with underscore

cd /Users/johanottosson/Documents/small_projects_prog/rune-vcs

# Fix remaining unused variables in large_repo_optimization.rs
sed -i.bak 's/object_id: &str/_object_id: \&str/g' crates/rune-performance/src/large_repo_optimization.rs
sed -i.bak 's/object_id: String/_object_id: String/g' crates/rune-performance/src/large_repo_optimization.rs

# Fix unused variables in AI module
sed -i.bak 's/chosen_suggestion: &ResolutionSuggestion/_chosen_suggestion: \&ResolutionSuggestion/g' crates/rune-ai/src/conflict_resolution.rs
sed -i.bak 's/ref mut incoming/_incoming/g' crates/rune-ai/src/conflict_resolution.rs

# Fix unused variables in main.rs
sed -i.bak 's/let store =/_store =/g' crates/rune-cli/src/main.rs
sed -i.bak 's/let commit_map:/_commit_map:/g' crates/rune-cli/src/main.rs

# Clean up backup files
find . -name "*.bak" -delete

echo "✅ Fixed unused variable warnings"
