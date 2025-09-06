import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Team } from '../App';

interface TeamSwitcherProps {
  teams: Team[];
  currentTeam: Team;
  onTeamChange: (team: Team) => void;
}

export function TeamSwitcher({ teams, currentTeam, onTeamChange }: TeamSwitcherProps) {
  // Current user for demo purposes
  const currentUser = {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@runeplan.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face'
  };

  // Get teams where current user is a member
  const userTeams = teams.filter(team => 
    team.members?.some(member => member.id === currentUser.id)
  );

  return (
    <div className="border-b border-border bg-background px-6 py-2">
      <div className="flex items-center justify-between">
        {/* Team Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-8 px-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={currentTeam.avatar} alt={currentTeam.name} />
                <AvatarFallback className="text-xs">
                  {currentTeam.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{currentTeam.name}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Switch team
            </div>
            <DropdownMenuSeparator />
            {userTeams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => onTeamChange(team)}
                className="flex items-center gap-2"
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={team.avatar} alt={team.name} />
                  <AvatarFallback className="text-xs">
                    {team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">{team.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {team.members?.find(m => m.id === currentUser.id)?.role}
                  </div>
                </div>
                {team.isCurrentTeam && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="w-4 h-4" />
          </Button>
          <Avatar className="w-7 h-7">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-sm">
              {currentUser.name.split(' ').map(n => n.charAt(0)).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}