import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkspaceAPI } from '../lib/workspace-api'

// Mock Tauri invoke
const mockInvoke = vi.fn()
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke
}))

describe('WorkspaceAPI Integration', () => {
  let api: WorkspaceAPI

  beforeEach(() => {
    api = new WorkspaceAPI()
    vi.clearAllMocks()
  })

  describe('Project Management', () => {
    it('should create a project', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test description'
      }

      mockInvoke.mockResolvedValue(mockProject)

      const result = await api.createProject('Test Project', 'Test description')

      expect(mockInvoke).toHaveBeenCalledWith('create_project', {
        name: 'Test Project',
        description: 'Test description'
      })
      expect(result.name).toBe('Test Project')
    })

    it('should get all projects', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1', description: 'Desc 1' },
        { id: 'project-2', name: 'Project 2', description: 'Desc 2' }
      ]

      mockInvoke.mockResolvedValue(mockProjects)

      const result = await api.getProjects()

      expect(mockInvoke).toHaveBeenCalledWith('get_projects')
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Project 1')
    })

    it('should update a project', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Updated Project',
        description: 'Updated description'
      }

      mockInvoke.mockResolvedValue(mockProject)

      const result = await api.updateProject('project-1', 'Updated Project', 'Updated description')

      expect(mockInvoke).toHaveBeenCalledWith('update_project', {
        id: 'project-1',
        name: 'Updated Project',
        description: 'Updated description'
      })
      expect(result.name).toBe('Updated Project')
    })

    it('should delete a project', async () => {
      mockInvoke.mockResolvedValue(true)

      await api.deleteProject('project-1')

      expect(mockInvoke).toHaveBeenCalledWith('delete_project', {
        id: 'project-1'
      })
    })
  })

  describe('Team Management', () => {
    it('should create a team', async () => {
      const mockTeam = {
        id: 'team-1',
        name: 'Test Team',
        description: 'Test team description'
      }

      mockInvoke.mockResolvedValue(mockTeam)

      const result = await api.createTeam('Test Team', 'Test team description')

      expect(mockInvoke).toHaveBeenCalledWith('create_team', {
        name: 'Test Team',
        description: 'Test team description'
      })
      expect(result.name).toBe('Test Team')
    })

    it('should get all teams', async () => {
      const mockTeams = [
        { id: 'team-1', name: 'Team 1', description: 'Desc 1' },
        { id: 'team-2', name: 'Team 2', description: 'Desc 2' }
      ]

      mockInvoke.mockResolvedValue(mockTeams)

      const result = await api.getTeams()

      expect(mockInvoke).toHaveBeenCalledWith('get_teams')
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Team 1')
    })
  })

  describe('Goal Management', () => {
    it('should create a goal', async () => {
      const mockGoal = {
        id: 'goal-1',
        title: 'Test Goal',
        description: 'Test goal description',
        projectId: 'project-1'
      }

      mockInvoke.mockResolvedValue(mockGoal)

      const result = await api.createGoal('Test Goal', 'Test goal description', 'project-1')

      expect(mockInvoke).toHaveBeenCalledWith('create_goal', {
        title: 'Test Goal',
        description: 'Test goal description',
        projectId: 'project-1'
      })
      expect(result.title).toBe('Test Goal')
    })
  })

  describe('Release Management', () => {
    it('should create a release', async () => {
      const mockRelease = {
        id: 'release-1',
        name: 'v1.0.0',
        description: 'First release',
        version: '1.0.0'
      }

      mockInvoke.mockResolvedValue(mockRelease)

      const result = await api.createRelease('v1.0.0', 'First release', '1.0.0')

      expect(mockInvoke).toHaveBeenCalledWith('create_release', {
        name: 'v1.0.0',
        description: 'First release',
        version: '1.0.0'
      })
      expect(result.name).toBe('v1.0.0')
    })
  })

  describe('View Management', () => {
    it('should create a view', async () => {
      const mockView = {
        id: 'view-1',
        name: 'Test View',
        description: 'Test view description',
        filters: {
          status: ['todo'],
          priority: [],
          assignee: [],
          project: []
        }
      }

      mockInvoke.mockResolvedValue(mockView)

      const result = await api.createView('Test View', 'Test view description', mockView.filters)

      expect(mockInvoke).toHaveBeenCalledWith('create_view', {
        name: 'Test View',
        description: 'Test view description',
        filters: mockView.filters
      })
      expect(result.name).toBe('Test View')
    })
  })

  describe('Error Handling', () => {
    it('should handle create project errors', async () => {
      mockInvoke.mockRejectedValue(new Error('Project creation failed'))

      await expect(api.createProject('Test Project', 'Description')).rejects.toThrow('Project creation failed')
    })

    it('should handle get projects errors', async () => {
      mockInvoke.mockRejectedValue(new Error('Failed to fetch projects'))

      await expect(api.getProjects()).rejects.toThrow('Failed to fetch projects')
    })
  })
})
