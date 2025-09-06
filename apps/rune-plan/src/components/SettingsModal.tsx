import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Keyboard, ChevronRight } from 'lucide-react';
import { useThemeContext } from './ThemeProvider';
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
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection = 'profile' | 'notifications' | 'security' | 'appearance' | 'preferences';

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const { theme, setTheme } = useThemeContext();
  const [settings, setSettings] = useState({
    profile: {
      name: 'Alice Johnson',
      email: 'alice@runeplan.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face',
      title: 'Product Manager',
      timezone: 'UTC-8'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      issueUpdates: true,
      projectUpdates: true,
      mentions: true,
      weeklyDigest: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '24h',
      loginAlerts: true
    },
    appearance: {
      theme: theme,
      sidebarCollapsed: false,
      density: 'comfortable'
    },
    preferences: {
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      startOfWeek: 'monday',
      defaultView: 'my-issues'
    }
  });

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ] as const;

  const updateSetting = (section: keyof typeof settings, key: string, value: any) => {
    // Handle theme changes specially to update global theme
    if (section === 'appearance' && key === 'theme') {
      setTheme(value);
    }
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Update local settings when theme changes from outside
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: theme
      }
    }));
  }, [theme]);

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={settings.profile.avatar} />
              <AvatarFallback>{settings.profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) => updateSetting('profile', 'name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateSetting('profile', 'email', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={settings.profile.title}
                onChange={(e) => updateSetting('profile', 'title', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.profile.timezone}
                onValueChange={(value) => updateSetting('profile', 'timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                  <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Issue Updates</Label>
              <p className="text-xs text-muted-foreground">When issues are updated or commented on</p>
            </div>
            <Switch
              checked={settings.notifications.issueUpdates}
              onCheckedChange={(checked) => updateSetting('notifications', 'issueUpdates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Project Updates</Label>
              <p className="text-xs text-muted-foreground">When projects you're in are updated</p>
            </div>
            <Switch
              checked={settings.notifications.projectUpdates}
              onCheckedChange={(checked) => updateSetting('notifications', 'projectUpdates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Mentions</Label>
              <p className="text-xs text-muted-foreground">When someone mentions you</p>
            </div>
            <Switch
              checked={settings.notifications.mentions}
              onCheckedChange={(checked) => updateSetting('notifications', 'mentions', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Weekly Digest</Label>
              <p className="text-xs text-muted-foreground">Summary of your week's activity</p>
            </div>
            <Switch
              checked={settings.notifications.weeklyDigest}
              onCheckedChange={(checked) => updateSetting('notifications', 'weeklyDigest', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Two-Factor Authentication</Label>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={settings.security.twoFactorAuth}
              onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <Select
              value={settings.security.sessionTimeout}
              onValueChange={(value) => updateSetting('security', 'sessionTimeout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="8h">8 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Login Alerts</Label>
              <p className="text-xs text-muted-foreground">Get notified of new login attempts</p>
            </div>
            <Switch
              checked={settings.security.loginAlerts}
              onCheckedChange={(checked) => updateSetting('security', 'loginAlerts', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.appearance.theme}
              onValueChange={(value) => updateSetting('appearance', 'theme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="density">Display Density</Label>
            <Select
              value={settings.appearance.density}
              onValueChange={(value) => updateSetting('appearance', 'density', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Collapsed Sidebar</Label>
              <p className="text-xs text-muted-foreground">Start with sidebar collapsed</p>
            </div>
            <Switch
              checked={settings.appearance.sidebarCollapsed}
              onCheckedChange={(checked) => updateSetting('appearance', 'sidebarCollapsed', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={settings.preferences.language}
              onValueChange={(value) => updateSetting('preferences', 'language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select
              value={settings.preferences.dateFormat}
              onValueChange={(value) => updateSetting('preferences', 'dateFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start-of-week">Start of Week</Label>
            <Select
              value={settings.preferences.startOfWeek}
              onValueChange={(value) => updateSetting('preferences', 'startOfWeek', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default-view">Default View</Label>
            <Select
              value={settings.preferences.defaultView}
              onValueChange={(value) => updateSetting('preferences', 'defaultView', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="my-issues">My Issues</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'preferences':
        return renderPreferencesSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r border-border bg-muted/20 p-4">
            <div className="mb-4">
              <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Manage your account settings and preferences
              </DialogDescription>
            </div>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
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