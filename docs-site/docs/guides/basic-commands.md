---
sidebar_position: 1
---

# Basic Commands

Learn the essential Rune commands to manage your repositories effectively.

## Repository Operations

### Initialize Repository

```bash
# Create new repository
rune init

# Initialize with specific branch name
rune init --branch main

# Initialize bare repository
rune init --bare
```

### Clone Repository

```bash
# Clone from URL
rune clone https://github.com/user/repo.git

# Clone to specific directory
rune clone https://github.com/user/repo.git my-project

# Clone specific branch
rune clone --branch develop https://github.com/user/repo.git
```

## File Operations

### Check Status

```bash
# Traditional syntax
rune status

# Natural language
rune "show me what changed"
rune "what files are modified?"
```

### Add Files

```bash
# Add specific file
rune add filename.txt

# Add all changes
rune add .

# Add with pattern
rune add "*.js"

# Natural language
rune "stage all JavaScript files"
```

### Commit Changes

```bash
# Commit with message
rune commit -m "Add user authentication"

# Smart commit (AI generates message)
rune commit --smart

# Commit all changes
rune commit -am "Fix login bug"

# Natural language
rune "commit these changes with a good message"
```

## Branch Operations

### Create Branches

```bash
# Create new branch
rune branch feature/login

# Create and switch to branch
rune checkout -b feature/login

# Natural language
rune "create a branch for user authentication"
```

### Switch Branches

```bash
# Switch to existing branch
rune checkout main
rune switch main

# Switch to previous branch
rune checkout -

# Natural language
rune "switch to the main branch"
```

### Merge Branches

```bash
# Merge branch
rune merge feature/login

# Merge with AI conflict resolution
rune merge --smart feature/login

# Natural language
rune "merge the login feature intelligently"
```

## Remote Operations

### Add Remotes

```bash
# Add origin remote
rune remote add origin https://github.com/user/repo.git

# List remotes
rune remote -v
```

### Push Changes

```bash
# Push to origin/main
rune push origin main

# Push all branches
rune push --all

# Push with upstream
rune push -u origin feature/login
```

### Pull Changes

```bash
# Pull from origin
rune pull origin main

# Pull with rebase
rune pull --rebase

# Smart pull (AI handles conflicts)
rune pull --smart
```

## History and Logs

### View History

```bash
# Show commit history
rune log

# Show one-line history
rune log --oneline

# Show graph
rune log --graph

# Natural language
rune "show me the last 10 commits"
```

### View Differences

```bash
# Show working directory changes
rune diff

# Show staged changes
rune diff --staged

# Compare branches
rune diff main..feature/login

# Natural language
rune "show me what changed between main and this branch"
```

## AI-Powered Commands

### Natural Language Interface

```bash
# Any operation in plain English
rune "undo the last commit"
rune "show me all files changed this week"
rune "create a release branch from main"
rune "resolve conflicts and commit"
```

### Smart Operations

```bash
# AI-generated commit messages
rune commit --smart

# Intelligent conflict resolution
rune merge --smart

# Context-aware suggestions
rune suggest

# Predict potential conflicts
rune predict-conflicts
```

## Configuration

### User Settings

```bash
# Set user name and email
rune config user.name "Your Name"
rune config user.email "your.email@example.com"

# View configuration
rune config --list
```

### Repository Settings

```bash
# Set default branch
rune config init.defaultBranch main

# Configure AI features
rune config ai.enabled true
rune config ai.auto-resolve simple
```
