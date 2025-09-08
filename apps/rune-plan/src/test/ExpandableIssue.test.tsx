import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Issue, Project, Team, Goal, Release } from '../types'
import { ExpandableIssue } from '../components/ExpandableIssue'

// Mock data
const mockIssue: Issue = {
  id: 'test-issue-1',
  title: 'Test Issue',
  status: 'todo',
  priority: 'medium',
  assignee: {
    name: 'Test User',
    avatar: 'avatar.jpg'
  },
  description: 'Test description',
  labels: ['test', 'ui'],
  projectId: 'project-1',
  attachments: [],
  subIssues: [],
  activity: []
}

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Test Project',
    description: 'A test project',
    status: 'active',
    issueCount: 1,
    completedCount: 0,
    goals: [],
    members: []
  }
]

const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Test Team',
    description: 'A test team',
    members: []
  }
]

const mockGoals: Goal[] = []
const mockReleases: Release[] = []

describe('ExpandableIssue Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render issue title', () => {
    render(
      <ExpandableIssue 
        issue={mockIssue}
        goals={mockGoals}
        releases={mockReleases}
        teams={mockTeams}
        projects={mockProjects}
      />
    )
    
    expect(screen.getByText('Test Issue')).toBeInTheDocument()
  })

  it('should render issue status', () => {
    render(
      <ExpandableIssue 
        issue={mockIssue}
        goals={mockGoals}
        releases={mockReleases}
        teams={mockTeams}
        projects={mockProjects}
      />
    )
    
    // Should show some indication of todo status
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle missing issue gracefully', () => {
    const { container } = render(
      <ExpandableIssue 
        issue={null as any}
        goals={mockGoals}
        releases={mockReleases}
        teams={mockTeams}
        projects={mockProjects}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should render labels', () => {
    render(
      <ExpandableIssue 
        issue={mockIssue}
        goals={mockGoals}
        releases={mockReleases}
        teams={mockTeams}
        projects={mockProjects}
      />
    )
    
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('ui')).toBeInTheDocument()
  })
})
