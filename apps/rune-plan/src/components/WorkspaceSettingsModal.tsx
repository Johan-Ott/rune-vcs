import React, { useState } from 'react';
import { Users, Settings, Shield, Plus, Trash2, Mail, Crown, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';
import { Workspace, TeamMember } from '../App';

interface WorkspaceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  onWorkspaceUpdate: (workspace: Workspace) => void;
}

type SettingsTab = 'general' | 'members' | 'security';

export function WorkspaceSettingsModal({
  open,
  onOpenChange,
  workspace,
  onWorkspaceUpdate,
}: WorkspaceSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [workspaceData, setWorkspaceData] = useState({
    name: workspace.name,
    description: workspace.description || '',
    avatar: workspace.avatar || '',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('member');
  const [members, setMembers] = useState<TeamMember[]>(workspace.members || []);

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <UserCheck className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const handleSaveGeneral = () => {
    onWorkspaceUpdate({
      ...workspace,
      ...workspaceData,
      members,
    });
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim()) {
      const newMember: TeamMember = {
        id: `user-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        avatar: '',
        role: inviteRole,
      };
      setMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={workspaceData.avatar} />
              <AvatarFallback>{workspaceData.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Change Logo</Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or SVG. Max size 2MB.
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={workspaceData.name}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Textarea
                id="workspace-description"
                value={workspaceData.description}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your workspace..."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSaveGeneral}>Save Changes</Button>
      </div>
    </div>
  );

  const renderMembersSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Members</h3>
        
        {/* Invite new member */}
        <div className="border border-border rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-3">Invite New Member</h4>
          <div className="flex gap-3">
            <Input
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={(value: TeamMember['role']) => setInviteRole(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInviteMember}>
              <Mail className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>

        {/* Members list */}
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.name}</p>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", getRoleBadgeColor(member.role))}
                >
                  {member.role}
                </Badge>
                {member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSaveGeneral}>Save Changes</Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Security & Permissions</h3>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-2">Member Permissions</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Configure what members can do in this workspace
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Create and edit issues</span>
                <Badge variant="secondary">All Members</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Create projects</span>
                <Badge variant="secondary">Admins Only</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Invite new members</span>
                <Badge variant="secondary">Admins Only</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Delete workspace</span>
                <Badge variant="secondary">Owner Only</Badge>
              </div>
            </div>
          </div>
          
          <div className="border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-3">
              These actions cannot be undone
            </p>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'members':
        return renderMembersSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r border-border bg-muted/20 p-4">
            <div className="mb-4">
              <DialogTitle className="text-lg font-semibold">Workspace Settings</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {workspace.name}
              </DialogDescription>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'members' && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {members.length}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}