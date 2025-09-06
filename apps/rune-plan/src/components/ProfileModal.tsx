import React, { useState } from 'react';
import { User, Edit2, Mail, Shield, LogOut, Settings, Bell, Moon, Sun } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ExpandableRow, ExpandableRowContent } from './ExpandableRow';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  title?: string;
  bio?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      mentions: boolean;
      updates: boolean;
    };
    language: string;
    timezone: string;
  };
}

const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Alice Johnson',
  email: 'alice@runeplan.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=100&h=100&fit=crop&crop=face',
  role: 'owner',
  title: 'Senior Product Manager',
  bio: 'Leading product development at Rune-Plan with a focus on user experience and team collaboration.',
  preferences: {
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      mentions: true,
      updates: false
    },
    language: 'English',
    timezone: 'UTC+1 (Stockholm)'
  }
};

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const updatePreference = (key: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const updateNotificationPreference = (key: string, value: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [key]: value
        }
      }
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Profile Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-lg">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-medium">{profile.name}</h3>
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {profile.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{profile.email}</p>
              {profile.title && (
                <p className="text-sm text-muted-foreground">{profile.title}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Basic Information
            </h4>
            
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <ExpandableRow
                expandedContent={
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={isEditing ? editedProfile.name : profile.name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? editedProfile.email : profile.email}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={isEditing ? editedProfile.title || '' : profile.title || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, title: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter your job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? editedProfile.bio || '' : profile.bio || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancel} size="sm">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                }
              >
                <ExpandableRowContent
                  title="Personal Information"
                  subtitle="Manage your basic profile information"
                />
              </ExpandableRow>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </h4>
            
            <div className="border border-border/50 rounded-lg overflow-hidden">
              {/* Theme Settings */}
              <ExpandableRow
                expandedContent={
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Appearance</Label>
                        <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                      </div>
                      <select
                        value={isEditing ? editedProfile.preferences.theme : profile.preferences.theme}
                        onChange={(e) => updatePreference('theme', e.target.value)}
                        disabled={!isEditing}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Language</Label>
                        <p className="text-sm text-muted-foreground">Your preferred language</p>
                      </div>
                      <select
                        value={isEditing ? editedProfile.preferences.language : profile.preferences.language}
                        onChange={(e) => updatePreference('language', e.target.value)}
                        disabled={!isEditing}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                      >
                        <option value="English">English</option>
                        <option value="Swedish">Svenska</option>
                        <option value="Norwegian">Norsk</option>
                        <option value="Danish">Dansk</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Timezone</Label>
                        <p className="text-sm text-muted-foreground">Your local timezone</p>
                      </div>
                      <select
                        value={isEditing ? editedProfile.preferences.timezone : profile.preferences.timezone}
                        onChange={(e) => updatePreference('timezone', e.target.value)}
                        disabled={!isEditing}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                      >
                        <option value="UTC+1 (Stockholm)">UTC+1 (Stockholm)</option>
                        <option value="UTC+0 (London)">UTC+0 (London)</option>
                        <option value="UTC-5 (New York)">UTC-5 (New York)</option>
                        <option value="UTC-8 (Los Angeles)">UTC-8 (Los Angeles)</option>
                      </select>
                    </div>
                  </div>
                }
              >
                <ExpandableRowContent
                  title="Display & Language"
                  subtitle={`Theme: ${profile.preferences.theme} • ${profile.preferences.language} • ${profile.preferences.timezone}`}
                />
              </ExpandableRow>

              {/* Notification Settings */}
              <ExpandableRow
                expandedContent={
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={isEditing ? editedProfile.preferences.notifications.email : profile.preferences.notifications.email}
                        onCheckedChange={(checked) => updateNotificationPreference('email', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch
                        checked={isEditing ? editedProfile.preferences.notifications.push : profile.preferences.notifications.push}
                        onCheckedChange={(checked) => updateNotificationPreference('push', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mentions</Label>
                        <p className="text-sm text-muted-foreground">Get notified when mentioned in comments</p>
                      </div>
                      <Switch
                        checked={isEditing ? editedProfile.preferences.notifications.mentions : profile.preferences.notifications.mentions}
                        onCheckedChange={(checked) => updateNotificationPreference('mentions', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Project Updates</Label>
                        <p className="text-sm text-muted-foreground">Get notified about project changes</p>
                      </div>
                      <Switch
                        checked={isEditing ? editedProfile.preferences.notifications.updates : profile.preferences.notifications.updates}
                        onCheckedChange={(checked) => updateNotificationPreference('updates', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                }
              >
                <ExpandableRowContent
                  title="Notifications"
                  subtitle="Manage how you receive updates and alerts"
                />
              </ExpandableRow>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-4">
            <h4 className="font-medium text-destructive">Account Actions</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}