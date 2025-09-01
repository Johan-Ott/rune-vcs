import React, { useState } from 'react';
import {
  Settings,
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Keyboard,
  Monitor,
  Sun,
  Moon,
  Save,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SettingsPanelProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function SettingsPanel({ isDark, onThemeToggle }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState('profile');

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <Card className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your personal information and account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" defaultValue="John" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" />
              </div>
            </CardContent>
          </Card>
        );
        
      case 'appearance':
        return (
          <Card className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of Nordic Explorer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant={isDark ? "default" : "outline"}
                    size="sm"
                    onClick={() => !isDark && onThemeToggle()}
                    className="flex items-center gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={!isDark ? "default" : "outline"}
                    size="sm"
                    onClick={() => isDark && onThemeToggle()}
                    className="flex items-center gap-2"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'editor':
        return (
          <Card className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Editor Preferences
              </CardTitle>
              <CardDescription>
                Configure your coding environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-save Files</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Hidden Files</Label>
                  <p className="text-sm text-muted-foreground">Display files starting with a dot</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return (
          <Card className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Select a category from the sidebar to configure your settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section is coming soon.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Settings Navigation */}
      <div className={`w-64 p-4 border-r ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="space-y-1">
          <h2 className="mb-4">Settings</h2>
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? `${isDark ? 'bg-white/10' : 'bg-black/10'} text-foreground`
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <section.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{section.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
          
          {/* Save Actions */}
          <div className={`flex items-center gap-3 mt-8 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline">
              Discard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}