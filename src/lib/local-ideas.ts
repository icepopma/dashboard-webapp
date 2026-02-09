import fs from 'fs';
import path from 'path';

// Paths
const IDEAS_DIR = path.join(process.cwd(), '../../../notes/ideas');

export interface LocalIdea {
  name: string;
  localPath: string;
  hasIdeaMd: boolean;
  hasWorkPlan: boolean;
  tasksCount: number;
  createdAt: Date;
}

export interface LocalTask {
  ideaName: string;
  taskName: string;
  localPath: string;
  status: 'todo' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

/**
 * Parse task status from task markdown file
 */
export function parseTaskStatus(taskPath: string): LocalTask['status'] {
  try {
    const content = fs.readFileSync(taskPath, 'utf-8');

    // Check for status markers
    if (content.includes('[x] ✅ 已完成')) return 'completed';
    if (content.includes('[x] 🚧 进行中')) return 'in_progress';
    if (content.includes('[x] ❌ 失败')) return 'failed';
    if (content.includes('[x] ⏸️ 已取消')) return 'cancelled';

    return 'todo';
  } catch (error) {
    console.error(`Error parsing task status for ${taskPath}:`, error);
    return 'todo';
  }
}

/**
 * Get all ideas from local filesystem
 */
export async function getLocalIdeas(): Promise<LocalIdea[]> {
  try {
    const dirs = fs.readdirSync(IDEAS_DIR, { withFileTypes: true });
    const ideas: LocalIdea[] = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const ideaPath = path.join(IDEAS_DIR, dir.name);
      const ideaMdPath = path.join(ideaPath, 'idea.md');
      const workPlanPath = path.join(ideaPath, 'work-plan.md');
      const tasksPath = path.join(ideaPath, 'tasks');

      // Check if idea.md exists
      const hasIdeaMd = fs.existsSync(ideaMdPath);

      // Check if work-plan.md exists
      const hasWorkPlan = fs.existsSync(workPlanPath);

      // Count tasks
      let tasksCount = 0;
      if (fs.existsSync(tasksPath)) {
        const tasks = fs.readdirSync(tasksPath);
        tasksCount = tasks.length;
      }

      // Get creation time from idea.md stats
      let createdAt = new Date();
      if (hasIdeaMd) {
        const stats = fs.statSync(ideaMdPath);
        createdAt = stats.birthtime || stats.mtime;
      }

      ideas.push({
        name: dir.name,
        localPath: ideaPath,
        hasIdeaMd,
        hasWorkPlan,
        tasksCount,
        createdAt,
      });
    }

    // Sort by creation time DESC
    return ideas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error reading local ideas:', error);
    return [];
  }
}

/**
 * Get all tasks from local filesystem
 */
export async function getLocalTasks(): Promise<LocalTask[]> {
  try {
    const dirs = fs.readdirSync(IDEAS_DIR, { withFileTypes: true });
    const tasks: LocalTask[] = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const ideaPath = path.join(IDEAS_DIR, dir.name);
      const tasksPath = path.join(ideaPath, 'tasks');

      if (!fs.existsSync(tasksPath)) continue;

      const taskFiles = fs.readdirSync(tasksPath);

      for (const taskFile of taskFiles) {
        const taskPath = path.join(tasksPath, taskFile);

        // Only process .md files
        if (!taskFile.endsWith('.md')) continue;

        // Extract task name from file (remove prefix and extension)
        const taskName = taskFile
          .replace(/^\d+-/, '') // Remove number prefix
          .replace(/\.md$/, '') // Remove .md extension
          .replace(/-/g, ' '); // Replace hyphens with spaces;

        const status = parseTaskStatus(taskPath);

        tasks.push({
          ideaName: dir.name,
          taskName,
          localPath: taskPath,
          status,
        });
      }
    }

    return tasks;
  } catch (error) {
    console.error('Error reading local tasks:', error);
    return [];
  }
}

/**
 * Read idea.md file content
 */
export function readIdeaMd(ideaName: string): string | null {
  try {
    const ideaMdPath = path.join(IDEAS_DIR, ideaName, 'idea.md');
    if (!fs.existsSync(ideaMdPath)) return null;
    return fs.readFileSync(ideaMdPath, 'utf-8');
  } catch (error) {
    console.error(`Error reading idea.md for ${ideaName}:`, error);
    return null;
  }
}

/**
 * Read work-plan.md file content
 */
export function readWorkPlan(ideaName: string): string | null {
  try {
    const workPlanPath = path.join(IDEAS_DIR, ideaName, 'work-plan.md');
    if (!fs.existsSync(workPlanPath)) return null;
    return fs.readFileSync(workPlanPath, 'utf-8');
  } catch (error) {
    console.error(`Error reading work-plan.md for ${ideaName}:`, error);
    return null;
  }
}

/**
 * Read all tasks for an idea
 */
export async function readIdeaTasks(ideaName: string): Promise<LocalTask[]> {
  try {
    const ideaPath = path.join(IDEAS_DIR, ideaName);
    const tasksPath = path.join(ideaPath, 'tasks');

    if (!fs.existsSync(tasksPath)) return [];

    const taskFiles = fs.readdirSync(tasksPath);
    const tasks: LocalTask[] = [];

    for (const taskFile of taskFiles) {
      const taskPath = path.join(tasksPath, taskFile);

      // Only process .md files
      if (!taskFile.endsWith('.md')) continue;

      // Extract task name
      const taskName = taskFile
        .replace(/^\d+-/, '')
        .replace(/\.md$/, '')
        .replace(/-/g, ' ');

      const status = parseTaskStatus(taskPath);

      tasks.push({
        ideaName,
        taskName,
        localPath: taskPath,
        status,
      });
    }

    return tasks;
  } catch (error) {
    console.error(`Error reading tasks for ${ideaName}:`, error);
    return [];
  }
}
