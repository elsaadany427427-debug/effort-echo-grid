import { useState } from 'react';
import { Search, Copy, ClipboardPaste, Download } from 'lucide-react';
import { Task } from '@/types/dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface TaskTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filteredTasks: Task[];
  onImport: (tasks: Omit<Task, 'id'>[]) => Promise<number>;
}

export function TaskTableToolbar({ search, onSearchChange, filteredTasks, onImport }: TaskTableToolbarProps) {
  const { toast } = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  const handleCopy = () => {
    const exportData = filteredTasks.map(({ id, ...rest }) => rest);
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast({ title: `Copied ${exportData.length} tasks to clipboard` });
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importJson);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      
      const tasks: Omit<Task, 'id'>[] = arr.map((t: any) => ({
        name: t.name || '',
        date: t.date || new Date().toISOString().slice(0, 10),
        category: t.category || 'General',
        hours: Number(t.hours) || 0,
        aiUsed: Boolean(t.aiUsed),
        ownership: Boolean(t.ownership),
        outcome: t.outcome || '',
        completed: Boolean(t.completed),
        projectName: t.projectName || '',
      }));

      const count = await onImport(tasks);
      toast({ title: `Imported ${count} tasks successfully` });
      setImportJson('');
      setImportOpen(false);
    } catch {
      toast({ title: 'Invalid JSON format', variant: 'destructive' });
    }
  };

  const handleCsvExport = () => {
    const headers = ['Name', 'Date', 'Category', 'Project', 'Hours', 'AI Used', 'Ownership', 'Outcome', 'Completed'];
    const rows = filteredTasks.map(t => [
      `"${t.name.replace(/"/g, '""')}"`,
      t.date,
      t.category,
      t.projectName,
      t.hours,
      t.aiUsed,
      t.ownership,
      `"${t.outcome.replace(/"/g, '""')}"`,
      t.completed,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${filteredTasks.length} tasks as CSV` });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Task Log</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleCopy} title="Copy tasks as JSON">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setImportOpen(true)} title="Import tasks from JSON">
            <ClipboardPaste className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleCsvExport} title="Export as CSV">
            <Download className="h-4 w-4" />
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Tasks</DialogTitle>
          </DialogHeader>
          <Textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='Paste JSON here (array of tasks copied from "Copy" button)...'
            rows={10}
            className="bg-secondary/50 border-border font-mono text-xs"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} className="bg-primary hover:bg-primary/90">Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
