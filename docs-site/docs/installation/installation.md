---
sidebar_position: 1
---

# Quick Start

Get Rune up and running in under 5 minutes.

## Installation

### macOS
```bash
# Using Homebrew (recommended)
brew install rune-vcs/tap/rune

# Or download directly
curl -L https://github.com/rune-vcs/rune/releases/latest/download/rune-macos.tar.gz | tar xz
sudo mv rune /usr/local/bin/
```

### Linux
```bash
# Ubuntu/Debian
curl -L https://github.com/rune-vcs/rune/releases/latest/download/rune-linux.tar.gz | tar xz
sudo mv rune /usr/local/bin/

# Or using package manager
sudo apt install rune-vcs
```

### Windows
```powershell
# Using Scoop
scoop bucket add rune-vcs https://github.com/rune-vcs/scoop-bucket
scoop install rune

# Or download installer
# Visit: https://github.com/rune-vcs/rune/releases/latest
```

## Verify Installation
```bash
rune --version
```

## First Repository

### Initialize a new repository
```bash
mkdir my-project
cd my-project
rune init
```

### Clone an existing repository
```bash
rune clone https://github.com/user/repo.git
```

## Basic Workflow

### 1. Check status
```bash
rune status
# Or use natural language
rune "show me what's changed"
```

### 2. Add and commit changes
```bash
rune add .
rune commit -m "Initial commit"

# Or let AI generate the commit message
rune commit --smart
```

### 3. Create and switch branches
```bash
rune branch feature/new-login
rune switch feature/new-login

# Or use natural language
rune "create a branch for user authentication"
```

### 4. Push to remote
```bash
rune push origin main
```

## Next Steps

- [Learn basic commands](../guides/basic-commands.md)
- [Explore AI features](../features/ai-workflow.md)
- [Set up your first project](../guides/first-repository.md)
