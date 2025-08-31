---
sidebar_position: 2
---

# Binary File Handling

Rune excels at managing binary files like images, videos, 3D models, and databases that traditional VCS struggles with.

## Why Binary Files Are Hard

### Traditional VCS Problems
- **No meaningful diffs**: "binary file changed" tells you nothing
- **Large repository sizes**: Every version stored completely
- **Slow operations**: Downloading entire history for large files
- **Merge conflicts**: Impossible to merge binary changes intelligently

### Rune's Solutions
- **Semantic understanding**: AI analyzes what actually changed
- **Smart storage**: Efficient binary diffing and compression
- **Intelligent merging**: Context-aware binary conflict resolution
- **Performance optimization**: Lazy loading and smart caching

## Supported File Types

### Images
```bash
# Smart image handling
rune add images/logo.png
# "Image detected: PNG, 1024x1024, 32-bit RGBA"

rune diff images/logo.png
# "Resolution: 512x512 → 1024x1024"
# "Size: 45KB → 180KB"
# "Color profile: sRGB → Adobe RGB"
```

### 3D Models
```bash
# 3D model intelligence
rune add models/character.fbx
# "3D model detected: 15,432 vertices, 8 materials, 12 animations"

rune diff models/character.fbx
# "Vertices added: +1,247"
# "New animation: 'jump_sequence' (2.5s)"
# "Material updated: 'skin_texture' (resolution increased)"
```

### Audio/Video
```bash
# Media file analysis
rune add media/soundtrack.wav
# "Audio: 44.1kHz, 16-bit, stereo, 3:45 duration"

rune add video/demo.mp4
# "Video: 1920x1080, 30fps, H.264, 5:23 duration"
# "Audio track: AAC, stereo"
```

### Documents
```bash
# Office documents
rune add documents/proposal.docx
# "Word document: 15 pages, 3,421 words"

rune add spreadsheets/budget.xlsx
# "Excel workbook: 4 sheets, 156 rows of data"
```

### Databases
```bash
# Database files
rune add data/users.sqlite
# "SQLite database: 5 tables, 10,432 records"

rune diff data/users.sqlite
# "Table 'users': +156 records"
# "Table 'sessions': structure modified"
# "Index added: idx_user_email"
```

## Smart Storage

### Binary Diffing
```bash
# Traditional Git: stores complete files
# File v1: 10MB
# File v2: 10MB  (even for small changes)
# Total: 20MB

# Rune: stores binary diffs
# File v1: 10MB
# Diff v1→v2: 50KB
# Total: 10.05MB
```

### Compression
```bash
# Automatic compression by file type
rune add textures/*.png
# "Applied PNG-optimized compression: 245MB → 89MB"

rune add models/*.obj
# "Applied mesh compression: 156MB → 34MB"
```

### Smart Deduplication
```bash
# Detects similar binary content
rune add screenshots/
# "Found 15 similar screenshots, using smart deduplication"
# "Storage saved: 67%"
```

## AI-Powered Analysis

### Image Analysis
```bash
# Content understanding
rune analyze images/screenshot.png
# "UI screenshot detected"
# "Contains: login form, navigation bar, footer"
# "Screen resolution: 1920x1080"
# "Notable elements: error message visible"

rune diff images/before.png images/after.png
# "UI elements moved: login button repositioned"
# "Color scheme updated: blue theme → green theme"
# "New element: forgot password link added"
```

### Model Analysis
```bash
# 3D model intelligence
rune analyze models/car.blend
# "Vehicle model: sedan, 4-door"
# "Complexity: medium (45K vertices)"
# "Materials: metal, glass, rubber (4 total)"
# "Rigging: steering wheel, doors (basic)"

rune diff models/car_v1.blend models/car_v2.blend
# "Detail improved: +12K vertices on wheel rims"
# "New component: side mirrors added"
# "Material updated: paint shader enhanced"
```

### Document Analysis
```bash
# Document content understanding
rune analyze documents/report.pdf
# "Technical report: 45 pages"
# "Sections: Introduction, Methods, Results, Conclusion"
# "Images: 12 figures, 8 tables"
# "References: 67 citations"

rune diff documents/draft.docx documents/final.docx
# "Content changes: +3 pages"
# "Sections added: Executive Summary"
# "Track changes: 47 edits accepted"
```

## Binary Conflict Resolution

### Intelligent Strategies
```bash
# Traditional: binary merge always fails
git merge feature/assets
# "CONFLICT: binary file images/logo.png"
# "Manual resolution required"

# Rune: smart binary resolution
rune merge --smart feature/assets
# "Binary conflict in images/logo.png"
# "Strategy: Using higher resolution version (1024x1024)"
# "Backup created: images/logo.png.backup"
```

### Resolution Options
```bash
# Choose resolution strategy
rune merge --binary-strategy newest      # Use most recent
rune merge --binary-strategy largest     # Use larger file
rune merge --binary-strategy highest-res # Use higher resolution
rune merge --binary-strategy manual      # Always ask

# For specific file types
rune config binary.images.strategy highest-res
rune config binary.models.strategy largest
rune config binary.documents.strategy newest
```

### Interactive Resolution
```bash
# When automatic resolution isn't possible
rune merge feature/models
# "Binary conflict in character.fbx:"
# "  [1] main branch: 15K vertices, basic rigging"
# "  [2] feature branch: 12K vertices, advanced rigging"
# "  [3] manual merge (open external tool)"
# "Choose resolution [1/2/3]: "
```

## Performance Optimization

### Lazy Loading
```bash
# Only download what you need
rune clone --shallow project.git
# Downloads text files immediately
# Binary files downloaded on demand

rune checkout models/character.fbx
# "Downloading character.fbx (15MB)..."
# Other binary files remain as stubs
```

### Smart Caching
```bash
# Intelligent binary caching
rune config cache.binary.size 5GB      # Cache up to 5GB
rune config cache.binary.strategy lru   # Least recently used

# Cache status
rune cache status
# "Binary cache: 3.2GB / 5GB used"
# "Cache hits: 89% (excellent)"
# "Most cached: textures/ (45% of operations)"
```

### Network Optimization
```bash
# Efficient binary transfers
rune push --compress-binaries
# "Compressing 15 binary files..."
# "Transfer size: 245MB → 67MB"

rune pull --binary-parallel 4
# "Downloading binaries using 4 parallel connections"
# "ETA: 2 minutes (was 8 minutes)"
```

## Binary File Best Practices

### Organization
```bash
# Organize by type
assets/
  images/
    ui/
    screenshots/
    icons/
  models/
    characters/
    environments/
  audio/
    music/
    effects/
```

### Naming Conventions
```bash
# Descriptive names help AI
character_idle_animation.fbx      # Good
char1.fbx                         # Poor

ui_login_button_hover.png         # Good
button2.png                       # Poor
```

### Version Management
```bash
# Use branches for major asset changes
rune "create a branch for character model updates"
rune "create a branch for texture overhaul"

# Tag asset releases
rune tag assets-v1.0 -m "First complete asset set"
rune tag textures-hd -m "High definition texture pack"
```

## Integration with External Tools

### Image Editors
```bash
# Configure external tools
rune config tool.images "Photoshop.exe"
rune config tool.models "Blender.exe"

# Open in external tool
rune edit images/logo.png
# Opens Photoshop, tracks changes on save
```

### 3D Software Integration
```bash
# Blender integration
rune config tool.blend "blender"
rune edit models/character.blend
# "File modified externally, auto-staging enabled"

# Maya integration
rune config tool.maya "maya"
rune edit scenes/main_scene.ma
```

### Game Engine Integration
```bash
# Unity project handling
rune add Assets/
# "Unity project detected"
# "Ignoring: Library/, Temp/, obj/"
# "Tracking: Scripts/, Prefabs/, Scenes/"

# Unreal Engine
rune add Content/
# "Unreal project detected"
# "Binary assets: .uasset, .umap files"
# "Using Unreal-optimized storage"
```

## Troubleshooting

### Large Files
```bash
# File too large
rune add video/demo.mov
# "Warning: File is 2.5GB, consider external storage"
# "Suggestion: Use Git LFS integration"

# Enable large file support
rune config binary.large-files true
rune config binary.max-size 5GB
```

### Corruption Detection
```bash
# Verify binary integrity
rune verify binaries/
# "Checking 156 binary files..."
# "✓ All files verified"
# "⚠ Warning: texture.png may be corrupted"

# Repair corrupted files
rune repair texture.png
# "Attempting repair from version history..."
# "✓ File restored from previous version"
```

### Storage Issues
```bash
# Repository too large
rune analyze storage
# "Repository size: 2.1GB"
# "Binary files: 1.8GB (86%)"
# "Suggestion: Archive old assets"

# Clean up old versions
rune gc --binary-aggressive
# "Removed 234MB of old binary versions"
# "Repository size: 2.1GB → 1.3GB"
```
