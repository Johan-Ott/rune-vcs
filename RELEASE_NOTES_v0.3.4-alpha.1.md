# Release Notes - Rune VCS v0.3.4-alpha.1

## 🎉 Major Planning System Enhancement

This release introduces comprehensive enhancements to the Rune planning system, transforming it into a full-featured project management solution while maintaining complete CLI-based workflow.

### 🆕 New Features

#### 📋 Template System
- **Create reusable plan templates** from existing successful plans
- **Generate new plans** from templates with consistent structure
- **Template management** with full CRUD operations
- **Smart content preservation** with customizable defaults

```bash
# Create template from existing plan
rune plan template create "API Endpoint" TASK-001 --description "Template for REST APIs"

# Use template to create new plan
rune plan template use "API Endpoint" "User Profile API" --story STORY-001

# Manage templates
rune plan template list
rune plan template show "API Endpoint"
rune plan template delete "old template"
```

#### ⏱️ Advanced Task Management
- **Enhanced task metadata** with assignee, due dates, effort tracking
- **Time estimation and tracking** with variance analysis
- **Task dependencies** and blocked-by relationships
- **Smart metadata preservation** during plan updates

```bash
# Add task with full metadata
rune plan add-task-advanced TASK-001 "Setup JWT middleware" \
  --assignee "john" --due-date "2025-09-10" --effort-hours 4.5

# Dependencies and blocking
rune plan link TASK-001 --depends-on TASK-002
rune plan link TASK-001 --blocks TASK-003
```

#### 📊 Comprehensive Reporting
- **Burndown reports** with effort point tracking
- **Velocity analysis** across multiple periods
- **Blocked items tracking** with multiple export formats
- **Effort distribution** by type, priority, or assignee
- **Time tracking reports** with variance analysis

```bash
# Generate reports
rune plan report burndown --period week
rune plan report velocity --periods 3
rune plan report blocked --format table
rune plan report effort --group-by type
rune plan report time --from 2025-09-01 --to 2025-09-30
```

### 🔧 Enhanced CLI Commands

#### Template Management
- `rune plan template list` - List available templates
- `rune plan template create <name> <plan-id>` - Create template from plan
- `rune plan template use <template> <title>` - Create plan from template
- `rune plan template show <name>` - Show template details
- `rune plan template delete <name>` - Remove template

#### Advanced Task Operations
- `rune plan add-task-advanced` - Add tasks with full metadata
- Enhanced task editing with assignee and time tracking
- Dependency management with link commands

#### Reporting Suite
- `rune plan report burndown` - Sprint/period burndown analysis
- `rune plan report velocity` - Development velocity tracking
- `rune plan report blocked` - Blocked items with export options
- `rune plan report effort` - Effort distribution analysis
- `rune plan report time` - Time tracking and variance reports

### 🛠️ Technical Improvements

#### Data Model Enhancements
- **TaskMetadata structure** with comprehensive tracking fields
- **PlanTemplate system** with TOML-based storage
- **Hash derives** for improved performance in reporting
- **Smart content merging** preserves manual edits

#### Export Capabilities
- **Multiple format support**: JSON, CSV, Markdown, Table
- **Structured data export** for external tool integration
- **Template serialization** for sharing across projects

### 🔄 Backward Compatibility

All existing functionality remains fully compatible:
- ✅ Existing plans work without modification
- ✅ All previous CLI commands function as before
- ✅ Configuration system unchanged
- ✅ File structure preserved
- ✅ Smart migration of existing tasks to new metadata system

### 📈 Performance & Reliability

- **Comprehensive testing** across all new features
- **Type safety improvements** with enhanced derives
- **Efficient reporting algorithms** for large plan sets
- **Memory-optimized** template and metadata storage

### 🎯 Use Cases Enabled

This release enables complete project management workflows:

1. **Template-driven development** - Standardize plan creation
2. **Agile sprint management** - Burndown and velocity tracking  
3. **Resource planning** - Assignee and effort tracking
4. **Dependency management** - Complex project coordination
5. **Progress reporting** - Stakeholder communication
6. **Time tracking** - Accurate effort estimation

### 🚀 Getting Started

```bash
# Initialize with new features
rune plan init

# Create your first template
rune plan template create "Feature Story" STORY-001

# Add advanced tasks
rune plan add-task-advanced TASK-001 "Implement feature" \
  --assignee "developer" --effort-hours 8

# Generate reports
rune plan report velocity
rune plan report effort --group-by priority
```

### 📝 Next Steps

The planning system is now feature-complete for most project management needs. Future releases will focus on:
- Visual dashboard integration
- Advanced automation rules
- Team collaboration features
- Integration with external tools

---

**Full CLI Reference**: `rune plan --help`  
**Documentation**: See updated README and command help text  
**Feedback**: Submit issues on GitHub for feature requests or bug reports

This release represents a major milestone in making Rune VCS a comprehensive development platform with world-class planning capabilities.
