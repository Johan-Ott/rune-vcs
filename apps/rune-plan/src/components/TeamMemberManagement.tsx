import React, { useState } from 'react';
import { Plus, Trash2, Crown, Shield, User, Mail, MoreHorizontal, UserPlus, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

import { cn } from './ui/utils';
import { TeamMember } from '../App';
import { ExpandableRow, ExpandableRowContent } from './ExpandableRow';

interface TeamMemberManagementProps {
  members: TeamMember[];
  onMemberAdd: (member: TeamMember) => void;
  onMemberUpdate: (member: TeamMember) => void;
  onMemberRemove: (memberId: string) => void;
  canManageMembers?: boolean;
}

const getRoleIcon = (role: TeamMember['role']) => {
  switch (role) {
    case 'owner':
      return <Crown className="w-3 h-3 text-yellow-500" />;
    case 'admin':
      return <Shield className="w-3 h-3 text-blue-500" />;
    default:
      return <User className="w-3 h-3 text-muted-foreground" />;
  }
};

const getRoleLabel = (role: TeamMember['role']) => {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    case 'member':
      return 'Member';
    default:
      return 'Member';
  }
};

const getRoleBadgeVariant = (role: TeamMember['role']) => {
  switch (role) {
    case 'owner':
      return 'default';
    case 'admin':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function TeamMemberManagement({ 
  members, 
  onMemberAdd, 
  onMemberUpdate, 
  onMemberRemove, 
  canManageMembers = true 
}: TeamMemberManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'member' as TeamMember['role']
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member: TeamMember = {
        id: `member-${Date.now()}`,
        name: newMember.name,
        email: newMember.email,
        avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755' : '1507003211169'}-2616b612b734?w=32&h=32&fit=crop&crop=face`,
        role: newMember.role
      };
      onMemberAdd(member);
      setNewMember({ name: '', email: '', role: 'member' });
      setShowAddForm(false);
    }
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      onMemberUpdate({ ...member, role: newRole });
    }
  };

  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-medium">Team Members ({members.length})</h4>
      </div>

      {/* Existing Members */}
      <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
        {members.map((member) => (
          <ExpandableRow key={member.id}>
            <ExpandableRowContent
              avatar={
                <Avatar className="w-6 h-6">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              }
              title={member.name}
              badges={[
                <Badge key="role" variant={getRoleBadgeVariant(member.role)} className="text-xs h-4 px-2">
                  <span className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    {getRoleLabel(member.role)}
                  </span>
                </Badge>,
                <span key="email" className="text-xs text-muted-foreground px-2">
                  {member.email}
                </span>
              ]}
              actions={canManageMembers && member.role !== 'owner' ? [
                <DropdownMenu key="actions">
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                      <User className="w-4 h-4 mr-2" />
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onMemberRemove(member.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ] : []}
            />
          </ExpandableRow>
        ))}

        {/* Add New Member */}
        {canManageMembers && (
        <ExpandableRow
          className="opacity-60 hover:opacity-100 transition-opacity"
          onExpandChange={() => setShowAddForm(!showAddForm)}
          expandedContent={
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Full name*"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="h-8"
                />
                <Input
                  type="email"
                  placeholder="Email address*"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="h-8"
                />
              </div>
              
              <div>
                <Select value={newMember.role} onValueChange={(value: TeamMember['role']) => setNewMember(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Member
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="owner">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Owner
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddMember} 
                  disabled={!newMember.name || !newMember.email}
                  size="sm"
                  className="h-7 px-3"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Add Member
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-3"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMember({ name: '', email: '', role: 'member' });
                  }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          }
        >
          <ExpandableRowContent
            avatar={
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-3 h-3 text-primary" />
              </div>
            }
            title={<span className="text-muted-foreground">Add team member</span>}
          />
        </ExpandableRow>
        )}
      </div>

      {members.length === 0 && !showAddForm && (
        <div className="text-center py-6 text-muted-foreground">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No team members yet</p>
        </div>
      )}
    </div>
  );
}