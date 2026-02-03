import { useState } from 'react';
import { Search, Edit2, Trash2, Check, X } from 'lucide-react';
import { Task, TASK_CATEGORIES } from '@/types/dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const categoryColors: Record<string, string> = {
  'Angular': 'bg-chart-rose/20 text-rose-400',
  'Security': 'bg-chart-amber/20 text-amber-400',
  'Training': 'bg-chart-teal/20 text-teal-400',
  'Meetings': 'bg-chart-violet/20 text-violet-400',
  'Skills': 'bg-chart-blue/20 text-sky-400',
  'Documentation': 'bg-chart-emerald/20 text-emerald-400',
  'Code Review': 'bg-purple-500/20 text-purple-400',
  'Bug Fixes': 'bg-orange-500/20 text-orange-400',
};

export function TaskTable({ tasks, onEdit, onDelete, onToggleComplete }: TaskTableProps) {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(search.toLowerCase()) ||
    task.category.toLowerCase().includes(search.toLowerCase()) ||
    task.outcome.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Task Log</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
      </div>
      
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="w-12">Done</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>AI</TableHead>
              <TableHead>Own</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No tasks found. Add your first task to get started!
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className={cn(task.completed && "opacity-60")}>
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {task.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("border-0", categoryColors[task.category])}>
                      {task.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{task.hours}h</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(task.date), 'MMM d')}
                  </TableCell>
                  <TableCell>
                    {task.aiUsed ? (
                      <Check className="h-4 w-4 text-chart-teal" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {task.ownership ? (
                      <Check className="h-4 w-4 text-chart-amber" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => onEdit(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteId(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/80"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
