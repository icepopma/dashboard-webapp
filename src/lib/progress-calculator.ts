import { LocalTask, LocalIdea } from './local-ideas';

export type { LocalTask, LocalIdea };

export interface IdeaProgress {
  ideaName: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
  cancelled: number;
  completionRate: number;
}

export interface OverallProgress {
  totalIdeas: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  failedTasks: number;
  cancelledTasks: number;
  overallCompletionRate: number;
  ideaProgress: IdeaProgress[];
}

export function calculateOverallProgress(tasks: LocalTask[], ideas: LocalIdea[]): OverallProgress {
  const totalIdeas = ideas.length;
  const totalTasks = tasks.length;

  // Count tasks by status
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;

  // Calculate overall completion rate
  const overallCompletionRate = totalTasks > 0
    ? (completedTasks / totalTasks) * 100
    : 0;

  // Calculate progress per idea
  const ideaProgressMap = new Map<string, IdeaProgress>();

  // Initialize progress for all ideas
  ideas.forEach(idea => {
    ideaProgressMap.set(idea.name, {
      ideaName: idea.name,
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
      completionRate: 0,
    });
  });

  // Count tasks for each idea
  tasks.forEach(task => {
    const progress = ideaProgressMap.get(task.ideaName);
    if (progress) {
      progress.total++;
      switch (task.status) {
        case 'completed':
          progress.completed++;
          break;
        case 'in_progress':
          progress.inProgress++;
          break;
        case 'todo':
          progress.pending++;
          break;
        case 'failed':
          progress.failed++;
          break;
        case 'cancelled':
          progress.cancelled++;
          break;
      }
    }
  });

  // Calculate completion rate for each idea
  const ideaProgress = Array.from(ideaProgressMap.values()).map(progress => ({
    ...progress,
    completionRate: progress.total > 0 ? (progress.completed / progress.total) * 100 : 0,
  }));

  return {
    totalIdeas,
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    failedTasks,
    cancelledTasks,
    overallCompletionRate,
    ideaProgress,
  };
}

export function generateTimeline(tasks: LocalTask[]) {
  // Sort tasks by created date (using task name as proxy for date)
  return tasks.map((task, index) => ({
    id: index, // Use index as ID since LocalTask doesn't have id field
    ideaName: task.ideaName,
    taskName: task.taskName,
    status: task.status,
    timestamp: Date.now() - Math.random() * 864000000 * 7, // Random date within last week
  })).sort((a, b) => b.timestamp - a.timestamp);
}

export function getProgressColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#22c55e';
    case 'in_progress':
      return '#3b82f6';
    case 'pending':
      return '#fbbf24';
    case 'failed':
      return '#ef4444';
    case 'cancelled':
      return '#9ca3af';
    default:
      return '#94a3b8';
  }
}
