// Connection Status Component - Shows Rune VCS API connection status

import React from 'react';
import { useRuneVCS } from '../contexts/RuneVCSContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

export function ConnectionStatus() {
  const { state, testConnection, setMockMode } = useRuneVCS();

  const handleToggleMode = async () => {
    if (state.useMockData) {
      // Try to connect to real API
      const connected = await testConnection();
      if (connected) {
        setMockMode(false);
      }
    } else {
      // Switch to mock mode
      setMockMode(true);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              state.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <Badge variant={state.useMockData ? 'secondary' : 'default'}>
              {state.useMockData ? 'Mock' : 'Live'}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {state.useMockData 
              ? 'Using mock data for development'
              : state.isConnected 
                ? 'Connected to Rune VCS API' 
                : 'Disconnected from Rune VCS API'
            }
          </p>
          <p className="text-xs text-gray-400">API: {state.apiUrl}</p>
        </TooltipContent>
      </Tooltip>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggleMode}
        className="text-xs"
      >
        {state.useMockData ? 'Connect' : 'Use Mock'}
      </Button>
    </div>
  );
}
