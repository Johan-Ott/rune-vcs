// AI Feature Panel - Shows Rune VCS AI capabilities

import React, { useEffect } from 'react';
import { useRuneVCS } from '../contexts/RuneVCSContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function AIFeaturePanel() {
  const {
    state,
    predictConflicts,
    analyzePerformance,
    getBranchingStrategy,
  } = useRuneVCS();

  // Load AI features on mount
  useEffect(() => {
    const loadAIFeatures = async () => {
      if (state.aiFeatures.isAIEnabled) {
        try {
          await Promise.all([
            analyzePerformance(),
            getBranchingStrategy(),
          ]);
        } catch (error) {
          console.error('Failed to load AI features:', error);
        }
      }
    };

    loadAIFeatures();
  }, [state.aiFeatures.isAIEnabled]);

  const handlePredictConflicts = async () => {
    try {
      await predictConflicts('merge', state.currentBranch);
    } catch (error) {
      console.error('Conflict prediction failed:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold flex items-center">
          🤖 AI Features
          <Badge 
            variant={state.aiFeatures.isAIEnabled ? 'default' : 'secondary'}
            className="ml-2"
          >
            {state.aiFeatures.isAIEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </h3>
      </div>

      <Tabs defaultValue="conflicts" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="branching">Branching</TabsTrigger>
        </TabsList>

        {/* Conflict Prediction */}
        <TabsContent value="conflicts" className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conflict Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handlePredictConflicts}
                disabled={!state.aiFeatures.isAIEnabled}
                className="w-full"
                size="sm"
              >
                Predict Merge Conflicts
              </Button>

              {state.aiFeatures.conflictPrediction && (
                <div className="space-y-2">
                  <div className={`p-2 rounded-md text-xs ${
                    state.aiFeatures.conflictPrediction.prediction.hasConflicts
                      ? 'bg-red-600/20 border border-red-600/30'
                      : 'bg-green-600/20 border border-green-600/30'
                  }`}>
                    {state.aiFeatures.conflictPrediction.prediction.hasConflicts
                      ? '⚠️ Conflicts detected'
                      : '✅ Clean merge possible'
                    }
                    <div className="mt-1">
                      Confidence: {state.aiFeatures.conflictPrediction.prediction.confidence}%
                    </div>
                  </div>

                  {state.aiFeatures.conflictPrediction.suggestions.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1">Suggestions:</h5>
                      <ScrollArea className="h-24">
                        {state.aiFeatures.conflictPrediction.suggestions.map((suggestion: any, index: number) => (
                          <div key={index} className="text-xs p-2 bg-gray-800 rounded mb-1">
                            <div className="font-medium">{suggestion.strategy}</div>
                            <div className="text-gray-400">{suggestion.description}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {suggestion.confidence}% confidence
                            </Badge>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance" className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={analyzePerformance}
                disabled={!state.aiFeatures.isAIEnabled}
                className="w-full"
                size="sm"
              >
                Analyze Repository
              </Button>

              {state.aiFeatures.performanceAnalysis && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Size</div>
                      <div className="font-medium">
                        {state.aiFeatures.performanceAnalysis.repositorySize}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Files</div>
                      <div className="font-medium">
                        {state.aiFeatures.performanceAnalysis.fileCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Directories</div>
                      <div className="font-medium">
                        {state.aiFeatures.performanceAnalysis.directoryCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Avg File Size</div>
                      <div className="font-medium">
                        {state.aiFeatures.performanceAnalysis.averageFileSize}
                      </div>
                    </div>
                  </div>

                  {state.aiFeatures.performanceAnalysis.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1">Recommendations:</h5>
                      <ScrollArea className="h-20">
                        {state.aiFeatures.performanceAnalysis.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="text-xs p-2 bg-blue-600/20 rounded mb-1">
                            💡 {rec}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branching Strategy */}
        <TabsContent value="branching" className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Branching Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={getBranchingStrategy}
                disabled={!state.aiFeatures.isAIEnabled}
                className="w-full"
                size="sm"
              >
                Get AI Recommendation
              </Button>

              {state.aiFeatures.branchingStrategy && (
                <div className="space-y-2">
                  <div className="p-2 bg-blue-600/20 border border-blue-600/30 rounded text-xs">
                    <div className="font-medium">
                      🎯 {state.aiFeatures.branchingStrategy.recommendedStrategy}
                    </div>
                    <div className="text-gray-400 mt-1">
                      {state.aiFeatures.branchingStrategy.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Project Type</div>
                      <div className="font-medium">
                        {state.aiFeatures.branchingStrategy.projectType}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Team Size</div>
                      <div className="font-medium">
                        {state.aiFeatures.branchingStrategy.teamSize}
                      </div>
                    </div>
                  </div>

                  {state.aiFeatures.branchingStrategy.benefits.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1">Benefits:</h5>
                      <ScrollArea className="h-20">
                        {state.aiFeatures.branchingStrategy.benefits.map((benefit: string, index: number) => (
                          <div key={index} className="text-xs p-2 bg-green-600/20 rounded mb-1">
                            ✅ {benefit}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
