import React, { useState } from 'react';
import { Calendar, Tag, Users, Target, FileText, Clock, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PlansPanel } from './plans/PlansPanel';
import { TagsSection } from './TagsSection';
import { TeamsSection } from './TeamsSection';
import { useVCS } from '../hooks/useVCS';

interface WorkspacePanelProps {
  isDark: boolean;
}

export function WorkspacePanel({ isDark }: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState('plans');

  // VCS Hook to get plans data and functions
  const {
    plans,
    createPlan,
    updatePlan,
    deletePlan,
    toggleTask
  } = useVCS();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Workspace</h1>
            <p className="text-sm text-muted-foreground">
              Manage your projects, teams, and workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={`${isDark ? 'glass-panel-dark backdrop-blur-md hover:bg-white/15' : 'glass-panel-light backdrop-blur-md hover:bg-white/70'} border-white/20`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`${isDark ? 'hover:bg-white/10' : 'hover:bg-white/30'} backdrop-blur-sm`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Stats Overview */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'glass-card aurora-glow' : 'glass-card-light'} ${isDark ? 'bg-blue-500/10 border-blue-400/30' : 'bg-blue-500/15 border-blue-400/20'}`}>
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Milestones</p>
                  <p className="text-xl font-semibold">{plans.filter(p => p.status !== 'done').length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'glass-card aurora-glow' : 'glass-card-light'} ${isDark ? 'bg-green-500/10 border-green-400/30' : 'bg-green-500/15 border-green-400/20'}`}>
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-xl font-semibold">12</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'glass-card aurora-glow' : 'glass-card-light'} ${isDark ? 'bg-purple-500/10 border-purple-400/30' : 'bg-purple-500/15 border-purple-400/20'}`}>
                  <Tag className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Tags</p>
                  <p className="text-xl font-semibold">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="flex-1 px-6 pb-6">
        <div className="h-full flex flex-col">
          <div className={`grid w-full grid-cols-3 gap-1 mb-4 p-1 ${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'plans'
                  ? `${isDark ? 'glass-card bg-white/10 border-white/20 text-foreground' : 'glass-card-light bg-white/60 border-white/40 text-foreground'}`
                  : `${isDark ? 'hover:bg-white/5' : 'hover:bg-white/20'} text-muted-foreground hover:text-foreground`
              }`}
            >
              <Calendar className="w-4 h-4" />
              Plans
              <Badge variant="secondary" className={`ml-1 ${isDark ? 'bg-white/15 text-foreground border-white/20' : 'bg-white/70 text-foreground border-white/30'} backdrop-blur-sm`}>
                {plans.filter(p => p.status !== 'done').length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'teams'
                  ? `${isDark ? 'glass-card bg-white/10 border-white/20 text-foreground' : 'glass-card-light bg-white/60 border-white/40 text-foreground'}`
                  : `${isDark ? 'hover:bg-white/5' : 'hover:bg-white/20'} text-muted-foreground hover:text-foreground`
              }`}
            >
              <Users className="w-4 h-4" />
              Teams
              <Badge variant="secondary" className={`ml-1 ${isDark ? 'bg-white/15 text-foreground border-white/20' : 'bg-white/70 text-foreground border-white/30'} backdrop-blur-sm`}>
                3
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'tags'
                  ? `${isDark ? 'glass-card bg-white/10 border-white/20 text-foreground' : 'glass-card-light bg-white/60 border-white/40 text-foreground'}`
                  : `${isDark ? 'hover:bg-white/5' : 'hover:bg-white/20'} text-muted-foreground hover:text-foreground`
              }`}
            >
              <Tag className="w-4 h-4" />
              Tags
              <Badge variant="secondary" className={`ml-1 ${isDark ? 'bg-purple-500/20 text-purple-400 border-purple-400/30' : 'bg-purple-500/15 text-purple-600 border-purple-400/20'} backdrop-blur-sm`}>
                8
              </Badge>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'plans' && (
              <div className="h-full">
                <PlansPanel 
                  isDark={isDark}
                  plans={plans}
                  onCreatePlan={createPlan}
                  onUpdatePlan={updatePlan}
                  onDeletePlan={deletePlan}
                  onToggleTask={toggleTask}
                />
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="h-full">
                <TeamsSection isDark={isDark} />
              </div>
            )}

            {activeTab === 'tags' && (
              <div className="h-full">
                <TagsSection isDark={isDark} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}