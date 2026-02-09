'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Idea } from '@/lib/supabase';

interface CreateIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (idea: Partial<Idea>) => void;
}

export function CreateIdeaDialog({ open, onOpenChange, onSave }: CreateIdeaDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('请输入 idea 名称');
      return;
    }

    const newIdea: Partial<Idea> = {
      name: name.trim(),
      description: description.trim() || undefined,
      background: background.trim() || undefined,
      status: 'idea',
      priority: priority,
    };

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea),
      });

      const idea = await response.json();
      onSave(idea);
      onOpenChange(false);
      // 重置表单
      setName('');
      setDescription('');
      setBackground('');
      setPriority('medium');
    } catch (error) {
      console.error('Failed to create idea:', error);
      alert('创建失败，请重试');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // 重置表单
    setName('');
    setDescription('');
    setBackground('');
    setPriority('medium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新 Idea</DialogTitle>
          <DialogDescription>
            填写 idea 的基本信息
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 名称 */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-900">
                名称 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="输入 idea 名称..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-900">
                描述
              </label>
              <Textarea
                id="description"
                placeholder="描述这个 idea 的背景、目标、关键点..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* 背景 */}
            <div className="space-y-2">
              <label htmlFor="background" className="text-sm font-medium text-gray-900">
                背景
              </label>
              <Textarea
                id="background"
                placeholder="这个 idea 是为什么产生的？"
                value={background}
                onChange={e => setBackground(e.target.value)}
                rows={3}
              />
            </div>

            {/* 优先级 */}
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium text-gray-900">
                优先级
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="选择优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              取消
            </Button>
            <Button type="submit">
              创建
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateIdeaDialog;
