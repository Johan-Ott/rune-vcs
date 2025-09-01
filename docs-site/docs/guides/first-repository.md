---
sidebar_position: 2
---

# Your First Repository

A step-by-step guide to creating and managing your first Rune repository.

## Creating a New Project

### 1. Set Up Directory

```bash
mkdir my-awesome-project
cd my-awesome-project
```

### 2. Initialize Repository

```bash
rune init
```

This creates:

- `.rune/` directory (like `.git/` but more intelligent)
- Initial configuration
- AI workflow setup

### 3. Configure Your Identity

```bash
rune config user.name "Your Name"
rune config user.email "your.email@example.com"
```

## Adding Your First Files

### 1. Create Some Files

```bash
echo "# My Awesome Project" > README.md
echo "console.log('Hello, Rune!');" > index.js
mkdir src
echo "// Main application logic" > src/app.js
```

### 2. Check Status

```bash
rune status
```

You'll see:

```
Untracked files:
  README.md
  index.js
  src/app.js

Use "rune add <file>..." to track files
Or try: rune "add all these new files"
```

### 3. Add Files

```bash
# Traditional way
rune add .

# Or use natural language
rune "add all new files to the repository"
```

### 4. Make Your First Commit

```bash
# With manual message
rune commit -m "Initial project setup"

# Or let AI generate the message
rune commit --smart
```

## Working with Branches

### 1. Create a Feature Branch

```bash
# Traditional syntax
rune branch feature/user-authentication
rune checkout feature/user-authentication

# Or natural language
rune "create a branch for user authentication"
```

### 2. Make Changes

```bash
echo "function login(user, password) { /* TODO */ }" >> src/auth.js
rune add src/auth.js
rune commit -m "Add authentication stub"
```

### 3. Switch Back to Main

```bash
rune checkout main
# Notice how src/auth.js is gone - it's only in the feature branch
```

### 4. Merge Your Feature

```bash
rune merge feature/user-authentication

# Or use AI-powered merge
rune merge --smart feature/user-authentication
```

## Adding a Remote Repository

### 1. Create Remote Repository

First, create a repository on GitHub, GitLab, or your preferred platform.

### 2. Add Remote

```bash
rune remote add origin https://github.com/yourusername/my-awesome-project.git
```

### 3. Push Your Code

```bash
rune push -u origin main
```

## Collaborative Workflow

### 1. Clone Existing Repository

```bash
rune clone https://github.com/teammate/shared-project.git
cd shared-project
```

### 2. Create Feature Branch

```bash
rune "create a branch for the navbar component"
```

### 3. Make and Push Changes

```bash
# Edit files...
rune add .
rune commit --smart
rune push origin feature/navbar-component
```

### 4. Pull Latest Changes

```bash
rune checkout main
rune pull origin main

# Or use natural language
rune "get the latest changes from the main branch"
```

## Handling Conflicts (The AI Way)

When conflicts occur:

### 1. Traditional Resolution

```bash
# Edit conflicted files manually
rune add resolved-files
rune commit
```

### 2. AI-Powered Resolution

```bash
# Let Rune's AI resolve simple conflicts
rune merge --smart

# For complex conflicts, get AI suggestions
rune suggest
```

### 3. Natural Language Help

```bash
rune "help me resolve these conflicts"
rune "show me what conflicts exist and suggest solutions"
```

## Best Practices

### Commit Messages

```bash
# Good manual messages
rune commit -m "Add user login validation"
rune commit -m "Fix memory leak in image processing"

# Or let AI generate them
rune commit --smart  # Analyzes changes and creates meaningful message
```

### Branching Strategy

```bash
# Feature branches
rune "create a branch for email notifications"

# Release branches
rune "create a release branch for version 1.2"

# Hotfix branches
rune "create a hotfix branch for the login bug"
```

### Regular Workflow

```bash
# Start of day
rune "get latest changes from main"

# During development
rune status
rune add .
rune commit --smart

# End of feature
rune push origin feature-branch-name
# Create pull request on GitHub/GitLab
```

## Troubleshooting

### Undo Last Commit

```bash
rune reset --soft HEAD~1  # Keep changes
rune reset --hard HEAD~1  # Discard changes

# Or natural language
rune "undo the last commit but keep my changes"
```

### View History

```bash
rune log --oneline
rune "show me what changed in the last week"
```

### Check Differences

```bash
rune diff
rune "show me what I've changed since the last commit"
```

## Next Steps

- [Learn advanced AI features](../features/ai-workflow.md)
- [Explore branching strategies](./branching-strategies.md)
- [Set up team collaboration](./team-collaboration.md)
