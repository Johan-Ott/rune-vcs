import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  UserPlus, 
  Settings,
  Check,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface Team {
  id: string;
  name: string;
  description?: string;
  members: number;
  access: 'Full Access' | 'Read/Write' | 'Read Only';
  color?: string;
}

interface TeamsSectionProps {
  isDark: boolean;
}

export function TeamsSection({ isDark }: TeamsSectionProps) {
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'Core Developers', members: 5, access: 'Full Access', description: 'Main development team with full repository access' },
    { id: '2', name: 'QA Team', members: 3, access: 'Read/Write', description: 'Quality assurance team for testing and bug reports' },
    { id: '3', name: 'Designers', members: 2, access: 'Read Only', description: 'Design team with view access to assets and documentation' },
  ]);

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    access: 'Read Only' as const,
    members: 1
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    access: 'Read Only' as const
  });

  const handleCreateTeam = () => {
    if (!newTeam.name.trim()) return;

    const team: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeam.name.trim(),
      description: newTeam.description.trim() || undefined,
      access: newTeam.access,
      members: newTeam.members,
    };

    setTeams(prev => [...prev, team]);
    setNewTeam({ name: '', description: '', access: 'Read Only', members: 1 });
    setIsCreateFormOpen(false);
  };

  const handleStartEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setEditForm({
      name: team.name,
      description: team.description || '',
      access: team.access
    });
  };

  const handleSaveEdit = () => {
    if (!editingTeamId || !editForm.name.trim()) return;

    setTeams(prev => prev.map(team => 
      team.id === editingTeamId ? { 
        ...team, 
        name: editForm.name.trim(), 
        description: editForm.description.trim() || undefined,
        access: editForm.access 
      } : team
    ));
    setEditingTeamId(null);
    setEditForm({ name: '', description: '', access: 'Read Only' });
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditForm({ name: '', description: '', access: 'Read Only' });
  };

  const handleDeleteTeam = (id: string) => {
    setTeams(prev => prev.filter(team => team.id !== id));
  };

  const getAccessColor = (access: Team['access']) => {
    switch (access) {
      case 'Full Access': return isDark ? 'text-red-400' : 'text-red-600';
      case 'Read/Write': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'Read Only': return isDark ? 'text-green-400' : 'text-green-600';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2>Teams & Access Control</h2>
        <Button 
          size="sm" 
          onClick={() => {
            setIsCreateFormOpen(!isCreateFormOpen);
            if (!isCreateFormOpen) {
              setNewTeam({ name: '', description: '', access: 'Read Only', members: 1 });
            }
          }}
        >
          {isCreateFormOpen ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          {isCreateFormOpen ? 'Cancel' : 'New Team'}
        </Button>
      </div>

      {/* Create Team Form */}
      {isCreateFormOpen && (
        <div className={`${isDark ? 'glass-card' : 'glass-card-light'} p-4 mb-4 border-dashed`}>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Team Name *</Label>
              <Input
                placeholder="Enter team name..."
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                placeholder="Team description (optional)..."
                value={newTeam.description}
                onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div>
              <Label className="text-sm">Access Level</Label>
              <Select value={newTeam.access} onValueChange={(value: any) => setNewTeam(prev => ({ ...prev, access: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Read Only">Read Only</SelectItem>
                  <SelectItem value="Read/Write">Read/Write</SelectItem>
                  <SelectItem value="Full Access">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm"
                onClick={handleCreateTeam} 
                disabled={!newTeam.name.trim()}
              >
                <Check className="w-3 h-3 mr-1" />
                Create Team
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setIsCreateFormOpen(false);
                  setNewTeam({ name: '', description: '', access: 'Read Only', members: 1 });
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3>{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.members} members • <span className={getAccessColor(team.access)}>{team.access}</span>
                    </p>
                    {team.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{team.description}</p>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartEdit(team)}>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit Team
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="w-3 h-3 mr-2" />
                      Manage Members
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-3 h-3 mr-2" />
                      Permissions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Inline Edit Form */}
            {editingTeamId === team.id && (
              <div className={`px-4 pb-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <div className="space-y-3 mt-4">
                  <div>
                    <Label className="text-sm">Team Name *</Label>
                    <Input
                      placeholder="Enter team name..."
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      placeholder="Team description (optional)..."
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Access Level</Label>
                    <Select value={editForm.access} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, access: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Read Only">Read Only</SelectItem>
                        <SelectItem value="Read/Write">Read/Write</SelectItem>
                        <SelectItem value="Full Access">Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm"
                      onClick={handleSaveEdit} 
                      disabled={!editForm.name.trim()}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save Changes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}