import { useState } from 'react';
import { Goal } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface GoalWithMeta extends Goal {
  description?: string;
  icon?: string;
  linkedCategory?: string;
}

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: GoalWithMeta) => void;
  onDelete?: (id: string) => void;
  goal?: GoalWithMeta | null;
  categories?: string[];
}

const BASE_LINK_OPTIONS = [
  { value: 'all', label: 'All Tasks (Hours)' },
  { value: 'ownership', label: 'Ownership Tasks' },
  { value: 'ai', label: 'AI Assisted Tasks' },
];

export function GoalModal({ open, onClose, onSave, onDelete, goal, categories = [] }: GoalModalProps) {
  const linkOptions = [
    ...BASE_LINK_OPTIONS,
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];
  const [formData, setFormData] = useState<GoalWithMeta>({
    id: '',
    title: '',
    targetValue: 10,
    currentProgress: 0,
    unit: 'hours',
    description: '',
    linkedCategory: 'all',
  });

  useState(() => {
    if (goal) {
      setFormData(goal);
    } else {
      setFormData({
        id: '',
        title: '',
        targetValue: 10,
        currentProgress: 0,
        unit: 'hours',
        description: '',
        linkedCategory: 'all',
      });
    }
  });

  // Reset form when goal changes
  if (open && goal && formData.id !== goal.id) {
    setFormData(goal);
  } else if (open && !goal && formData.id !== '') {
    setFormData({
      id: '',
      title: '',
      targetValue: 10,
      currentProgress: 0,
      unit: 'hours',
      description: '',
      linkedCategory: 'all',
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalToSave: GoalWithMeta = {
      ...formData,
      id: goal?.id || crypto.randomUUID(),
    };
    
    onSave(goalToSave);
    onClose();
  };

  const handleDelete = () => {
    if (goal && onDelete) {
      onDelete(goal.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Logged Effort"
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this goal..."
              rows={2}
              className="bg-secondary/50 border-border resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                min="1"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) }))}
                required
                className="bg-secondary/50 border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value: 'hours' | 'stories' | '%') => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="stories">Stories/Tasks</SelectItem>
                  <SelectItem value="%">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedCategory">Linked To</Label>
            <Select
              value={formData.linkedCategory || 'all'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, linkedCategory: value }))}
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {linkOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Progress auto-updates from linked tasks</p>
          </div>

          <DialogFooter className="flex items-center justify-between">
            {goal && onDelete && (
              <Button 
                type="button" 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                Delete Goal
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {goal ? 'Update' : 'Add Goal'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
