# Rune-VCS Plan System Enhancement

## Nuvarande Status
Rune-VCS har redan ett grundläggande plansystem med:
- Markdown-baserade plan-filer i `.rune/plans/`
- CLI-kommandon för plan-hantering
- React-komponent för visual client
- Plan-struktur med goals, tasks, tags, owners

## Förbättringsförslag för Agilt Ramverk

### 1. Förbättrad Plan-struktur
```toml
# .rune/planning.toml - Konfiguration
[planning]
auto_complete = true
bundling_enabled = true
default_effort_scale = ["XS", "S", "M", "L", "XL"]
task_types = ["feature", "bug", "chore", "docs", "test"]

[bundling]
bundle_with_releases = true
exclude_tags = ["internal", "draft"]
```

### 2. Utökad Markdown-format
```markdown
id: PLAN-001
title: User Authentication System
status: active
priority: high
release: v0.4.0
owners: johan,maria
tags: auth,security,mvp
roots: src/auth/,crates/rune-security/
created: 2025-09-03
updated: 2025-09-03
effort: 13
epic: USER_MANAGEMENT

# Description
Implement comprehensive user authentication system with JWT tokens and role-based access control.

## Goals
- Secure user login/logout
- JWT token management
- Role-based permissions
- Password reset functionality

## User Stories
- [ ] As a user, I want to register an account {type:feature effort:3 story:AUTH-01}
- [ ] As a user, I want to login securely {type:feature effort:2 story:AUTH-02}
- [ ] As an admin, I want to manage user roles {type:feature effort:5 story:AUTH-03}

## Tasks
- [ ] Setup JWT library {type:chore effort:1 path:Cargo.toml}
- [ ] Create user model {type:feature effort:2 path:src/models/user.rs}
- [ ] Implement password hashing {type:feature effort:2 path:src/auth/hash.rs tags:security}
- [x] Write authentication tests {type:test effort:3 path:tests/auth.rs}

## Acceptance Criteria
- All authentication endpoints return proper status codes
- Passwords are properly hashed with bcrypt
- JWT tokens expire after 24 hours
- Users can reset passwords via email

## Dependencies
- Depends on: PLAN-005 (Database Setup)
- Blocks: PLAN-010 (User Profile Management)
```

### 3. Förbättrade CLI-kommandon
```bash
# Skapa user story
rune-vcs plan create-story "User Registration" --epic AUTH --effort 3

# Lägg till acceptance criteria
rune-vcs plan add-criteria PLAN-001 "Users can login with email and password"

# Bundla med release
rune-vcs plan bundle --release v0.4.0 --status done

# Generera release notes från planer
rune-vcs plan release-notes v0.4.0

# Visa plan-dependencies
rune-vcs plan dependencies PLAN-001

# Skapa epic (stor plan med sub-plans)
rune-vcs plan create-epic "User Management" --plans PLAN-001,PLAN-002,PLAN-003
```

### 4. Visual Client Förbättringar

#### Plan Board View (Kanban-stil)
```
Todo        In Progress    Done
+--------+  +----------+  +------+
|PLAN-001|  |PLAN-002  |  |PLAN-|
|Auth    |  |Dashboard |  |003  |
|3/8     |  |5/7       |  |✓    |
+--------+  +----------+  +------+
```

#### Release Bundling View
```
Release v0.4.0
├── PLAN-001: User Authentication (Done)
├── PLAN-002: Dashboard UI (In Progress)
└── PLAN-003: User Settings (Todo)

Progress: 67% (2/3 plans done)
Estimated: 2 weeks remaining
```

### 5. Nya Datastrukturer

#### Utökad Plan-typ
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Plan {
    pub id: String,
    pub title: String,
    pub status: PlanStatus,
    pub priority: Priority,
    pub plan_type: PlanType, // Epic, Story, Task
    pub release: Option<String>,
    pub owners: Vec<String>,
    pub tags: Vec<String>,
    pub effort: Option<u32>,
    pub epic: Option<String>, // Parent epic ID
    pub created: DateTime<Utc>,
    pub updated: DateTime<Utc>,
    pub goals: Vec<String>,
    pub user_stories: Vec<UserStory>,
    pub tasks: Vec<Task>,
    pub acceptance_criteria: Vec<String>,
    pub dependencies: Vec<String>, // Other plan IDs
    pub blocks: Vec<String>, // Plans this blocks
    pub roots: Vec<String>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PlanType {
    Epic,    // Stor feature över flera releaser
    Story,   // User story för en release
    Task,    // Teknisk task
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStory {
    pub id: String,
    pub description: String,
    pub as_a: String,      // "As a user"
    pub i_want: String,    // "I want to login"
    pub so_that: String,   // "So that I can access my data"
    pub effort: Option<u32>,
    pub done: bool,
    pub acceptance_criteria: Vec<String>,
}
```

### 6. Release Bundling
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReleaseBundle {
    pub version: String,
    pub plans: Vec<String>, // Plan IDs
    pub generated_at: DateTime<Utc>,
    pub notes: String,
    pub changelog: String,
}

impl ReleaseBundle {
    pub fn generate_notes(&self, plans: &[Plan]) -> String {
        // Auto-generate release notes från plan-beskrivningar
    }
    
    pub fn to_markdown(&self) -> String {
        // Markdown för release notes
    }
}
```

### 7. Integration med Git
```bash
# Auto-tagga commits med plan ID
git commit -m "feat: implement JWT auth (PLAN-001)"

# Länka plan till branches
rune-vcs plan link PLAN-001 --branch feature/auth

# Auto-uppdatera plan-status baserat på git
rune-vcs plan sync-git # Markera som done om branch är merged
```

### 8. AI-vänlig Struktur
- All plan-data i strukturerad markdown
- Enkelt att parse och generera insights
- Standardiserade format för consistency
- Metadata i YAML front-matter stil

### 9. Export/Import
```bash
# Exportera planer för release
rune-vcs plan export --release v0.4.0 --format json

# Importera från GitHub Issues
rune-vcs plan import --source github --repo owner/repo

# Synka med Jira
rune-vcs plan sync --target jira --project KEY
```

## Implementation Plan

1. **Phase 1**: Utöka Plan-datastrukturen
2. **Phase 2**: Förbättra CLI-kommandon  
3. **Phase 3**: Uppdatera visual client
4. **Phase 4**: Release bundling
5. **Phase 5**: Git integration
6. **Phase 6**: Export/import funktioner

Vill du att jag börjar implementera någon av dessa förbättringar?
