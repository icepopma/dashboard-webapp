import React from 'react';
import { getLocalIdeas, getLocalTasks } from '@/lib/local-ideas';
import { calculateOverallProgress, OverallProgress } from '@/lib/progress-calculator';
import { OptimizationDashboard } from './OptimizationDashboard';

export default async function OptimizationPage() {
  const ideas = await getLocalIdeas();
  const tasks = await getLocalTasks();
  const progress = calculateOverallProgress(tasks, ideas);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return <OptimizationDashboard progress={progress} ideas={ideas} tasks={tasks} />;
}
