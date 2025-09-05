import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { GitBranch, FileText, GitCommit, Folder } from 'lucide-react'
import './App.css'

function App() {
  const [currentBranch, setCurrentBranch] = useState<string>('main')
  const [repoStatus, setRepoStatus] = useState<any>(null)

  useEffect(() => {
    // Initialize repository status
    loadRepoStatus()
  }, [])

  const loadRepoStatus = async () => {
    try {
      // This will call Rust backend functions
      const status = await invoke('get_repo_status')
      setRepoStatus(status)
    } catch (error) {
      console.error('Failed to load repo status:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Rune Source</h1>
          <div className="branch-indicator">
            <GitBranch size={16} />
            <span>{currentBranch}</span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={loadRepoStatus}>Refresh</button>
        </div>
      </header>

      <div className="app-content">
        <nav className="sidebar">
          <div className="nav-section">
            <h3><Folder size={16} /> Repository</h3>
            <ul>
              <li><FileText size={14} /> Changes</li>
              <li><GitCommit size={14} /> History</li>
              <li><GitBranch size={14} /> Branches</li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <div className="welcome-section">
            <h2>Welcome to Rune Source</h2>
            <p>Your visual source control client for Rune VCS</p>
            
            {repoStatus ? (
              <div className="repo-info">
                <h3>Repository Status</h3>
                <pre>{JSON.stringify(repoStatus, null, 2)}</pre>
              </div>
            ) : (
              <div className="loading">
                <p>Loading repository status...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
