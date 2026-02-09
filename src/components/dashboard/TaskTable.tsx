import { useState } from 'react';
import { Edit2, Trash2, Check, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Task } from '@/types/dashboard';
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
import { TaskPagination } from './TaskPagination';
import { TaskTableToolbar } from './TaskTableToolbar';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onImport: (tasks: Omit<Task, 'id'>[]) => Promise<number>;
}

type SortColumn = 'name' | 'category' | 'projectName' | 'hours' | 'date';
type SortDir = 'asc' | 'desc';

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

const getRandomColor = (category: string) => {
  const colors = [
    'bg-chart-rose/20 text-rose-400',
    'bg-chart-amber/20 text-amber-400',
    'bg-chart-teal/20 text-teal-400',
    'bg-chart-violet/20 text-violet-400',
    'bg-chart-blue/20 text-sky-400',
    'bg-chart-emerald/20 text-emerald-400',
    'bg-purple-500/20 text-purple-400',
    'bg-orange-500/20 text-orange-400',
  ];
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

const getCategoryColor = (category: string) => {
  return categoryColors[category] || getRandomColor(category);
};

export function TaskTable({ tasks, onEdit, onDelete, onToggleComplete, onImport }: TaskTableProps) {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortCol, setSortCol] = useState<SortColumn>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(search.toLowerCase()) ||
    task.category.toLowerCase().includes(search.toLowerCase()) ||
    task.outcome.toLowerCase().includes(search.toLowerCase()) ||
    task.projectName.toLowerCase().includes(search.toLowerCase())
  );

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let cmp = 0;
    switch (sortCol) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'category': cmp = a.category.localeCompare(b.category); break;
      case 'projectName': cmp = a.projectName.localeCompare(b.projectName); break;
      case 'hours': cmp = a.hours - b.hours; break;
      case 'date': cmp = a.date.localeCompare(b.date); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sortedTasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const toggleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortCol !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <TaskTableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        filteredTasks={filteredTasks}
        onImport={onImport}
      />
      
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="w-12">Done</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <div className="flex items-center">Task <SortIcon col="name" /></div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('category')}>
                <div className="flex items-center">Category <SortIcon col="category" /></div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('projectName')}>
                <div className="flex items-center">Project <SortIcon col="projectName" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('hours')}>
                <div className="flex items-center justify-end">Hours <SortIcon col="hours" /></div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('date')}>
                <div className="flex items-center">Date <SortIcon col="date" /></div>
              </TableHead>
              <TableHead>AI</TableHead>
              <TableHead>Own</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No tasks found. Add your first task to get started!
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => (
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
                    <Badge variant="secondary" className={cn("border-0", getCategoryColor(task.category))}>
                      {task.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {task.projectName || '—'}
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

      <TaskPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={sortedTasks.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

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
