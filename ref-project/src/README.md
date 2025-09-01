# Nordic File Explorer - Modern VCS-Enabled File Manager

A modern, glassmorphism-styled file explorer with integrated version control system (VCS) support, built for both web and desktop environments using React, TypeScript, and Tauri.

## 🌟 Features

### Core Functionality
- **Modern File Explorer**: Advanced file management with context menus, drag & drop, and multi-selection
- **Version Control Integration**: Full support for Rune VCS, Git, and Perforce-style workflows
- **Nordic Glassmorphism Design**: Beautiful aurora-inspired glassmorphism UI with dark/light modes
- **Multi-Tab Interface**: Tabbed interface for managing multiple repositories and locations
- **Real-time Status**: Live repository status, file changes, and sync indicators

### VCS Operations
- **Repository Management**: Clone, create, and manage repositories
- **Branch Operations**: Create, switch, merge, and delete branches with visual indicators
- **Commit Workflow**: Stage files, create commits with rich diff viewing
- **Sync Operations**: Push, pull, fetch, and sync with remote repositories
- **Changelist Support**: Perforce-style changelist management
- **Conflict Resolution**: Visual merge conflict resolution tools

### Architecture
- **Clean Architecture**: Separated concerns with services, contexts, and hooks
- **Mock-to-Real API**: Seamless transition from mock data to real API integration
- **Error Handling**: Comprehensive error handling with categorization and recovery
- **Logging System**: Production-ready logging with multiple outputs
- **Storage Service**: Unified storage interface for web and desktop
- **Configuration Management**: Environment-specific configuration system

## 🏗️ Architecture Overview

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn/UI components
│   ├── vcs/            # VCS-specific components
│   └── ...             # Core UI components
├── contexts/           # React contexts for state management
├── services/           # Business logic and external integrations
├── hooks/              # Custom React hooks
├── config/             # Configuration management
├── data/               # Mock data and types
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Rust (for Tauri desktop build)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nordic-file-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **For desktop development (Tauri)**
   ```bash
   npm run tauri dev
   ```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_USE_REAL_API=false
REACT_APP_LOG_LEVEL=info

# Feature flags
REACT_APP_ENABLE_ANALYTICS=false
```

## 🔧 Configuration

The application uses a centralized configuration system located in `/config/index.ts`. Key configuration areas:

- **Environment**: Development, production, test
- **API Settings**: Base URL, timeout, retry logic
- **Tauri Integration**: Desktop-specific features
- **Logging**: Log levels and outputs
- **Performance**: Caching and optimization settings
- **Security**: File restrictions and CSP settings

## 📁 Key Services

### VCS Service (`/services/vcsService.ts`)
Handles all version control operations with pluggable backend support.

### Logger (`/services/logger.ts`)
Production-ready logging with multiple outputs and log levels.

### Error Handler (`/services/errorHandler.ts`)
Centralized error handling with categorization and recovery strategies.

### Storage (`/services/storage.ts`)
Unified storage interface supporting both browser localStorage and Tauri persistent storage.

### API Adapter (`/utils/apiAdapter.ts`)
Seamless switching between mock and real API implementations.

## 🔌 API Integration

The application is designed for easy API integration:

1. **Mock Development**: Start with mock data for rapid prototyping
2. **API Transition**: Use the API adapter to gradually switch to real endpoints
3. **Production Ready**: Full error handling, retry logic, and monitoring

### Switching to Real API

```typescript
import { enableRealAPI } from './utils/apiAdapter';

// Enable real API
enableRealAPI({
  baseURL: 'https://your-api.com',
  apiKey: 'your-api-key',
  timeout: 30000
});
```

## 🖥️ Tauri Integration

The application is fully prepared for Tauri desktop deployment:

- **File System Access**: Native file system integration
- **Window Management**: Custom window controls and theming
- **System Integration**: OS-native features and notifications
- **Security**: Secure API communication and data storage

### Building for Desktop

```bash
# Development
npm run tauri dev

# Production build
npm run tauri build
```

## 🎨 Design System

The application uses a Nordic-inspired glassmorphism design system:

- **Glass Panels**: Backdrop blur with transparency
- **Aurora Gradients**: Northern lights-inspired color gradients
- **Smooth Animations**: Cubic-bezier transitions and micro-interactions
- **Responsive Layout**: Mobile-first responsive design
- **Dark/Light Modes**: Automatic theme switching

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📦 Building for Production

```bash
# Web build
npm run build

# Desktop build
npm run tauri build

# Docker build
docker build -t nordic-file-explorer .
```

## 🔐 Security Considerations

- **CSP Headers**: Content Security Policy implementation
- **File Validation**: Strict file type and size validation
- **API Security**: Token-based authentication and HTTPS
- **Data Encryption**: Sensitive data encryption in storage
- **Audit Logging**: Comprehensive activity logging

## 🚧 Migration from Mock to Production

The codebase is designed for seamless migration:

1. **Phase 1**: Develop with mock data
2. **Phase 2**: Implement real API endpoints
3. **Phase 3**: Deploy with production configuration
4. **Phase 4**: Enable monitoring and analytics

Key migration steps:
- Update environment variables
- Configure real API endpoints
- Enable production logging
- Set up error monitoring
- Configure analytics (if desired)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Shadcn/UI**: For the excellent component library
- **Lucide React**: For the beautiful icon set
- **Tauri**: For the amazing desktop framework
- **React**: For the solid foundation

## 📚 Additional Resources

- [API Documentation](./docs/api.md)
- [Component Guide](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)