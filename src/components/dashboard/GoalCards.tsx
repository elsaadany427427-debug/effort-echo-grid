import { Clock, Users, BookOpen, Zap, Award, Shield, Code, TrendingDown, Edit2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoalWithMeta } from './GoalModal';

interface GoalCardsProps {
  goals: GoalWithMeta[];
  onEditGoal: (goal: GoalWithMeta) => void;
  onAddGoal: () => void;
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

export function GoalCards({ goals, onEditGoal, onAddGoal }: GoalCardsProps) {
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
          
          return (
            <div 
              key={goal.id} 
              className="glass-card rounded-xl p-5 animate-fade-in group relative cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => onEditGoal(goal)}
            >
              {/* Edit indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Header with icon and status */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2.5 rounded-lg", colors.bg)}>
                  <IconComponent className={cn("h-5 w-5", colors.icon)} />
                </div>
                <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border", status.className)}>
                  {status.icon && <status.icon className="h-3 w-3" />}
                  {status.text}
                </div>
              </div>
              
              {/* Title and description */}
              <h4 className="font-semibold text-sm mb-1">{goal.title}</h4>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
