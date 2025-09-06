import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  Check,
  X,
  UserPlus,
  Settings,
  Crown,
  Shield,
  User as UserIcon,
  Mail,
  Edit3,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { EditDeleteDropdown } from './CustomDropdown';
import { Team, TeamMember } from '../App';
import { TeamMemberManagement } from './TeamMemberManagement';
import { ExpandableRow, ExpandableRowContent, useExpandableRows } from './ExpandableRow';

interface TeamsViewProps {
  teams: Team[];
  currentTeam: Team;
  onTeamChange: (team: Team) => void;
  onTeamCreate: (team: Team) => void;
  onTeamUpdate: (team: Team) => void;
  onTeamDelete: (teamId: string) => void;
}

export function TeamsView({ 
  teams, 
  currentTeam, 
  onTeamChange, 
  onTeamCreate, 
  onTeamUpdate, 
  onTeamDelete 
}: TeamsViewProps) {
  const { isExpanded, toggleRow } = useExpandableRows();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    avatar: ''
  });
  const [editingTeamData, setEditingTeamData] = useState<Team | null>(null);

  // Current user for demo purposes
  const currentUser = {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@runeplan.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face'
  };

  const handleCreateTeam = () => {
    if (newTeam.name.trim()) {
      const team: Team = {
        id: newTeam.name.toLowerCase().replace(/\s+/g, '-'),
        name: newTeam.name,
        description: newTeam.description,
        avatar: newTeam.avatar || `https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=32&h=32&fit=crop`,
        members: [{
          ...currentUser,
          role: 'owner'
        }]
      };
      onTeamCreate(team);
      setNewTeam({ name: '', description: '', avatar: '' });
      setShowCreateForm(false);
    }
  };

  const handleUpdateTeam = () => {
    if (editingTeamData) {
      onTeamUpdate(editingTeamData);
      setEditingTeam(null);
      setEditingTeamData(null);
    }
  };

  const handleStartEdit = (team: Team) => {
    setEditingTeam(team.id);
    setEditingTeamData({ ...team });
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditingTeamData(null);
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return <UserIcon className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getUserTeams = () => {
    return teams.filter(team => 
      team.members?.some(member => member.id === currentUser.id)
    );
  };

  const userTeams = getUserTeams();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
          {/* User's Teams */}
          {userTeams.map((team) => (
            <ExpandableRow
              key={team.id}
              onExpandChange={() => {
                setEditingTeam(null);
                setEditingTeamData(null);
                toggleRow(team.id);
              }}
              expandedContent={
                <div className="space-y-4">
                  {/* Team Info Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Team Information</h4>
                      <div className="flex gap-1">
                        {editingTeam === team.id ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={handleUpdateTeam} className="h-6 px-2">
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 px-2">
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleStartEdit(team)}
                            className="h-6 px-2"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {editingTeam === team.id && editingTeamData ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={editingTeamData.avatar} alt={editingTeamData.name} />
                            <AvatarFallback className="text-xs">{editingTeamData.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Input
                              placeholder="Team Avatar URL"
                              value={editingTeamData.avatar || ''}
                              onChange={(e) => setEditingTeamData(prev => 
                                prev ? { ...prev, avatar: e.target.value } : null
                              )}
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Team name"
                            value={editingTeamData.name}
                            onChange={(e) => setEditingTeamData(prev => 
                              prev ? { ...prev, name: e.target.value } : null
                            )}
                            className="h-8"
                          />
                          <Input
                            placeholder="Description"
                            value={editingTeamData.description || ''}
                            onChange={(e) => setEditingTeamData(prev => 
                              prev ? { ...prev, description: e.target.value } : null
                            )}
                            className="h-8"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Description:</span> {team.description || 'No description provided'}
                        </div>
                        <div>
                          <span className="font-medium">Team ID:</span> <span className="font-mono">{team.id}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team Members Section */}
                  <div>
                    <TeamMemberManagement
                      members={team.members || []}
                      canManageMembers={team.members?.find(m => m.id === currentUser.id)?.role === 'owner' || team.members?.find(m => m.id === currentUser.id)?.role === 'admin'}
                      onMemberAdd={(member) => {
                        const updatedTeam = {
                          ...team,
                          members: [...(team.members || []), member]
                        };
                        onTeamUpdate(updatedTeam);
                      }}
                      onMemberUpdate={(updatedMember) => {
                        const updatedTeam = {
                          ...team,
                          members: (team.members || []).map(m => 
                            m.id === updatedMember.id ? updatedMember : m
                          )
                        };
                        onTeamUpdate(updatedTeam);
                      }}
                      onMemberRemove={(memberId) => {
                        const updatedTeam = {
                          ...team,
                          members: (team.members || []).filter(m => m.id !== memberId)
                        };
                        onTeamUpdate(updatedTeam);
                      }}
                    />
                  </div>
                </div>
              }
            >
              <ExpandableRowContent
                avatar={
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={team.avatar} alt={team.name} />
                    <AvatarFallback className="text-xs">{team.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                }
                title={team.name}
                badges={[
                  <Badge key="members" variant="outline" className="text-xs h-4 px-2">
                    {team.members?.length} members
                  </Badge>,
                  ...(team.description ? [
                    <span key="description" className="text-xs text-muted-foreground px-2">
                      {team.description}
                    </span>
                  ] : [])
                ]}
                actions={[
                  <EditDeleteDropdown
                    key="context-menu"
                    onEdit={() => handleStartEdit(team)}
                    onDelete={() => onTeamDelete(team.id)}
                    itemName={team.name}
                  />
                ]}
              />
            </ExpandableRow>
          ))}

          {/* Other Teams Section */}
          {teams.length > userTeams.length && (
            <>
              {/* Section Divider */}
              <div className="border-t border-border/50 bg-muted/20 px-4 py-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Other Teams
                </h3>
              </div>
              {teams.filter(team => !team.members?.some(m => m.id === currentUser.id)).map((team) => (
                <ExpandableRow key={team.id} className="opacity-60">
                  <ExpandableRowContent
                    avatar={
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={team.avatar} alt={team.name} />
                        <AvatarFallback className="text-xs">{team.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    }
                    title={team.name}
                    badges={[
                      <Badge key="members" variant="outline" className="text-xs h-4 px-2">
                        {team.members?.length} members
                      </Badge>,
                      ...(team.description ? [
                        <span key="description" className="text-xs text-muted-foreground px-2">
                          {team.description}
                        </span>
                      ] : [])
                    ]}
                    actions={[
                      <Button key="request" size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        Request to join
                      </Button>
                    ]}
                  />
                </ExpandableRow>
              ))}
            </>
          )}

          {/* Create New Team - Differentiated row */}
          <ExpandableRow
              className="opacity-60 hover:opacity-100 transition-opacity"
              onExpandChange={() => setShowCreateForm(!showCreateForm)}
              expandedContent={
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      {newTeam.avatar ? (
                        <AvatarImage src={newTeam.avatar} alt="Team avatar" />
                      ) : (
                        <AvatarFallback className="bg-primary/5 text-xs">
                          {newTeam.name.charAt(0) || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        placeholder="Team Avatar URL (optional)"
                        value={newTeam.avatar}
                        onChange={(e) => setNewTeam(prev => ({ ...prev, avatar: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Team name*"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                      className="h-8"
                    />
                    <Input
                      placeholder="Description"
                      value={newTeam.description}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                      className="h-8"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateTeam} 
                      disabled={!newTeam.name.trim()}
                      size="sm"
                      className="h-7 px-3"
                    >
                      Create team
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 px-3"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTeam({ name: '', description: '', avatar: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              }
            >
              <ExpandableRowContent
                avatar={
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </div>
                }
                title={<span className="text-muted-foreground">Create new team</span>}
              />
            </ExpandableRow>
        </div>
      </div>
    </div>
  );
}