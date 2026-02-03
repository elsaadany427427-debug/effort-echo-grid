import { cn } from '@/lib/utils';
import { Goal } from '@/types/dashboard';

interface GoalProgressProps {
  goals: Goal[];
}

function getProgressColor(progress: number, target: number): string {
  const ratio = progress / target;
  if (ratio >= 0.8) return 'progress-fill-success';
  if (ratio >= 0.5) return 'progress-fill-warning';
  return 'progress-fill-danger';
}

function getStatusBadge(progress: number, target: number): { text: string; className: string } {
  const ratio = progress / target;
  if (ratio >= 0.8) return { text: 'On Track', className: 'bg-status-success/20 text-emerald-400' };
  if (ratio >= 0.5) return { text: 'At Risk', className: 'bg-status-warning/20 text-amber-400' };
  return { text: 'Behind', className: 'bg-status-danger/20 text-rose-400' };
}

export function GoalProgress({ goals }: GoalProgressProps) {
  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-6">Goal Progress</h3>
      <div className="space-y-5">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, (goal.currentProgress / goal.targetValue) * 100);
          const progressColor = getProgressColor(goal.currentProgress, goal.targetValue);
          const status = getStatusBadge(goal.currentProgress, goal.targetValue);
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.className)}>
                    {status.text}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {goal.currentProgress.toFixed(goal.unit === 'hours' ? 1 : 0)} / {goal.targetValue} {goal.unit}
                </span>
              </div>
              <div className="progress-track">
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
