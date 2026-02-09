'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Idea } from '@/lib/supabase';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
  isSelected?: boolean;
}

export function IdeaCard({ idea, onClick, isSelected }: IdeaCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      idea: 'border-blue-500',
      planning: 'border-yellow-500',
      developing: 'border-purple-500',
      completed: 'border-green-500',
      archived: 'border-gray-400',
    };
    return colors[status as keyof typeof colors] || 'border-gray-300';
  };

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-base">{idea.name}</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className={`text-xs ${getStatusColor(idea.status)}`}>
                {idea.status}
              </Badge>
              <Badge variant="outline" className={`text-xs ${idea.priority === 'high' ? 'bg-red-100 text-red-800 border-red-300' : idea.priority === 'medium' ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                {idea.priority === 'high' ? '高' : idea.priority === 'medium' ? '中' : '低'}
              </Badge>
            </div>
          </div>
        </div>
        {idea.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {idea.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
          <span>创建于 {new Date(idea.created_at).toLocaleDateString('zh-CN')}</span>
          <span>{idea.updated_at !== idea.created_at ? '更新于 ' + new Date(idea.updated_at).toLocaleDateString('zh-CN') : ''}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default IdeaCard;
