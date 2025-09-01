import React, { useState } from 'react';
import { 
  GitCommit, 
  CheckCircle2, 
  Zap,
  Wifi,
  Target,
  HardDrive,
  Activity,
  Download,
  Upload,
  Sync,
  Database,
  Loader2,
  ChevronUp,
  X
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface StatusBarProps {
  isDark: boolean;
}

export function StatusBar({ isDark }: StatusBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Static mock data to avoid runtime issues
  const mockActivities = [
    { id: '1', message: 'Syncing changes to remote repository...', status: 'running', time: 'just now' },
    { id: '2', message: 'File indexing completed for /src directory', status: 'completed', time: '30s ago' },
    { id: '3', message: 'TypeScript compilation successful', status: 'completed', time: '1m ago' },
    { id: '4', message: 'Committed: Fix header theme toggle functionality', status: 'completed', time: '2m ago' },
  ];

  const mockJobs = [
    { id: '1', name: 'File Indexing', progress: 75, status: 'running', estimatedTime: '2 min' },
    { id: '2', name: 'Cloud Sync', progress: 100, status: 'completed' },
    { id: '3', name: 'Asset Optimization', progress: 45, status: 'running', estimatedTime: '5 min' },
  ];

  const activeJobs = mockJobs.filter(job => job.status === 'running');
  const runningActivities = mockActivities.filter(activity => activity.status === 'running');

  const getActivityIcon = (status: string) => {
    if (status === 'running') return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
    if (status === 'error') return <X className="w-3 h-3 text-red-500" />;
    return <CheckCircle2 className="w-3 h-3 text-green-500" />;
  };

  const getJobIcon = (status: string) => {
    if (status === 'running') return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
    return <Database className="w-3 h-3 text-green-500" />;
  };

  return (
    <>
      {/* Expanded Activity Panel */}
      {isExpanded && (
        <div className={`h-64 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border-t border-border flex flex-col`}>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Live Activity & Background Jobs</span>
              <Badge variant="secondary" className="text-xs">
                {runningActivities.length + activeJobs.length} active
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Activity Feed */}
            <div className="flex-1 flex flex-col">
              <div className="px-3 py-2 border-b border-border">
                <span className="text-sm">Recent Activity</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-2">
                  {mockActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-2 p-2 rounded hover:bg-accent/50 transition-colors">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{activity.message}</div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                      <Badge variant="outline" className={`text-xs h-5 ${
                        activity.status === 'running' ? 'border-blue-500/50 text-blue-500' :
                        activity.status === 'error' ? 'border-red-500/50 text-red-500' :
                        'border-green-500/50 text-green-500'
                      }`}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-px bg-border" />

            {/* Background Jobs */}
            <div className="w-80 flex flex-col">
              <div className="px-3 py-2 border-b border-border">
                <span className="text-sm">Background Jobs</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-2">
                  {mockJobs.map(job => (
                    <div key={job.id} className="p-2 rounded border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getJobIcon(job.status)}
                          <span className="text-sm">{job.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {job.progress}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            job.status === 'completed' ? 'bg-green-500' :
                            job.status === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{job.status}</span>
                        {job.estimatedTime && job.status === 'running' && (
                          <span>{job.estimatedTime} remaining</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Bar */}
      <div className={`h-8 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border-t border-border flex items-center justify-between px-4 text-xs`}>
        {/* Left: Rune Source Control Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-3 h-3" />
            <span className="text-muted-foreground hidden sm:inline">Rune</span>
            <Badge variant="outline" className="h-4 px-1.5 text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
              main
            </Badge>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <GitCommit className="w-3 h-3" />
            <span className="text-muted-foreground">3 changes</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">Sync ready</span>
          </div>
        </div>

        {/* Center: Activity Summary */}
        <div className="hidden lg:flex items-center gap-4">
          {activeJobs.length > 0 && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              <span className="text-muted-foreground">{activeJobs.length} job{activeJobs.length !== 1 ? 's' : ''} running</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <HardDrive className="w-3 h-3" />
            <span className="text-muted-foreground">2.1 TB free</span>
          </div>
        </div>

        {/* Right: Activity Feed Toggle + Connection Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Activity Feed Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 hover:bg-accent/50"
          >
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {(runningActivities.length > 0 || activeJobs.length > 0) && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              )}
              <span className="hidden sm:inline text-muted-foreground">Activity</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </Button>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground hidden sm:inline">Online</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}