# Rune VCS Applications

This directory contains the desktop applications for Rune VCS.

## Applications

### 🎯 Rune Plan
**Visual Planning Client**
- Linear-style project management
- Issue tracking and team management  
- Analytics and progress visualization
- Kanban boards and timeline views

```bash
cd apps/rune-plan
npm install
npm run dev      # Development server
npm run tauri dev # Tauri desktop app
```

### 🌲 Rune Source  
**Visual Source Control Client**
- Git/P4V-style interface for Rune VCS
- Visual diff viewer and commit history
- Branch management and merge tools
- File explorer with change tracking

```bash
cd apps/rune-source
npm install  
npm run dev      # Development server
npm run tauri dev # Tauri desktop app
```

## Development

From the root directory:

```bash
# Start development servers
npm run dev:plan     # Rune Plan
npm run dev:source   # Rune Source

# Build applications
npm run build:plan   # Build Rune Plan
npm run build:source # Build Rune Source
npm run build:all    # Build all apps

# Tauri desktop apps
npm run tauri:plan   # Rune Plan desktop
npm run tauri:source # Rune Source desktop
```

## Architecture

Each app is a separate Tauri application with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri + Rune crates
- **Shared**: UI components in `/libs/ui-components`

This modular approach allows:
- Independent development and deployment
- Focused functionality per application
- Shared components and design system
- Better performance and maintainability
