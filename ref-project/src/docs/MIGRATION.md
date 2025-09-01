# Migration Guide: From Mock to Production

This guide walks you through migrating the Nordic File Explorer from the mock implementation to a production-ready application with real APIs and Tauri desktop integration.

## 📋 Migration Checklist

### Phase 1: Environment Setup
- [ ] Set up production environment variables
- [ ] Configure API base URL and authentication
- [ ] Set up logging and error monitoring
- [ ] Configure database/storage backend
- [ ] Set up CI/CD pipeline

### Phase 2: API Integration
- [ ] Implement real VCS API endpoints
- [ ] Replace mock services with real implementations
- [ ] Add authentication and authorization
- [ ] Implement rate limiting and request validation
- [ ] Add API monitoring and metrics

### Phase 3: Desktop Integration
- [ ] Set up Tauri build environment
- [ ] Configure native file system access
- [ ] Implement desktop-specific features
- [ ] Add auto-updater (optional)
- [ ] Test on target platforms

### Phase 4: Production Deployment
- [ ] Set up production infrastructure
- [ ] Configure monitoring and alerting
- [ ] Implement backup and recovery
- [ ] Set up user analytics (optional)
- [ ] Create deployment documentation

## 🔧 Step-by-Step Migration

### Step 1: Environment Configuration

1. **Update environment variables**:
   ```bash
   # .env.production
   REACT_APP_API_BASE_URL=https://api.yourapp.com
   REACT_APP_USE_REAL_API=true
   REACT_APP_LOG_LEVEL=warn
   REACT_APP_ENABLE_ANALYTICS=true
   ```

2. **Configure API authentication**:
   ```typescript
   // In your API service
   import { enableRealAPI } from './utils/apiAdapter';
   
   enableRealAPI({
     baseURL: process.env.REACT_APP_API_BASE_URL,
     apiKey: process.env.REACT_APP_API_KEY,
     timeout: 30000
   });
   ```

### Step 2: Backend API Implementation

#### Required API Endpoints

```typescript
// Repository endpoints
GET    /api/repositories
POST   /api/repositories/clone
GET    /api/repositories/:id
DELETE /api/repositories/:id

// File endpoints
GET    /api/repositories/:id/files
GET    /api/repositories/:id/files/content
POST   /api/repositories/:id/stage
POST   /api/repositories/:id/unstage

// Commit endpoints  
GET    /api/repositories/:id/commits
POST   /api/repositories/:id/commit
GET    /api/repositories/:id/commits/:hash/diff

// Branch endpoints
GET    /api/repositories/:id/branches
POST   /api/repositories/:id/branches
POST   /api/repositories/:id/checkout
DELETE /api/repositories/:id/branches/:name

// Sync endpoints
POST   /api/repositories/:id/fetch
POST   /api/repositories/:id/pull
POST   /api/repositories/:id/push

// Status endpoints
GET    /api/repositories/:id/status
```

#### Example API Implementation (Node.js/Express)

```javascript
// repositories.js
const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// Get all repositories
router.get('/', async (req, res) => {
  try {
    // Implementation depends on your VCS backend
    const repos = await getRepositories();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clone repository
router.post('/clone', async (req, res) => {
  try {
    const { url, path } = req.body;
    // Implementation for cloning
    const result = await cloneRepository(url, path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Step 3: Update Service Layer

Replace mock implementations with real API calls:

```typescript
// services/vcsService.ts
export class VCSService {
  private apiClient: APIClient;

  constructor() {
    this.apiClient = new APIClient({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
    });
  }

  async getRepositories(): Promise<Repository[]> {
    const response = await this.apiClient.get('/repositories');
    return response.data;
  }

  async cloneRepository(url: string, path: string): Promise<VCSOperation> {
    const response = await this.apiClient.post('/repositories/clone', {
      url,
      path
    });
    return response.data;
  }

  // ... other methods
}
```

### Step 4: Tauri Desktop Integration

1. **Install Tauri CLI**:
   ```bash
   npm install -g @tauri-apps/cli
   ```

2. **Initialize Tauri**:
   ```bash
   tauri init
   ```

3. **Configure Tauri permissions** in `tauri.conf.json`:
   ```json
   {
     "tauri": {
       "allowlist": {
         "fs": {
           "all": false,
           "readFile": true,
           "writeFile": true,
           "readDir": true,
           "scope": ["$HOME/**", "$DOCUMENT/**"]
         },
         "shell": {
           "all": false,
           "execute": true,
           "scope": ["git", "rune"]
         }
       }
     }
   }
   ```

4. **Add Tauri-specific code**:
   ```typescript
   // utils/tauri.ts
   import { invoke } from '@tauri-apps/api/tauri';
   import { readDir } from '@tauri-apps/api/fs';

   export async function getFiles(path: string) {
     if (config.tauri.enabled) {
       return await readDir(path);
     } else {
       // Fallback to web API
       return await webGetFiles(path);
     }
   }
   ```

### Step 5: Authentication Integration

```typescript
// services/auth.ts
export class AuthService {
  private token: string | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const data = await response.json();
      this.token = data.token;
      await storage.setItem('auth_token', data.token, { 
        scope: 'user', 
        encrypt: true 
      });
      return { success: true, user: data.user };
    }

    throw new Error('Authentication failed');
  }

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    
    const stored = await storage.getItem<string>('auth_token', { 
      scope: 'user' 
    });
    this.token = stored?.value || null;
    return this.token;
  }
}
```

### Step 6: Error Monitoring

```typescript
// services/monitoring.ts
export class MonitoringService {
  async reportError(error: AppError): Promise<void> {
    if (!config.features.enableAnalytics) return;

    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: error.id,
          category: error.category,
          message: error.message,
          severity: error.severity,
          timestamp: error.timestamp,
          context: error.context,
        }),
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}
```

### Step 7: Database Migration

If using a database for repository metadata:

```sql
-- repositories.sql
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  remote_url TEXT,
  branch VARCHAR(255) DEFAULT 'main',
  status VARCHAR(50) DEFAULT 'clean',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id),
  hash VARCHAR(40) NOT NULL,
  message TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  branch VARCHAR(255) NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_repositories_path ON repositories(path);
CREATE INDEX idx_commits_repo_branch ON commits(repository_id, branch);
```

### Step 8: Testing Production Setup

1. **Create test environment**:
   ```bash
   # .env.test
   REACT_APP_API_BASE_URL=http://localhost:3001/api
   REACT_APP_USE_REAL_API=true
   REACT_APP_LOG_LEVEL=debug
   ```

2. **Run integration tests**:
   ```bash
   npm run test:integration
   ```

3. **Test Tauri build**:
   ```bash
   npm run tauri build
   ```

## 🔒 Security Considerations

### API Security
- Use HTTPS in production
- Implement rate limiting
- Validate all input data
- Use secure authentication tokens
- Log security events

### File System Security
- Restrict file access to user directories
- Validate file paths
- Scan uploaded files
- Implement access controls

### Desktop Security
- Code sign the application
- Use secure update mechanism
- Limit system permissions
- Encrypt sensitive data

## 📊 Monitoring and Analytics

### Key Metrics to Track
- API response times
- Error rates by category
- User action patterns
- Repository operation success rates
- System resource usage

### Recommended Tools
- **Error Tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Mixpanel
- **Logging**: Winston, Pino
- **Monitoring**: Prometheus, Grafana

## 🚀 Deployment Strategies

### Web Deployment
```bash
# Build for production
npm run build

# Deploy to CDN/Static hosting
# Upload dist/ folder to your hosting provider
```

### Desktop Deployment
```bash
# Build desktop application
npm run tauri build

# Distribute installers
# Upload generated installers to release platforms
```

### Auto-Updates (Optional)
```json
// tauri.conf.json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": ["https://releases.yourapp.com/{{target}}/{{current_version}}"],
      "dialog": true,
      "pubkey": "your-public-key"
    }
  }
}
```

## 🔄 Rollback Strategy

1. **Keep mock implementation** as fallback
2. **Implement feature flags** for gradual rollout
3. **Monitor error rates** after deployment
4. **Have rollback plan** for critical issues

```typescript
// Gradual rollout example
const useRealAPI = config.api.useRealAPI && 
  Math.random() < config.features.realApiRolloutPercentage;
```

## 📝 Post-Migration Tasks

- [ ] Update documentation
- [ ] Train users on new features
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Plan next iteration

## 🆘 Troubleshooting

### Common Issues

1. **CORS errors**: Configure server CORS headers
2. **File permissions**: Check Tauri fs allowlist
3. **Authentication failures**: Verify token handling
4. **Performance issues**: Enable caching and optimization
5. **Build errors**: Check dependencies and versions

### Debug Tips

- Use browser dev tools for web debugging
- Check Tauri console for desktop issues
- Monitor network requests
- Use production error monitoring
- Check server logs for API issues

## 📞 Support

If you encounter issues during migration:

1. Check the troubleshooting section
2. Review configuration files
3. Test in development environment first
4. Consult the API documentation
5. Open an issue in the repository