---
sidebar_position: 2
---

# Configuration

Complete guide to configuring Rune for your workflow and team needs.

## Configuration Levels

### Global Configuration

Applied to all repositories for the current user:

```bash
rune config --global user.name "Your Name"
rune config --global user.email "your.email@example.com"
rune config --global ai.enabled true
```

### Repository Configuration

Applied only to the current repository:

```bash
rune config team.name "Frontend Team"
rune config hooks.pre-commit "npm test"
rune config merge.strategy smart
```

### View Configuration

```bash
# List all configuration
rune config --list

# Show specific value
rune config user.name

# Show origin of setting
rune config --show-origin user.name
```

## User Settings

### Identity

```bash
# Required for commits
rune config --global user.name "John Doe"
rune config --global user.email "john@company.com"

# Optional display settings
rune config --global user.displayname "John D."
rune config --global user.timezone "America/New_York"
```

### Editor and Tools

```bash
# Default editor for commit messages
rune config --global core.editor "code --wait"
rune config --global core.editor "vim"

# Diff and merge tools
rune config --global diff.tool "vscode"
rune config --global merge.tool "vscode"

# External tools for file types
rune config --global tool.images "photoshop"
rune config --global tool.models "blender"
```

## AI Configuration

### Core AI Settings

```bash
# Enable/disable AI features
rune config ai.enabled true
rune config ai.local-only false  # Use cloud AI when available

# AI model preferences
rune config ai.model "gpt-4"
rune config ai.fallback-model "gpt-3.5-turbo"
```

### Commit Message AI

```bash
# Automatic commit message generation
rune config ai.auto-commit-messages true
rune config ai.commit-style "conventional"  # conventional, descriptive, brief

# Message length and detail
rune config ai.commit-max-length 72
rune config ai.commit-detail-level "medium"  # brief, medium, detailed
```

### Conflict Resolution AI

```bash
# Automatic conflict resolution
rune config ai.auto-resolve "simple"  # none, simple, moderate, aggressive

# Resolution strategies
rune config ai.conflict-strategy "balanced"  # conservative, balanced, progressive
rune config ai.backup-conflicts true  # Create backups of conflicted files
```

### AI Learning and Feedback

```bash
# Learning from user behavior
rune config ai.learn-preferences true
rune config ai.feedback-enabled true

# Privacy settings
rune config ai.anonymize-data true
rune config ai.share-improvements false
```

## Branch Configuration

### Default Branch Settings

```bash
# Default branch name for new repositories
rune config init.defaultBranch "main"

# Branch naming conventions
rune config branch.naming-convention "feature/{issue-id}-{description}"
rune config branch.auto-prefix true  # Auto-add prefixes
```

### Branch Protection

```bash
# Protect main branch
rune config branch.main.protected true
rune config branch.main.require-review true
rune config branch.main.require-tests true

# Allow emergency overrides
rune config branch.main.emergency-override true
rune config branch.main.override-users "alice,bob"
```

### Merge Settings

```bash
# Default merge strategy
rune config merge.strategy "smart"  # smart, traditional, fast-forward

# Merge commit messages
rune config merge.auto-message true
rune config merge.message-template "Merge {branch} into {target}"
```

## Performance Configuration

### Network Settings

```bash
# Optimize for slow connections
rune config network.compression true
rune config network.parallel-transfers 4
rune config network.timeout 30

# Binary file handling
rune config network.binary-streaming true
rune config network.binary-threshold "10MB"
```

### Caching

```bash
# Local cache settings
rune config cache.enabled true
rune config cache.size "5GB"
rune config cache.strategy "lru"  # lru, mru, size-based

# Binary cache
rune config cache.binary.enabled true
rune config cache.binary.size "10GB"
rune config cache.binary.auto-cleanup true
```

### Repository Optimization

```bash
# Automatic garbage collection
rune config gc.auto true
rune config gc.aggressiveness "medium"  # low, medium, high
rune config gc.schedule "weekly"

# Large file handling
rune config lfs.enabled true
rune config lfs.threshold "100MB"
rune config lfs.compression true
```

## Security Configuration

### Authentication

```bash
# Credential storage
rune config credential.helper "store"  # store, cache, manager
rune config credential.timeout 3600

# SSH settings
rune config ssh.key "~/.ssh/id_rune"
rune config ssh.verify-host true
```

### Security Policies

```bash
# Prevent sensitive data commits
rune config security.scan-commits true
rune config security.block-secrets true
rune config security.patterns-file ".rune-security-patterns"

# Audit settings
rune config audit.enabled true
rune config audit.retention "1 year"
rune config audit.level "detailed"  # basic, detailed, verbose
```

### Encryption

```bash
# Repository encryption
rune config encryption.enabled false
rune config encryption.algorithm "aes-256"
rune config encryption.key-file "~/.rune/encryption.key"

# Communication encryption
rune config network.tls-verify true
rune config network.tls-version "1.3"
```

## Team Configuration

### Team Settings

```bash
# Team identification
rune config team.name "Frontend Development"
rune config team.lead "alice@company.com"
rune config team.timezone "UTC"

# Collaboration settings
rune config team.notifications true
rune config team.auto-assign-reviewers true
rune config team.parallel-work-detection true
```

### Workflow Configuration

```bash
# Review requirements
rune config workflow.require-review true
rune config workflow.min-reviewers 2
rune config workflow.block-self-review true

# CI/CD integration
rune config ci.provider "github-actions"
rune config ci.trigger-on-push true
rune config ci.required-checks "tests,lint,security"
```

### Communication

```bash
# Notification channels
rune config notify.slack.webhook "https://hooks.slack.com/..."
rune config notify.email.enabled true
rune config notify.teams.webhook "https://outlook.office.com/..."

# Message formatting
rune config notify.format "detailed"  # brief, detailed, custom
rune config notify.include-diff false
```

## Development Configuration

### File Handling

```bash
# File type associations
rune config filetype.*.js "javascript"
rune config filetype.*.py "python"
rune config filetype.*.md "markdown"

# Binary file handling
rune config binary.images.compression true
rune config binary.models.analysis true
rune config binary.documents.text-extraction true
```

### Hooks and Automation

```bash
# Git hooks
rune config hooks.pre-commit "npm test"
rune config hooks.pre-push "npm run lint"
rune config hooks.post-merge "npm install"

# Automatic actions
rune config auto.stage-on-save false
rune config auto.commit-on-build false
rune config auto.push-on-commit false
```

### Development Tools

```bash
# IDE integration
rune config ide.vscode.enabled true
rune config ide.intellij.enabled true
rune config ide.vim.enabled false

# Language servers
rune config lsp.typescript.enabled true
rune config lsp.python.enabled true
rune config lsp.rust.enabled false
```

## Advanced Configuration

### Custom Workflows

```bash
# Define custom workflows
rune config workflow.feature-complete "test && lint && review"
rune config workflow.hotfix "fast-test && immediate-review && merge"
rune config workflow.release "full-test && docs && tag"

# Workflow triggers
rune config trigger.feature-complete "branch.prefix == 'feature/'"
rune config trigger.hotfix "branch.prefix == 'hotfix/'"
```

### Plugins and Extensions

```bash
# Enable community plugins
rune config plugins.enabled true
rune config plugins.auto-update false
rune config plugins.whitelist "security,performance,collaboration"

# Custom commands
rune config alias.unstage "reset HEAD"
rune config alias.visual "!gitk"
rune config alias.praise "blame"
```

### Experimental Features

```bash
# Beta features
rune config experimental.ai-v2 false
rune config experimental.quantum-diff false
rune config experimental.blockchain-history false

# Feature flags
rune config features.natural-language-v2 true
rune config features.advanced-binary-diff true
rune config features.predictive-merge true
```

## Configuration Templates

### Team Templates

```bash
# Apply team configuration template
rune config --template team-frontend
rune config --template team-backend
rune config --template team-devops

# Create custom template
rune config --save-template my-team-config
```

### Project Templates

```bash
# Project-specific configurations
rune config --template web-app
rune config --template mobile-app
rune config --template game-development
rune config --template open-source
```

## Configuration Management

### Backup and Restore

```bash
# Backup configuration
rune config --backup config-backup-2024-01-15.json

# Restore configuration
rune config --restore config-backup-2024-01-15.json

# Share configuration
rune config --export team-config.json
rune config --import team-config.json
```

### Version Control

```bash
# Track configuration changes
rune config --history
rune config --diff

# Reset to defaults
rune config --reset
rune config --reset ai.*  # Reset only AI settings
```

## Troubleshooting Configuration

### Common Issues

```bash
# Invalid configuration values
rune config --validate
rune config --fix-invalid

# Permission issues
rune config --check-permissions
rune config --fix-permissions

# Conflicting settings
rune config --check-conflicts
rune config --resolve-conflicts
```

### Debugging

```bash
# Debug configuration loading
rune config --debug
rune config --trace

# Show effective configuration
rune config --effective
rune config --source-map
```

## Configuration Reference

### File Locations

- Global: `~/.runeconfig`
- Repository: `.rune/config`
- System: `/etc/rune/config`

### Environment Variables

- `RUNE_CONFIG_HOME` - Override config directory
- `RUNE_AI_ENABLED` - Override AI settings
- `RUNE_DEBUG` - Enable debug mode

### Configuration Precedence

1. Command line options
2. Environment variables
3. Repository configuration
4. Global configuration
5. System configuration
6. Default values
