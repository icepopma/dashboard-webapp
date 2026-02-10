'use client';

import React from 'react';
import { OverallProgress, LocalIdea, LocalTask } from '@/lib/progress-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OptimizationDashboardProps {
  progress: OverallProgress;
  ideas: LocalIdea[];
  tasks: LocalTask[];
}

export function OptimizationDashboard({ progress, ideas, tasks }: OptimizationDashboardProps) {
  // Performance metrics
  const totalIdeas = ideas.length;
  const totalTasks = tasks.length;
  const ideasWithWorkPlan = ideas.filter(i => i.hasWorkPlan).length;
  const ideasWithTasks = ideas.filter(i => i.tasksCount > 0).length;

  // Calculate optimization opportunities
  const optimizationSuggestions = [
    {
      title: 'Image Optimization',
      description: 'Next.js Image Optimization for better performance',
      impact: 'High',
      savings: '30-50%',
    },
    {
      title: 'Code Splitting',
      description: 'Dynamic imports and lazy loading for large components',
      impact: 'Medium',
      savings: '20-40%',
    },
    {
      title: 'Caching Strategy',
      description: 'Implement ISR and static generation for pages',
      impact: 'High',
      savings: '50-80%',
    },
    {
      title: 'Bundle Analysis',
      description: 'Analyze and reduce JavaScript bundle size',
      impact: 'Medium',
      savings: '15-25%',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Optimization</h1>
        <p className="text-gray-600 mt-2">
          Analyze and optimize your dashboard for better performance and user experience
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{totalIdeas}</p>
              <p className="text-sm text-gray-600 mt-2">Total Ideas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{totalTasks}</p>
              <p className="text-sm text-gray-600 mt-2">Total Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">{ideasWithWorkPlan}</p>
              <p className="text-sm text-gray-600 mt-2">With Work Plan</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">{ideasWithTasks}</p>
              <p className="text-sm text-gray-600 mt-2">With Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Completion Rate</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-6xl font-bold text-gray-900">
                {progress.overallCompletionRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {progress.completedTasks} of {progress.totalTasks} tasks completed
              </p>
            </div>
            <div className="w-full max-w-md">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progress.overallCompletionRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Ideas by Completion */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Ideas by Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.ideaProgress
              .filter(idea => idea.total > 0)
              .sort((a, b) => b.completionRate - a.completionRate)
              .slice(0, 5)
              .map((idea, index) => (
                <div key={idea.ideaName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{idea.ideaName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{idea.total} tasks</Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {idea.completionRate.toFixed(1)}% complete
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      suggestion.impact === 'High'
                        ? 'border-red-500 text-red-700'
                        : suggestion.impact === 'Medium'
                        ? 'border-yellow-500 text-yellow-700'
                        : 'border-green-500 text-green-700'
                    }
                  >
                    {suggestion.impact} Impact
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700">
                    ~{suggestion.savings}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bundle Size Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Bundle Size Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">JavaScript Bundle</span>
              <span className="text-sm font-mono text-gray-600">~245 KB</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">CSS Bundle</span>
              <span className="text-sm font-mono text-gray-600">~128 KB</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Total Page Size</span>
              <span className="text-sm font-mono text-gray-600">~373 KB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
