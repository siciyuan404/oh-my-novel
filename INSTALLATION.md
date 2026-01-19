# Installation Guide for oh-my-novel

Complete guide to installing and configuring the oh-my-novel plugin for OpenCode.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Post-Installation Configuration](#post-installation-configuration)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Uninstallation](#uninstallation)

---

## Prerequisites

Before installing oh-my-novel, ensure you have the following:

### Required Tools

| Tool         | Minimum Version | Installation                          | Check Command        |
| ------------ | --------------- | ------------------------------------- | -------------------- |
| **Bun**      | Latest          | https://bun.sh                        | `bun --version`      |
| **OpenCode** | 1.0.150+        | https://github.com/sst/opencode       | `opencode --version` |
| **Node.js**  | 18+             | https://nodejs.org                    | `node --version`     |
| **Git**      | Any             | https://git-scm.com                   | `git --version`      |
| **ripgrep**  | Any             | https://github.com/BurntSushi/ripgrep | `rg --version`       |

### Installation Commands

```bash
# Install Bun (Windows)
powershell -c "irm bun.sh/install.ps1 | iex"

# Install OpenCode
bun install -g opencode

# Install ripgrep (Windows via Chocolatey)
choco install ripgrep
# Or download from GitHub releases
```

### Verify Prerequisites

```bash
# Check all required tools
bun --version
opencode --version
node --version
git --version
rg --version
```

---

## Installation Methods

There are three ways to install oh-my-novel:

### Method 1: Global Installation (Recommended)

**Best for:** Users who want to use oh-my-novel in multiple projects.

```bash
# Install globally (for CLI tools)
bun install -g oh-my-novel

# Or run via bunx if package is published
bunx oh-my-novel install
```

### Method 2: Local Installation

**Best for:** Project-specific usage or development.

```bash
# Clone repository
git clone https://github.com/siciyuan404/oh-my-novel.git
cd oh-my-novel

# Install dependencies
bun install

# Build plugin
bun run build

# Run interactive installer
bunx oh-my-novel install
```

### Method 3: Local Development

**Best for:** Development and testing with latest changes.

```bash
# Run installer directly from local build
node dist/cli/installer.js
```

### Method 3: Direct from GitHub (No Clone)

**Best for:** Quick installation without cloning the repository.

```bash
# Run directly from GitHub
bunx github:mxrain/oh-my-novel install
```

---

## Installation Wizard

The interactive installation wizard guides you through the setup process:

```bash
bunx oh-my-novel install
```

### Installation Wizard Steps

#### Step 1: Dependency Check

The wizard automatically checks:

- OpenCode installation
- OpenCode version (must be >= 1.0.150)
- Bun runtime
- Node.js version
- Git installation
- ripgrep installation

```
✓ OpenCode detected: 1.0.150
✓ Bun detected: 1.0.0
✓ Node.js detected: 18.17.0
✓ Git detected: 2.42.0
✓ ripgrep detected: 14.1.0
```

#### Step 2: Configuration File Creation

The wizard creates configuration files:

1. **Project-level configuration** (highest priority):
   - `.opencode/oh-my-novel.jsonc` (recommended, supports comments)
   - `.opencode/oh-my-novel.json`

2. **User-level configuration**:
   - `~/.config/opencode/oh-my-novel.jsonc`
   - `~/.config/opencode/oh-my-novel.json`

#### Step 3: Interactive Configuration

The wizard prompts you for:

```bash
? Novel default genre: fantasy
? Default chapter length: 3000
? Enable auto-save: Yes
? Long-running batch size: 10
? Max retries: 3
```

#### Step 4: OpenCode Integration

The wizard adds the plugin to OpenCode configuration:

```json
{
  "plugin": ["oh-my-novel"]
}
```

### Non-Interactive Installation

Skip the wizard prompts:

```bash
# Non-interactive mode
bunx oh-my-novel install --no-tui

# Skip dependency checks
bunx oh-my-novel install --skip-deps
```

---

## Post-Installation Configuration

### Manual Configuration

If you skipped the wizard or need to customize settings later:

#### 1. Create Configuration File

Create `.opencode/oh-my-novel.jsonc` in your project directory:

```jsonc
{
  "$schema": "./oh-my-novel.schema.json",
  // Novel settings
  "novelSettings": {
    "defaultGenre": "fantasy",
    "chapterLength": 3000,
    "autoSave": true,
  },
  // Agent overrides
  "agents": {
    "novelist": {
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.7,
      "permission": {
        "edit": "ask",
        "bash": {
          "git": "allow",
          "rm": "deny",
        },
      },
    },
    "plot-designer": {
      "model": "openai/gpt-5.2",
      "temperature": 0.3,
    },
    "character-developer": {
      "model": "openai/gpt-5.2",
      "temperature": 0.4,
    },
    "world-builder": {
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.5,
    },
    "editor": {
      "model": "google/gemini-3-pro-preview",
      "temperature": 0.3,
    },
  },
  // Long running settings
  "longRunning": {
    "maxRetries": 5,
    "retryDelay": 5000,
    "batchSize": 10,
    "checkpointInterval": 1,
  },
  // Background task settings
  "background_task": {
    "concurrency": 3,
    "timeout": 300000,
  },
}
```

#### 2. Configure OpenCode

Add the plugin to `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["oh-my-novel"],
  "model": "anthropic/claude-opus-4-5",
  "temperature": 0.7
}
```

#### 3. Directory Structure

The plugin automatically creates the following directories:

```
./novels/                    # Novel projects
./.oh-my-novel-state/        # Generation state storage
```

### Configuration Priority

Configuration files are loaded in this order (highest to lowest priority):

1. `.opencode/oh-my-novel.jsonc` (project-level, supports comments)
2. `.opencode/oh-my-novel.json` (project-level)
3. `~/.config/opencode/oh-my-novel.jsonc` (user-level, supports comments)
4. `~/.config/opencode/oh-my-novel.json` (user-level)

Higher priority files override lower priority settings.

---

## Verification

### Run Health Check

After installation, run the doctor command:

```bash
bunx oh-my-novel doctor
```

### Expected Output

```
=== OpenCode Version Check ===
✓ OpenCode version: 1.0.150 (>= 1.0.150 required)

=== Dependency Validation ===
✓ Bun: 1.0.0
✓ Node.js: 18.17.0
✓ Git: 2.42.0
✓ ripgrep: 14.1.0

=== Configuration Validation ===
✓ Configuration file found: .opencode/oh-my-novel.jsonc
✓ Configuration is valid

=== Directory Checks ===
✓ Novels directory exists: ./novels/
✓ State directory exists: ./.oh-my-novel-state/

=== Disk Space Check ===
✓ Sufficient disk space available: 50GB free

=== Agent Configuration Validation ===
✓ All agents configured correctly
✓ Permissions validated

All checks passed! ✓
```

### Test Basic Functionality

Test that the plugin is working correctly:

```bash
# Start OpenCode
opencode

# In OpenCode, test a simple command:
> Create a fantasy novel about dragons
```

Expected response:

```
Novelist: Creating a fantasy novel about dragons...
- Plot Designer: Creating story outline...
- Character Developer: Creating protagonists...
- World Builder: Building magic system...
```

---

## Troubleshooting

### Issue: OpenCode version too old

**Error:** `OpenCode version 1.0.100 is lower than required 1.0.150`

**Solution:**

```bash
# Install OpenCode globally
bun install -g opencode
```

### Issue: ripgrep not found

**Error:** `ripgrep is required but not installed`

**Solution:**

**Windows:**

```bash
# Using Chocolatey
choco install ripgrep

# Or download from GitHub releases
# https://github.com/BurntSushi/ripgrep/releases
```

**macOS:**

```bash
brew install ripgrep
```

**Linux:**

```bash
# Ubuntu/Debian
sudo apt install ripgrep

# Fedora
sudo dnf install ripgrep

# Arch
sudo pacman -S ripgrep
```

### Issue: Permission denied when creating directories

**Error:** `Permission denied: ./novels/`

**Solution:**

```bash
# Manually create directories with proper permissions
mkdir -p novels .oh-my-novel-state
chmod 755 novels .oh-my-novel-state
```

### Issue: Configuration not loading

**Error:** `Configuration file not found`

**Solution:**

```bash
# Re-run the installer
bunx oh-my-novel install

# Or manually create configuration file
mkdir -p .opencode
cat > .opencode/oh-my-novel.jsonc << 'EOF'
{
  "$schema": "./oh-my-novel.schema.json",
  "novelSettings": {
    "defaultGenre": "fantasy",
    "chapterLength": 3000,
    "autoSave": true
  }
}
EOF
```

### Issue: Plugin not recognized by OpenCode

**Error:** `Plugin 'oh-my-novel' not found`

**Solution:**

1. Check OpenCode configuration:

   ```bash
   cat ~/.config/opencode/opencode.json
   ```

2. Ensure the plugin is listed:

   ```json
   {
     "plugin": ["oh-my-novel"]
   }
   ```

3. If installed locally, ensure it's built:
   ```bash
   cd oh-my-novel
   bun run build
   ```

### Issue: Build fails

**Error:** `Build failed with errors`

**Solution:**

```bash
# Check TypeScript errors
bun run typecheck

# Install missing dependencies
bun install

# Clean and rebuild
bun run clean
bun run build
```

### Issue: Agent not responding

**Error:** `Agent 'novelist' not responding`

**Solution:**

1. Check agent configuration:

   ```bash
   cat .opencode/oh-my-novel.jsonc | grep -A 5 "novelist"
   ```

2. Ensure model is available in your OpenCode configuration
3. Check API credentials and network connection

### Get More Help

If you're still experiencing issues:

1. Check the [GitHub Issues](https://github.com/siciyuan404/oh-my-novel/issues)
2. Search for similar problems
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - `bunx oh-my-novel doctor` output
   - System information (OS, Bun version, Node version)

---

## Uninstallation

### Uninstall the Plugin

```bash
# Uninstall globally
bun uninstall -g oh-my-novel
```

### Remove Configuration Files

```bash
# Remove project-level configuration
rm -rf .opencode/oh-my-novel.jsonc
rm -rf .opencode/oh-my-novel.json

# Remove user-level configuration (optional)
rm -rf ~/.config/opencode/oh-my-novel.jsonc
rm -rf ~/.config/opencode/oh-my-novel.json
```

### Remove from OpenCode Configuration

Edit `~/.config/opencode/opencode.json` and remove `"oh-my-novel"` from the plugin list:

```json
{
  "plugin": []
}
```

### Remove Generated Data (Optional)

```bash
# Remove all novels and state
rm -rf novels/
rm -rf .oh-my-novel-state/
```

**Warning:** This will delete all your novels and generation state!

---

## Next Steps

After successful installation:

1. Read the [User Guide](./USER_GUIDE.md) for detailed usage instructions
2. Check [AGENTS.md](./AGENTS.md) for agent documentation
3. Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for quick reference
4. Start writing your first novel!

---

## Support

- **GitHub Repository:** https://github.com/siciyuan404/oh-my-novel
- **Issues:** https://github.com/siciyuan404/oh-my-novel/issues
- **Discussions:** https://github.com/siciyuan404/oh-my-novel/discussions
- **Documentation:** [README.md](./README.md)

---

**Last Updated:** January 18, 2026
