'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Idea } from '@/lib/supabase';

interface WorkPlanViewProps {
  ideaId: string;
}

export function WorkPlanView({ ideaId }: WorkPlanViewProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkPlan() {
      try {
        const ideaDir = path.join(process.cwd(), 'notes', 'ideas');
        const ideaFile = path.join(ideaDir, ideaId, 'idea.md');
        
        const response = await fetch(ideaFile);
        if (!response.ok) {
          throw new Error(`Failed to load work plan: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load work plan:', error);
        setLoading(false);
      }
    }

    loadWorkPlan();
  }, [ideaId]);

  return (
    <ScrollArea className="flex-1 h-[calc(100vh-8rem)] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Work Plan</h1>
          <p className="text-sm text-gray-600 mb-4">
            查看 {ideaId} 的 Work Plan
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 prose prose prose-sm max-w-none">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300" />
            </div>
          ) : (
            <>
              {content ? (
                <div className="whitespace-pre-wrap">{content}</div>
              ) : (
                <div className="text-gray-500 text-center">
                  <p className="text-sm">Work Plan 内容为空</p>
                  <p className="text-xs text-gray-400 mt-2">
                    该 idea 的 work-plan.md 文件不存在或为空
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

export default WorkPlanView;
