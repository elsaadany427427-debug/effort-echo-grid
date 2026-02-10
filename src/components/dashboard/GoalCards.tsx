import { useState } from 'react';
import { Clock, Users, BookOpen, Zap, Award, Shield, Code, TrendingDown, Edit2, Plus, Check, X, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoalWithMeta } from './GoalModal';
import { GoalSubtask } from '@/hooks/useDashboardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface GoalCardsProps {
  goals: GoalWithMeta[];
  subtasks: GoalSubtask[];
  onEditGoal: (goal: GoalWithMeta) => void;
  onAddGoal: () => void;
  onAddSubtask: (goalId: string, name: string) => void;
  onUpdateSubtask: (id: string, updates: Partial<GoalSubtask>) => void;
  onDeleteSubtask: (id: string) => void;
  onCreateTaskFromSubtask: (subtask: GoalSubtask, goalTitle: string) => void;
}

const GOAL_ICONS: Record<string, typeof Clock> = {
  'Logged Effort': Clock,
  'Effective Meetings': Users,
  'Ownership Stories': BookOpen,
  'AI Usage': Zap,
  'Certificate / Training': Award,
  'Personal Skills': Award,
  'Security Improvements': Shield,
  'Angular Contributions': Code,
};

const GOAL_COLORS: Record<string, { icon: string; bg: string }> = {
  'Logged Effort': { icon: 'text-chart-blue', bg: 'bg-chart-blue/10' },
  'Effective Meetings': { icon: 'text-chart-rose', bg: 'bg-chart-rose/10' },
  'Ownership Stories': { icon: 'text-chart-amber', bg: 'bg-chart-amber/10' },
  'AI Usage': { icon: 'text-chart-violet', bg: 'bg-chart-violet/10' },
  'Certificate / Training': { icon: 'text-chart-teal', bg: 'bg-chart-teal/10' },
  'Personal Skills': { icon: 'text-chart-rose', bg: 'bg-chart-rose/10' },
  'Security Improvements': { icon: 'text-chart-amber', bg: 'bg-chart-amber/10' },
  'Angular Contributions': { icon: 'text-chart-rose', bg: 'bg-chart-rose/10' },
};

function getStatusBadge(progress: number, target: number): { text: string; className: string; icon: typeof TrendingDown | null } {
  const ratio = progress / target;
  if (ratio >= 0.8) return { text: 'On Track', className: 'bg-status-success/20 text-emerald-400 border-status-success/30', icon: null };
  if (ratio >= 0.5) return { text: 'At Risk', className: 'bg-status-warning/20 text-amber-400 border-status-warning/30', icon: TrendingDown };
  return { text: 'Behind', className: 'bg-status-danger/20 text-rose-400 border-status-danger/30', icon: TrendingDown };
}

function getProgressColor(progress: number, target: number): string {
  const ratio = progress / target;
  if (ratio >= 0.8) return 'bg-status-success';
  if (ratio >= 0.5) return 'bg-status-warning';
  return 'bg-status-danger';
}

function SubtaskList({ 
  goalId, 
  goalTitle,
  subtasks, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onCreateTask 
}: { 
  goalId: string; 
  goalTitle: string;
  subtasks: GoalSubtask[]; 
  onAdd: (goalId: string, name: string) => void;
  onUpdate: (id: string, updates: Partial<GoalSubtask>) => void;
  onDelete: (id: string) => void;
  onCreateTask: (subtask: GoalSubtask, goalTitle: string) => void;
}) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(goalId, newName.trim());
    setNewName('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    onUpdate(id, { name: editingName.trim() });
    setEditingId(null);
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5" onClick={(e) => e.stopPropagation()}>
      <p className="text-xs font-medium text-muted-foreground mb-2">Subtasks</p>
      
      {subtasks.map((st) => (
        <div key={st.id} className="flex items-center gap-2 group/st">
          <Checkbox
            checked={st.completed}
            onCheckedChange={(checked) => onUpdate(st.id, { completed: !!checked })}
            className="h-3.5 w-3.5"
          />
          {editingId === st.id ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(st.id)}
                className="h-6 text-xs bg-secondary/50 border-border"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleSaveEdit(st.id)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingId(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <span className={cn("text-xs flex-1 truncate", st.completed && "line-through text-muted-foreground")}>
                {st.name}
              </span>
              <div className="hidden group-hover/st:flex items-center gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  title="Create task from this"
                  onClick={() => onCreateTask(st, goalTitle)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() => { setEditingId(st.id); setEditingName(st.name); }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 text-destructive hover:text-destructive"
                  onClick={() => onDelete(st.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Add new subtask inline */}
      <div className="flex items-center gap-1 mt-1">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add subtask..."
          className="h-6 text-xs bg-secondary/50 border-border"
        />
        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={handleAdd} disabled={!newName.trim()}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function GoalCards({ goals, subtasks, onEditGoal, onAddGoal, onAddSubtask, onUpdateSubtask, onDeleteSubtask, onCreateTaskFromSubtask }: GoalCardsProps) {
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  const toggleExpand = (goalId: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Goal Progress</h3>
        <button
          onClick={onAddGoal}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, (goal.currentProgress / goal.targetValue) * 100);
          const status = getStatusBadge(goal.currentProgress, goal.targetValue);
          const progressColor = getProgressColor(goal.currentProgress, goal.targetValue);
          const IconComponent = GOAL_ICONS[goal.title] || Clock;
          const colors = GOAL_COLORS[goal.title] || { icon: 'text-chart-blue', bg: 'bg-chart-blue/10' };
          const goalSubtasks = subtasks.filter(s => s.goalId === goal.id);
          const isExpanded = expandedGoals.has(goal.id);
          
          return (
            <div 
              key={goal.id} 
              className="glass-card rounded-xl p-5 animate-fade-in group relative cursor-pointer hover:border-primary/30 transition-all"
            >
              {/* Edit indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
                  onClick={(e) => { e.stopPropagation(); toggleExpand(goal.id); }}
                  title={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                <button 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
                  onClick={(e) => { e.stopPropagation(); onEditGoal(goal); }}
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              {/* Header with icon and status */}
              <div className="flex items-start justify-between mb-3" onClick={() => onEditGoal(goal)}>
                <div className={cn("p-2.5 rounded-lg", colors.bg)}>
                  <IconComponent className={cn("h-5 w-5", colors.icon)} />
                </div>
                <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border", status.className)}>
                  {status.icon && <status.icon className="h-3 w-3" />}
                  {status.text}
                </div>
              </div>
              
              {/* Title and description */}
              <h4 className="font-semibold text-sm mb-1" onClick={() => onEditGoal(goal)}>{goal.title}</h4>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                {goal.description || `Track your ${goal.title.toLowerCase()}`}
              </p>
              
              {/* Progress values */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{goal.currentProgress}</span>
                  <span className="text-sm text-muted-foreground">
                    / {goal.targetValue} {goal.unit === '%' ? '%' : goal.unit}
                  </span>
                </div>
                <span className={cn("text-sm font-semibold", 
                  progressPercent >= 80 ? 'text-status-success' : 
                  progressPercent >= 50 ? 'text-status-warning' : 'text-status-danger'
                )}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", progressColor)}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Subtask count indicator (collapsed) */}
              {!isExpanded && goalSubtasks.length > 0 && (
                <button 
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => { e.stopPropagation(); toggleExpand(goal.id); }}
                >
                  {goalSubtasks.filter(s => s.completed).length}/{goalSubtasks.length} subtasks done
                </button>
              )}

              {/* Expanded subtasks */}
              {isExpanded && (
                <SubtaskList
                  goalId={goal.id}
                  goalTitle={goal.title}
                  subtasks={goalSubtasks}
                  onAdd={onAddSubtask}
                  onUpdate={onUpdateSubtask}
                  onDelete={onDeleteSubtask}
                  onCreateTask={onCreateTaskFromSubtask}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
