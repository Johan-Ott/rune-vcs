---
sidebar_position: 3
---

# Branching Strategies

Learn effective branching strategies for different team sizes and project types.

## Git Flow vs Rune Flow

### Traditional Git Flow Problems

- Complex branch naming conventions
- Difficult merge conflicts
- Confusing for new team members
- Manual conflict resolution

### Rune Flow Advantages

- Natural language branch creation
- AI-powered conflict resolution
- Visual branch management
- Intelligent merge strategies

## Recommended Strategies

### 1. Simple Flow (Small Teams)

Perfect for teams of 2-5 developers:

```bash
# Main development branch
main

# Feature branches
rune "create a branch for user profiles"
rune "create a branch for payment integration"

# Direct merge to main
rune checkout main
rune merge --smart feature/user-profiles
```

**Pros:**

- Simple and fast
- AI handles most conflicts
- Good for rapid development

**Cons:**

- Less testing isolation
- Direct production deployments

### 2. Feature Branch Flow (Medium Teams)

Ideal for teams of 5-15 developers:

```bash
# Long-lived branches
main          # Production-ready code
develop       # Integration branch

# Feature branches
rune "create a branch for user authentication from develop"
rune "create a branch for email system from develop"

# Workflow
rune checkout develop
rune merge --smart feature/user-authentication
rune checkout main
rune merge --smart develop  # After testing
```

**Pros:**

- Good testing isolation
- Stable main branch
- Clear feature separation

**Cons:**

- More complex than simple flow
- Potential integration conflicts

### 3. Release Flow (Large Teams)

Best for teams of 15+ developers or enterprise:

```bash
# Branch structure
main                    # Production
develop                 # Next release
release/v1.2.0         # Release preparation
feature/user-auth      # Individual features
hotfix/login-bug       # Emergency fixes

# Create release
rune "create a release branch for version 1.2.0 from develop"

# Hotfix workflow
rune "create a hotfix branch for the login bug from main"
rune checkout main
rune merge --smart hotfix/login-bug
rune checkout develop
rune merge --smart hotfix/login-bug
```

**Pros:**

- Excellent for large teams
- Stable releases
- Clear separation of concerns

**Cons:**

- Most complex strategy
- Requires discipline

## Natural Language Branching

### Creating Branches

```bash
# Instead of: git checkout -b feature/JIRA-123-user-authentication
rune "create a branch for user authentication"
rune "create a branch for JIRA-123"
rune "create a feature branch from the develop branch"
```

### Switching Branches

```bash
# Instead of: git checkout feature/very-long-branch-name
rune "switch to the authentication branch"
rune "go to the branch I was working on yesterday"
rune "switch to main"
```

### Merging Branches

```bash
# Instead of: git merge feature/branch-name
rune "merge the authentication feature"
rune "merge this branch into main"
rune "intelligently merge and resolve conflicts"
```

## Branch Management

### Listing Branches

```bash
# Traditional
rune branch
rune branch -r  # Remote branches
rune branch -a  # All branches

# Natural language
rune "show me all branches"
rune "what branches exist remotely?"
rune "list my recent branches"
```

### Cleaning Up

```bash
# Delete merged branches
rune branch -d feature/completed-feature

# Force delete
rune branch -D feature/abandoned-feature

# Natural language
rune "delete branches that have been merged"
rune "clean up old feature branches"
```

### Branch Information

```bash
# See branch history
rune log --graph

# Compare branches
rune diff main..feature/auth

# Natural language
rune "show me what's different between main and this branch"
rune "how far behind is this branch?"
```

## AI-Powered Features

### Smart Branch Creation

```bash
# AI suggests branch names based on recent commits or file changes
rune "create a branch for this work"
rune "suggest a branch name for my changes"
```

### Intelligent Merging

```bash
# AI resolves simple conflicts automatically
rune merge --smart feature/user-auth

# Get merge conflict suggestions
rune "help me merge this branch"
rune "what conflicts will this merge cause?"
```

### Predictive Conflict Detection

```bash
# Before merging, check for potential issues
rune predict-conflicts feature/auth

# Natural language
rune "will this branch conflict with main?"
rune "check if my branch will have merge issues"
```

## Team Collaboration

### Branch Naming Conventions

While Rune supports natural language, some teams prefer conventions:

```bash
# Feature branches
feature/user-authentication
feature/payment-gateway
feature/JIRA-123

# Bugfix branches
bugfix/login-error
bugfix/payment-timeout

# Hotfix branches
hotfix/security-patch
hotfix/critical-bug

# With Rune's natural language:
rune "create a feature branch for user authentication"
# Creates: feature/user-authentication
```

### Pull Request Workflow

```bash
# Create feature branch
rune "create a branch for the new dashboard"

# Work on changes
rune add .
rune commit --smart

# Push for review
rune push origin feature/dashboard

# After review approval
rune checkout main
rune pull origin main
rune merge --smart feature/dashboard
rune push origin main
```

### Code Review Integration

```bash
# Before creating PR
rune "show me what I've changed"
rune diff main..HEAD

# Prepare for review
rune "create a summary of my changes"
rune "generate commit message for these changes"
```

## Advanced Patterns

### Parallel Development

```bash
# Multiple developers on same feature
rune "create a branch for user-auth backend from feature/user-auth"
rune "create a branch for user-auth frontend from feature/user-auth"

# Merge sub-features
rune checkout feature/user-auth
rune merge --smart feature/user-auth-backend
rune merge --smart feature/user-auth-frontend
```

### Release Branches

```bash
# Prepare release
rune "create a release branch for version 2.1.0"

# Cherry-pick fixes
rune cherry-pick abc123def

# Finalize release
rune tag v2.1.0
rune checkout main
rune merge --smart release/v2.1.0
```

### Emergency Hotfixes

```bash
# Quick fix workflow
rune "create a hotfix branch for the payment bug"
# Fix the issue
rune commit --smart
rune checkout main
rune merge --smart hotfix/payment-bug
rune tag v2.0.1
rune push --tags
```

## Best Practices

### Do's

- Use descriptive branch names
- Merge frequently to avoid conflicts
- Let AI help with conflict resolution
- Use natural language for clarity
- Delete merged branches regularly

### Don'ts

- Don't work directly on main
- Don't create overly complex branch hierarchies
- Don't ignore AI conflict warnings
- Don't merge without testing
- Don't keep stale branches

## Troubleshooting

### Common Issues

```bash
# Branch doesn't exist
rune "show me all available branches"

# Can't switch branches (uncommitted changes)
rune stash
rune checkout target-branch
rune stash pop

# Merge conflicts
rune merge --smart
rune "help me resolve these conflicts"

# Wrong branch
rune "what branch am I on?"
rune "switch to the correct branch"
```
