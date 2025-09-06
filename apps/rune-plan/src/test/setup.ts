import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((command: string, args: any = {}) => {
    switch (command) {
      case 'get_workspace_config':
        return Promise.resolve({
          projects: [{ id: 'test-project', name: 'Test Project', description: 'Test' }],
          teams: [{ id: 'test-team', name: 'Test Team', members: ['alice'] }],
          goals: [{ id: 'test-goal', title: 'Test Goal', project_id: 'test-project' }],
          releases: [{ id: 'test-release', name: 'v1.0.0', version: '1.0.0' }],
          views: [{ id: 'test-view', name: 'Test View', type: 'list', filters: {} }],
          workspaces: [{ id: 'test-workspace', name: 'Test Workspace' }]
        })
      case 'create_project':
      case 'create_team':
      case 'create_goal':
      case 'create_release':
      case 'create_view':
        return Promise.resolve({ id: `mock-${Date.now()}`, ...args })
      case 'save_workspace_config':
        return Promise.resolve({ success: true })
      default:
        return Promise.resolve(null)
    }
  })
}))

// Mock window for Tauri
global.window = global.window || {}
;(global.window as any).__TAURI_INTERNALS__ = {
  invoke: vi.fn().mockResolvedValue({})
}
