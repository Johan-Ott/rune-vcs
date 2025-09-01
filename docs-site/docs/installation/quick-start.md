# 🚀 Quick Start Guide

Get Rune VCS up and running in under 5 minutes and experience the future of version control.

## Prerequisites

- **Operating System**: macOS, Linux, or Windows
- **Storage**: At least 50MB free space
- **Optional**: Git (for migration from existing repositories)

## Installation Options

### Option 1: Homebrew (Recommended for macOS) 🍺

The fastest way to install Rune VCS on macOS:

```bash
# Add the Rune VCS tap
brew tap CaptainOtto/rune-vcs

# Install Rune VCS
brew install rune

# Verify installation
rune --version
```

**Expected Output:**

```
rune 0.3.1-alpha.5
```

### Option 2: Direct Download 📦

Download the pre-built binary for your platform:

#### macOS (Apple Silicon)

```bash
# Download and extract
curl -L https://github.com/CaptainOtto/rune-vcs/releases/latest/download/rune-v0.3.1-alpha.5-aarch64-apple-darwin.tar.gz | tar xz

# Make executable and install
chmod +x rune
sudo mv rune /usr/local/bin/

# Verify installation
rune --version
```

#### macOS (Intel)

```bash
# Download and extract
curl -L https://github.com/CaptainOtto/rune-vcs/releases/latest/download/rune-v0.3.1-alpha.5-x86_64-apple-darwin.tar.gz | tar xz

# Make executable and install
chmod +x rune
sudo mv rune /usr/local/bin/
```

#### Linux (x86_64)

```bash
# Download and extract
wget https://github.com/CaptainOtto/rune-vcs/releases/latest/download/rune-v0.3.1-alpha.5-x86_64-unknown-linux-gnu.tar.gz
tar -xzf rune-v0.3.1-alpha.5-x86_64-unknown-linux-gnu.tar.gz

# Install to system
sudo mv rune /usr/local/bin/
```

#### Windows

```powershell
# Download from GitHub releases
# Extract the ZIP file
# Add rune.exe to your PATH
```

### Option 3: Build from Source 🛠️

For developers who want the latest features:

```bash
# Clone the repository
git clone https://github.com/CaptainOtto/rune-vcs.git
cd rune-vcs

# Build with Cargo (requires Rust)
cargo build --release

# Install the binary
sudo cp target/release/rune /usr/local/bin/
```

**Requirements for building:**

- Rust 1.70.0 or later
- Git
- 2GB free space for build artifacts

## First Steps

### 1. Verify Installation ✅

```bash
rune --version
rune --help
```

You should see the version information and a comprehensive list of available commands.

### 2. Initialize Your First Repository 🎉

```bash
# Create a new directory
mkdir my-rune-project
cd my-rune-project

# Initialize with Rune VCS
rune init

# Check status
rune status
```

**Expected Output:**

```
✅ Initialized empty Rune repository in /path/to/my-rune-project/.rune
On branch main
No changes to commit
```

### 3. Try Natural Language Commands 🧠

This is where Rune VCS shines! Try these revolutionary commands:

```bash
# Create a file
echo "Hello, Rune VCS!" > welcome.txt

# Use natural language to check status
rune "show me what changed"

# Stage and commit with natural language
rune "stage all changes"
rune "commit with message 'First commit'"
```

### 4. Experience AI Features 🤖

```bash
# Analyze your repository
rune binary analyze

# Get AI suggestions
rune suggest

# Try smart workflows
rune work  # Interactive workflow assistance
```

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# If you get permission denied errors
sudo chmod +x /usr/local/bin/rune

# Or install to user directory
mkdir -p ~/.local/bin
mv rune ~/.local/bin/
echo 'export PATH=$HOME/.local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Command Not Found

```bash
# Check if rune is in your PATH
which rune

# If not found, add to PATH
export PATH=/usr/local/bin:$PATH

# Make permanent
echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### macOS Security Warning

If you see "rune cannot be opened because it is from an unidentified developer":

```bash
# Allow the binary to run
sudo spctl --add /usr/local/bin/rune
sudo xattr -rd com.apple.quarantine /usr/local/bin/rune
```

### Getting Help

If you encounter issues:

1. **Check the documentation**: Browse through the guides section
2. **Search existing issues**: Visit our [GitHub Issues](https://github.com/CaptainOtto/rune-vcs/issues)
3. **Ask for help**: Join our [Discussions](https://github.com/CaptainOtto/rune-vcs/discussions)
4. **Report bugs**: Create a new issue with detailed information

## Next Steps

Now that you have Rune VCS installed:

### 🎓 **Learn the Basics**

- [Natural Language Commands](/docs/features/natural-language) - Learn the revolutionary interface
- [AI-Powered Operations](/docs/features/ai-commands) - Explore intelligent automation
- [Smart Workflows](/docs/features/smart-workflows) - Streamline your development process

### 📦 **Migrate Existing Projects**

- [From Git](/docs/guides/migration-from-git) - Seamlessly migrate Git repositories
- [From Perforce](/docs/guides/migration-from-p4v) - Move from P4V to Rune VCS
- [Team Migration](/docs/guides/team-migration) - Onboard your entire team

### 🏢 **Enterprise Setup**

- [Authentication](/docs/enterprise/authentication) - Set up user management
- [Security](/docs/enterprise/security) - Configure security policies
- [CI/CD Integration](/docs/enterprise/cicd) - Integrate with your pipeline

---

**🎉 Congratulations! You now have the world's most advanced version control system ready to use.**

Experience the future of development with natural language commands, AI-powered automation, and revolutionary performance. Welcome to Rune VCS! ✨
