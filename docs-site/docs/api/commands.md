---
sidebar_position: 1
---

# Command Reference

Complete reference for all Rune commands and their options.

## Repository Commands

### `rune init`
Initialize a new repository

```bash
rune init [directory]
```

**Options:**
- `--bare` - Create a bare repository
- `--branch <name>` - Set initial branch name
- `--template <path>` - Use repository template

**Examples:**
```bash
rune init
rune init my-project
rune init --branch main
rune init --bare server-repo.git
```

### `rune clone`
Clone a repository

```bash
rune clone <url> [directory]
```

**Options:**
- `--branch <name>` - Clone specific branch
- `--depth <number>` - Shallow clone with limited history
- `--shallow` - Shallow clone (depth=1)
- `--no-binary` - Skip binary files initially

**Examples:**
```bash
rune clone https://github.com/user/repo.git
rune clone --branch develop https://github.com/user/repo.git
rune clone --shallow https://github.com/user/repo.git local-copy
```

## File Commands

### `rune add`
Stage changes for commit

```bash
rune add <pathspec>...
```

**Options:**
- `-A, --all` - Stage all changes
- `-u, --update` - Stage modified and deleted files
- `-p, --patch` - Interactive staging
- `--dry-run` - Show what would be added

**Examples:**
```bash
rune add file.txt
rune add .
rune add -A
rune add src/*.js
```

### `rune status`
Show working tree status

```bash
rune status
```

**Options:**
- `-s, --short` - Short format
- `-b, --branch` - Show branch information
- `--porcelain` - Machine-readable format

**Examples:**
```bash
rune status
rune status -s
rune "show me what changed"
```

### `rune diff`
Show differences

```bash
rune diff [options] [<commit>] [--] [<path>...]
```

**Options:**
- `--staged` - Show staged changes
- `--name-only` - Show only filenames
- `--stat` - Show statistics
- `--smart` - AI-enhanced diff analysis

**Examples:**
```bash
rune diff
rune diff --staged
rune diff main..feature
rune diff --smart images/logo.png
```

## Commit Commands

### `rune commit`
Record changes to repository

```bash
rune commit [options]
```

**Options:**
- `-m <message>` - Commit message
- `-a, --all` - Stage all modified files
- `--amend` - Amend previous commit
- `--smart` - AI-generated commit message
- `--edit` - Edit AI-generated message

**Examples:**
```bash
rune commit -m "Add user authentication"
rune commit -am "Fix login bug"
rune commit --smart
rune commit --smart --edit
```

### `rune reset`
Reset current HEAD

```bash
rune reset [options] [<commit>]
```

**Options:**
- `--soft` - Keep changes in working directory
- `--mixed` - Keep changes unstaged (default)
- `--hard` - Discard all changes

**Examples:**
```bash
rune reset HEAD~1
rune reset --soft HEAD~1
rune reset --hard origin/main
```

## Branch Commands

### `rune branch`
List, create, or delete branches

```bash
rune branch [options] [<branchname>]
```

**Options:**
- `-a, --all` - List all branches
- `-r, --remotes` - List remote branches
- `-d, --delete` - Delete branch
- `-D, --delete --force` - Force delete
- `-m, --move` - Rename branch

**Examples:**
```bash
rune branch
rune branch feature/auth
rune branch -d old-feature
rune "create a branch for user authentication"
```

### `rune checkout`
Switch branches or restore files

```bash
rune checkout [options] <branch>
rune checkout [options] [<branch>] -- <file>...
```

**Options:**
- `-b` - Create and switch to new branch
- `-B` - Create or reset and switch to branch
- `--track` - Set up tracking

**Examples:**
```bash
rune checkout main
rune checkout -b feature/auth
rune checkout -- file.txt
rune "switch to the main branch"
```

### `rune switch`
Switch branches (modern alternative to checkout)

```bash
rune switch [options] <branch>
```

**Options:**
- `-c, --create` - Create new branch
- `-C, --force-create` - Create or reset branch
- `--guess` - Try to match remote branch

**Examples:**
```bash
rune switch main
rune switch -c feature/auth
rune switch --guess feature
```

### `rune merge`
Join development histories

```bash
rune merge [options] <commit>...
```

**Options:**
- `--no-ff` - Always create merge commit
- `--squash` - Squash commits
- `--abort` - Abort merge
- `--smart` - AI-powered merge
- `--strategy <strategy>` - Merge strategy

**Examples:**
```bash
rune merge feature/auth
rune merge --smart feature/auth
rune merge --no-ff develop
rune "merge the authentication feature"
```

## Remote Commands

### `rune remote`
Manage remote repositories

```bash
rune remote [subcommand] [options]
```

**Subcommands:**
- `add <name> <url>` - Add remote
- `remove <name>` - Remove remote
- `rename <old> <new>` - Rename remote
- `show <name>` - Show remote info
- `-v, --verbose` - List remotes

**Examples:**
```bash
rune remote add origin https://github.com/user/repo.git
rune remote -v
rune remote show origin
```

### `rune fetch`
Download objects and refs from remote

```bash
rune fetch [options] [<repository> [<refspec>...]]
```

**Options:**
- `--all` - Fetch all remotes
- `--prune` - Remove deleted remote branches
- `--tags` - Fetch tags

**Examples:**
```bash
rune fetch
rune fetch origin
rune fetch --all --prune
```

### `rune pull`
Fetch and integrate with another repository

```bash
rune pull [options] [<repository> [<refspec>...]]
```

**Options:**
- `--rebase` - Rebase instead of merge
- `--no-rebase` - Merge instead of rebase
- `--smart` - AI-powered pull

**Examples:**
```bash
rune pull
rune pull origin main
rune pull --rebase
rune pull --smart
```

### `rune push`
Upload changes to remote repository

```bash
rune push [options] [<repository> [<refspec>...]]
```

**Options:**
- `-u, --set-upstream` - Set upstream branch
- `--all` - Push all branches
- `--tags` - Push tags
- `--force` - Force push (dangerous)
- `--compress-binaries` - Compress binary files

**Examples:**
```bash
rune push
rune push origin main
rune push -u origin feature/auth
rune push --tags
```

## History Commands

### `rune log`
Show commit logs

```bash
rune log [options] [<revision range>] [[--] <path>...]
```

**Options:**
- `--oneline` - Condensed format
- `--graph` - Show graph
- `--stat` - Show statistics
- `-n <number>` - Limit number of commits
- `--since <date>` - Show commits since date
- `--author <pattern>` - Filter by author

**Examples:**
```bash
rune log
rune log --oneline --graph
rune log -n 10
rune log --since="2 weeks ago"
rune "show me the last 10 commits"
```

### `rune show`
Show various types of objects

```bash
rune show [options] <object>...
```

**Options:**
- `--stat` - Show statistics
- `--name-only` - Show only filenames
- `--smart` - AI-enhanced analysis

**Examples:**
```bash
rune show HEAD
rune show --stat abc123
rune show --smart HEAD
```

## AI Commands

### `rune suggest`
Get AI suggestions for next actions

```bash
rune suggest [options]
```

**Options:**
- `--verbose` - Detailed suggestions
- `--context <area>` - Focus on specific area

**Examples:**
```bash
rune suggest
rune suggest --verbose
rune suggest --context branching
rune "what should I do next?"
```

### `rune predict-conflicts`
Predict merge conflicts before they happen

```bash
rune predict-conflicts [branch]
```

**Options:**
- `--detailed` - Show detailed analysis
- `--suggestions` - Include resolution suggestions

**Examples:**
```bash
rune predict-conflicts feature/auth
rune predict-conflicts --detailed main
rune "will this branch conflict with main?"
```

### `rune analyze`
AI analysis of repository or files

```bash
rune analyze [target]
```

**Options:**
- `--binary` - Focus on binary files
- `--performance` - Performance analysis
- `--security` - Security analysis

**Examples:**
```bash
rune analyze
rune analyze --binary
rune analyze images/logo.png
rune analyze --performance
```

## Configuration Commands

### `rune config`
Get and set repository or global options

```bash
rune config [options] <name> [<value>]
```

**Options:**
- `--global` - Use global config
- `--local` - Use repository config
- `--list` - List all configuration
- `--unset` - Remove configuration

**Examples:**
```bash
rune config user.name "John Doe"
rune config --global user.email "john@example.com"
rune config --list
rune config ai.enabled true
```

## Utility Commands

### `rune stash`
Temporarily store changes

```bash
rune stash [subcommand] [options]
```

**Subcommands:**
- `push [<message>]` - Save changes
- `pop` - Apply and remove stash
- `apply` - Apply stash
- `list` - List stashes
- `drop` - Delete stash

**Examples:**
```bash
rune stash
rune stash push -m "Work in progress"
rune stash pop
rune stash list
```

### `rune tag`
Create, list, delete tags

```bash
rune tag [options] [<tagname>] [<commit>]
```

**Options:**
- `-a, --annotate` - Create annotated tag
- `-m <message>` - Tag message
- `-d, --delete` - Delete tag
- `-l, --list` - List tags

**Examples:**
```bash
rune tag v1.0.0
rune tag -a v1.0.0 -m "Release version 1.0.0"
rune tag -l
rune tag -d old-tag
```

### `rune clean`
Remove untracked files

```bash
rune clean [options]
```

**Options:**
- `-f, --force` - Force removal
- `-d` - Remove directories
- `-n, --dry-run` - Show what would be removed
- `-x` - Remove ignored files too

**Examples:**
```bash
rune clean -n
rune clean -fd
rune clean -fx
```

## Natural Language Interface

### General Syntax
```bash
rune "<natural language command>"
```

### Common Patterns
```bash
# Repository status
rune "show me what changed"
rune "what files are modified?"
rune "is everything committed?"

# Branching
rune "create a branch for user authentication"
rune "switch to the main branch"
rune "delete merged branches"

# Committing
rune "save all my changes"
rune "commit with a good message"
rune "undo the last commit"

# Merging
rune "merge the feature branch"
rune "resolve conflicts intelligently"
rune "will this branch conflict?"

# History
rune "show me what changed this week"
rune "who worked on this file?"
rune "find the commit that broke tests"

# Remote operations
rune "get the latest changes"
rune "push my work to the server"
rune "sync with the team"
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Command line usage error
- `3` - Repository not found
- `4` - Merge conflict
- `5` - Authentication error
- `128` - Fatal error

## Environment Variables

- `RUNE_CONFIG_HOME` - Config directory location
- `RUNE_AI_ENABLED` - Enable/disable AI features
- `RUNE_EDITOR` - Default editor for commit messages
- `RUNE_PAGER` - Default pager for output
- `RUNE_LOG_LEVEL` - Log level (debug, info, warn, error)
