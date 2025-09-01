---
sidebar_position: 1
---

# Troubleshooting

Common issues and solutions when using Rune.

## Installation Issues

### Command Not Found

```bash
$ rune --version
rune: command not found
```

**Solutions:**

```bash
# Check if installed
which rune

# Reinstall using Homebrew (macOS)
brew uninstall rune
brew install rune-vcs/tap/rune

# Check PATH
echo $PATH
# Add to ~/.bashrc or ~/.zshrc if needed
export PATH="/usr/local/bin:$PATH"
```

### Permission Denied

```bash
$ rune init
Permission denied
```

**Solutions:**

```bash
# Fix permissions
sudo chown -R $(whoami) ~/.rune
chmod 755 ~/.rune

# Or reinstall without sudo
curl -L https://github.com/rune-vcs/rune/releases/latest/download/rune-install.sh | sh
```

## Repository Issues

### Repository Not Found

```bash
$ rune status
fatal: not a rune repository
```

**Solutions:**

```bash
# Initialize repository
rune init

# Or check if you're in the right directory
pwd
ls -la  # Look for .rune/ directory

# Navigate to repository root
cd path/to/your/project
```

### Corrupted Repository

```bash
$ rune status
error: repository appears to be corrupted
```

**Solutions:**

```bash
# Verify repository integrity
rune verify

# Attempt automatic repair
rune repair

# Manual backup and restore
rune backup --create emergency-backup
rune restore --from emergency-backup

# Last resort: clone fresh copy
cd ..
rune clone <remote-url> project-recovered
```

## AI Features Issues

### AI Not Working

```bash
$ rune commit --smart
AI features are not available
```

**Solutions:**

```bash
# Check AI configuration
rune config ai.enabled
rune config --list | grep ai

# Enable AI features
rune config ai.enabled true

# Check network connectivity (for cloud AI)
rune config ai.local-only false
rune ai status

# Update AI models
rune ai update
```

### Poor AI Suggestions

```bash
$ rune commit --smart
# Generates: "Update files"
```

**Solutions:**

```bash
# Provide more context
rune add . --verbose
rune commit --smart --detailed

# Reset AI learning
rune config ai.reset-learning

# Provide feedback
rune feedback bad "commit message too generic"

# Configure AI style
rune config ai.commit-style descriptive
```

## Network and Remote Issues

### Connection Timeout

```bash
$ rune push origin main
Connection timeout
```

**Solutions:**

```bash
# Check network settings
rune config network.timeout 60
rune config network.retry-attempts 3

# Use compression for slow connections
rune config network.compression true

# Check remote URL
rune remote -v
rune remote set-url origin <correct-url>
```

### Authentication Failed

```bash
$ rune push origin main
Authentication failed
```

**Solutions:**

```bash
# Check credentials
rune config credential.helper store
git config --global credential.helper store

# For SSH
ssh-add ~/.ssh/id_rsa
ssh -T git@github.com

# For HTTPS with tokens
rune config credential.username your-username
# Then enter token as password
```

### Large File Issues

```bash
$ rune push origin main
error: file too large (2.1 GB)
```

**Solutions:**

```bash
# Enable large file support
rune config lfs.enabled true
rune config lfs.threshold "100MB"

# Migrate existing large files
rune lfs migrate

# Use binary optimization
rune config binary.compression true
```

## Performance Issues

### Slow Operations

```bash
$ rune status
# Takes 30+ seconds
```

**Solutions:**

```bash
# Enable caching
rune config cache.enabled true
rune config cache.size "5GB"

# Optimize repository
rune gc --aggressive
rune optimize

# Check repository size
rune analyze storage
# If too large, consider cleanup:
rune clean --large-files
```

### High Memory Usage

```bash
$ rune diff
# Uses excessive RAM
```

**Solutions:**

```bash
# Limit memory usage
rune config performance.max-memory "2GB"
rune config performance.streaming true

# For large repositories
rune config diff.algorithm minimal
rune config diff.max-files 100
```

## Merge and Conflict Issues

### Merge Conflicts

```bash
$ rune merge feature/auth
CONFLICT (content): Merge conflict in src/auth.js
```

**Solutions:**

```bash
# Use AI resolution
rune merge --smart feature/auth

# Get conflict help
rune "help me resolve these conflicts"
rune suggest --context conflicts

# Manual resolution
rune diff --conflicts
# Edit files, then:
rune add .
rune commit
```

### Complex Conflicts

```bash
$ rune merge --smart feature/auth
Unable to auto-resolve complex conflicts
```

**Solutions:**

```bash
# Get detailed analysis
rune analyze conflicts
rune predict-conflicts --detailed

# Use interactive resolution
rune merge --interactive feature/auth

# External merge tool
rune config merge.tool vscode
rune mergetool
```

## File and Content Issues

### Binary File Problems

```bash
$ rune diff image.png
Binary file changed (no details)
```

**Solutions:**

```bash
# Enable smart binary analysis
rune config binary.analysis true
rune diff --smart image.png

# Check supported formats
rune info --binary-formats

# Force text analysis (for text-like binaries)
rune diff --force-text config.bin
```

### Encoding Issues

```bash
$ rune diff source.py
warning: invalid UTF-8 sequence
```

**Solutions:**

```bash
# Check file encoding
file source.py
rune info encoding source.py

# Convert encoding
iconv -f ISO-8859-1 -t UTF-8 source.py > source_utf8.py

# Configure encoding handling
rune config core.encoding utf-8
rune config core.autocrlf input
```

## Configuration Issues

### Invalid Configuration

```bash
$ rune status
error: invalid configuration value
```

**Solutions:**

```bash
# Validate configuration
rune config --validate

# Fix invalid values
rune config --fix-invalid

# Reset to defaults
rune config --reset

# Check specific setting
rune config --check ai.enabled
```

### Missing Configuration

```bash
$ rune commit
error: user.name not set
```

**Solutions:**

```bash
# Set required configuration
rune config user.name "Your Name"
rune config user.email "your.email@example.com"

# Use global settings
rune config --global user.name "Your Name"
rune config --global user.email "your.email@example.com"
```

## Team Collaboration Issues

### Sync Problems

```bash
$ rune pull
Your branch has diverged from origin/main
```

**Solutions:**

```bash
# Smart sync
rune pull --smart

# Rebase instead of merge
rune pull --rebase

# Manual resolution
rune fetch origin
rune merge origin/main
# Or: rune rebase origin/main
```

### Access Denied

```bash
$ rune push origin main
Permission denied (protected branch)
```

**Solutions:**

```bash
# Check branch protection
rune config branch.main.protected

# Use feature branch workflow
rune checkout -b feature/my-changes
rune push origin feature/my-changes
# Then create pull request

# Emergency override (if authorized)
rune push --emergency-override
```

## Recovery Procedures

### Lost Commits

```bash
# Accidentally deleted commits
```

**Solutions:**

```bash
# Find lost commits
rune reflog
rune log --all --graph --oneline

# Recover specific commit
rune checkout <commit-hash>
rune checkout -b recovery-branch

# Recover deleted branch
rune branch recovery-branch <commit-hash>
```

### Corrupted Working Directory

```bash
# Working directory in bad state
```

**Solutions:**

```bash
# Save current work
rune stash push "emergency backup"

# Reset working directory
rune reset --hard HEAD

# Or restore from specific commit
rune restore --staged .
rune restore .

# Restore from stash
rune stash pop
```

### Emergency Backup

```bash
# Repository appears corrupted
```

**Solutions:**

```bash
# Create emergency backup
rune backup --emergency backup-$(date +%Y%m%d)

# Clone fresh copy
rune clone <remote-url> project-backup

# Verify backup integrity
rune verify --backup backup-$(date +%Y%m%d)
```

## Diagnostic Commands

### Health Check

```bash
# Complete system check
rune doctor

# Specific checks
rune doctor --ai
rune doctor --network
rune doctor --repository
```

### Debug Information

```bash
# Generate debug report
rune debug --report debug-info.txt

# Verbose logging
RUNE_DEBUG=1 rune status

# Performance profiling
rune profile --operation merge
```

### System Information

```bash
# System info
rune version --verbose
rune info --system
rune info --configuration

# Repository stats
rune stats
rune analyze --comprehensive
```

## Getting Help

### Built-in Help

```bash
# Command help
rune help
rune help commit
rune help config

# Natural language help
rune "how do I undo a commit?"
rune "help with merge conflicts"
```

### Community Support

- GitHub Issues: https://github.com/rune-vcs/rune/issues
- Discord Community: https://discord.gg/rune-vcs
- Stack Overflow: Tag `rune-vcs`
- Documentation: https://docs.rune-vcs.com

### Professional Support

- Enterprise Support: support@rune-vcs.com
- Training: training@rune-vcs.com
- Consulting: consulting@rune-vcs.com

## Preventive Measures

### Regular Maintenance

```bash
# Weekly maintenance
rune gc
rune verify
rune optimize

# Monthly cleanup
rune clean --merged-branches
rune clean --stale-remotes
rune backup --rotate
```

### Monitoring

```bash
# Set up monitoring
rune config monitoring.enabled true
rune config monitoring.alerts true

# Health checks
rune cron add "0 0 * * * rune doctor --quiet"
```

### Backup Strategy

```bash
# Automated backups
rune config backup.auto true
rune config backup.schedule daily
rune config backup.retention 30
```

Remember: Most issues can be resolved with Rune's built-in AI assistance. Try asking: `rune "help me fix this problem"` for context-aware troubleshooting.
