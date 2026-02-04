import { useState, useEffect } from 'react';
import { Task } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { format } from 'date-fns';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  task?: Task | null;
  categories: string[];
}

export function TaskModal({ open, onClose, onSave, task, categories }: TaskModalProps) {
  const defaultCategory = categories[0] || 'General';
  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: defaultCategory,
    hours: 1,
    aiUsed: false,
    ownership: false,
    outcome: '',
    completed: false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        date: task.date,
        category: task.category,
        hours: task.hours,
        aiUsed: task.aiUsed,
        ownership: task.ownership,
        outcome: task.outcome,
        completed: task.completed,
      });
    } else {
      setFormData({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        category: defaultCategory,
        hours: 1,
        aiUsed: false,
        ownership: false,
        outcome: '',
        completed: false,
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (task) {
      onSave({ ...formData, id: task.id });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="What did you work on?"
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="bg-secondary/50 border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0.25"
                step="0.25"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                required
                className="bg-secondary/50 border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome / Notes</Label>
            <Textarea
              id="outcome"
              value={formData.outcome}
              onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
              placeholder="Describe what was accomplished..."
              rows={3}
              className="bg-secondary/50 border-border resize-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="aiUsed"
                checked={formData.aiUsed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aiUsed: checked as boolean }))}
              />
              <Label htmlFor="aiUsed" className="text-sm cursor-pointer">AI Assisted</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="ownership"
                checked={formData.ownership}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ownership: checked as boolean }))}
              />
              <Label htmlFor="ownership" className="text-sm cursor-pointer">Ownership Task</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="completed"
                checked={formData.completed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, completed: checked as boolean }))}
              />
              <Label htmlFor="completed" className="text-sm cursor-pointer">Completed</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {task ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
